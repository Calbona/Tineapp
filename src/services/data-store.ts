/**
 * 数据存储 — localStorage 为主数据库，Electron 下同步到文件。
 * 首次启动从 public/data/ 种子 JSON 加载，之后读写 localStorage。
 */
import type { JsonWorldData, JsonCharacterData, JsonTagData } from './data-manager.ts';
import { info, warn as logWarn } from './logger.ts';

const WORLDS_KEY = 'tineapp-worlds';
const CHARS_PREFIX = 'tineapp-chars-';
const SEEDED_KEY = 'tineapp-seeded-v3';

let _worlds: JsonWorldData[] | null = null;
const _characters = new Map<number, JsonCharacterData[]>();

/** 获取所有世界 */
export async function getWorlds(): Promise<JsonWorldData[]> {
	if (_worlds) return _worlds;
	const stored = localStorage.getItem(WORLDS_KEY);
	if (stored) {
		_worlds = JSON.parse(stored) as JsonWorldData[];
		return _worlds!;
	}
	await seedFromFiles();
	return _worlds!;
}

export function getWorldsSync(): JsonWorldData[] | null {
	return _worlds;
}

/** 保存所有世界 */
export async function saveWorlds(worlds: JsonWorldData[]): Promise<void> {
	_worlds = worlds;
	localStorage.setItem(WORLDS_KEY, JSON.stringify(worlds));
	info('data', `保存世界：${worlds.length} 个`);
	if (window.appAPI) {
		await window.appAPI.writeFile('public/data/worlds/_all.json', JSON.stringify(worlds, null, '\t') + '\n');
		for (const w of worlds) {
			const fname = `${w.name?.zh_CN || `World${w.id}`}.json`;
			await window.appAPI.writeFile(`public/data/worlds/${fname}`, JSON.stringify(w, null, '\t') + '\n');
		}
		const idx = worlds.map(w => `${w.name?.zh_CN || `World${w.id}`}.json`);
		await window.appAPI.writeFile('public/data/worlds/index.json', JSON.stringify(idx, null, '\t') + '\n');
	}
}

export async function getWorldById(id: number): Promise<JsonWorldData | undefined> {
	const worlds = await getWorlds();
	return worlds.find(w => w.id === id);
}

export async function deleteWorld(id: number): Promise<void> {
	const worlds = await getWorlds();
	const idx = worlds.findIndex(w => w.id === id);
	if (idx >= 0) {
		worlds.splice(idx, 1);
		await saveWorlds(worlds);
	}
	localStorage.removeItem(CHARS_PREFIX + id);
	_characters.delete(id);
	info('data', `删除世界 #${id}`);
}

export async function getNextWorldId(): Promise<number> {
	const worlds = await getWorlds();
	return worlds.length > 0 ? Math.max(...worlds.map(w => w.id)) + 1 : 0;
}

/** 获取某世界的全部角色 */
export async function getCharacters(worldId: number): Promise<JsonCharacterData[]> {
	if (_characters.has(worldId)) return _characters.get(worldId)!;
	const stored = localStorage.getItem(CHARS_PREFIX + worldId);
	if (stored) {
		_characters.set(worldId, JSON.parse(stored) as JsonCharacterData[]);
		return _characters.get(worldId)!;
	}
	await seedFromFiles();
	return _characters.get(worldId) ?? [];
}

/** 保存某世界的全部角色 */
export async function saveCharacters(worldId: number, chars: JsonCharacterData[]): Promise<void> {
	_characters.set(worldId, chars);
	localStorage.setItem(CHARS_PREFIX + worldId, JSON.stringify(chars));
	info('data', `保存角色：世界 #${worldId}，${chars.length} 个`);
	if (window.appAPI) {
		for (const ch of chars) {
			const fname = `Character${worldId}_${ch.id}.json`;
			await window.appAPI.writeFile(`public/data/characters/${fname}`, JSON.stringify(ch, null, '\t') + '\n');
		}
		const idx: Record<string, string[]> = {};
		idx[String(worldId)] = chars.map(ch => `Character${worldId}_${ch.id}.json`);
		await window.appAPI.writeFile('public/data/characters/index.json', JSON.stringify(idx, null, '\t') + '\n');
	}
}

export async function getNextCharId(worldId: number): Promise<number> {
	const chars = await getCharacters(worldId);
	return chars.length > 0 ? Math.max(...chars.map(c => c.id)) + 1 : 0;
}

// ═══════════════════ 标签 ═══════════════════

export type { JsonTagData as TagEntry };

const TAGS_KEY = 'tineapp-tags';

let _tags: JsonTagData[] | null = null;

export async function getTags(): Promise<JsonTagData[]> {
	if (_tags) return _tags;
	const raw = localStorage.getItem(TAGS_KEY);
	if (raw) {
		_tags = JSON.parse(raw) as JsonTagData[];
		return _tags;
	}
	_tags = [];
	try {
		if (window.appAPI) {
			const files = await window.appAPI.listFiles('public/data/tags');
			for (const f of files) {
				if (f === 'index.json') continue;
				try {
					_tags.push(JSON.parse(await window.appAPI.readFile(`public/data/tags/${f}`)) as JsonTagData);
				} catch { /* skip */ }
			}
		} else {
			try {
				const idxRes = await fetch('/data/tags/index.json');
				if (idxRes.ok) {
					for (const f of await idxRes.json() as string[]) {
						try {
							const res = await fetch(`/data/tags/${f}`);
							if (res.ok) _tags.push(await res.json() as JsonTagData);
						} catch { /* skip */ }
					}
				}
			} catch { /* skip */ }
		}
	} catch { /* skip */ }
	if (_tags.length > 0) saveTags(_tags);
	return _tags;
}

/**
 * 递归解析标签的角色 ID 集合。
 * tags 是 string[]（扁平），characters 是 number[]（扁平）。
 */
export function resolveTagCharacterIds(tag: JsonTagData, allTags: JsonTagData[]): number[] {
	const ids = new Set<number>();
	if (tag.name === 'ALL' && (!tag.characters || tag.characters.length === 0)) return [];
	for (const id of tag.characters ?? []) ids.add(id);
	for (const refName of tag.tags ?? []) {
		const ref = allTags.find(a => a.world === tag.world && a.name === refName);
		if (ref) for (const id of resolveTagCharacterIds(ref, allTags)) ids.add(id);
	}
	return [...ids];
}

export function saveTags(tags: JsonTagData[]): void {
	_tags = tags;
	localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

// ═══════════════════ 种子加载 ═══════════════════

async function seedFromFiles(): Promise<void> {
	if (localStorage.getItem(SEEDED_KEY)) return;
	try {
		let worlds: JsonWorldData[] = [];
		const allChars = new Map<number, JsonCharacterData[]>();

		if (window.appAPI) {
			const wfiles = await window.appAPI.listFiles('public/data/worlds');
			for (const f of wfiles) {
				if (f === 'index.json' || f === '_all.json') continue;
				try {
					const text = await window.appAPI.readFile(`public/data/worlds/${f}`);
					worlds.push(JSON.parse(text) as JsonWorldData);
				} catch { /* skip */ }
			}
			const cfiles = await window.appAPI.listFiles('public/data/characters');
			for (const f of cfiles) {
				if (f === 'index.json') continue;
				try {
					const text = await window.appAPI.readFile(`public/data/characters/${f}`);
					const ch = JSON.parse(text) as JsonCharacterData;
					if (!allChars.has(ch.world)) allChars.set(ch.world, []);
					allChars.get(ch.world)!.push(ch);
				} catch { /* skip */ }
			}
		} else {
			try {
				const idxRes = await fetch('/data/worlds/index.json');
				const wfiles: string[] = await idxRes.json();
				for (const f of wfiles) {
					try {
						const res = await fetch(`/data/worlds/${f}`);
						worlds.push(await res.json() as JsonWorldData);
					} catch { /* skip */ }
				}
			} catch { /* no seed data */ }
			try {
				const idxRes = await fetch('/data/characters/index.json');
				const cIdx: Record<string, string[]> = await idxRes.json();
				for (const [wid, files] of Object.entries(cIdx)) {
					const chars: JsonCharacterData[] = [];
					for (const f of files) {
						try {
							const res = await fetch(`/data/characters/${f}`);
							chars.push(await res.json() as JsonCharacterData);
						} catch { /* skip */ }
					}
					allChars.set(Number(wid), chars);
				}
			} catch { /* no seed data */ }
		}

		_worlds = worlds;
		for (const [wid, chars] of allChars) {
			_characters.set(wid, chars);
		}
		localStorage.setItem(SEEDED_KEY, '1');
		localStorage.setItem(WORLDS_KEY, JSON.stringify(worlds));
		for (const [wid, chars] of allChars) {
			localStorage.setItem(CHARS_PREFIX + wid, JSON.stringify(chars));
		}
		info('data', `种子加载完成：${worlds.length} 个世界`);
	} catch {
		logWarn('data', '种子加载失败，从空数据库启动');
	}
	_worlds = _worlds ?? [];
}
