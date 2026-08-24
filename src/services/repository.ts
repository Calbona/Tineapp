/**
 * Repository — 面向对象数据访问层。
 * 封装 JSON 文件读写，对外暴露模型实例。
 */
import World, { WorldConfig } from '../models/World.ts';
import Character from '../models/Character.ts';
import WorldEvent from '../models/WorldEvent.ts';
import State from '../models/State.ts';
import Organization from '../models/Organization.ts';
import Tag from '../models/Tag.ts';
import MapTile from '../models/MapTile.ts';
import TimeSpan from '../models/TimeSpan.ts';
import type {
	JsonWorldData, JsonCharacterData, JsonWorldEvent,
	JsonStateData, JsonOrgData, JsonTagData, JsonMapTile,
} from './data-manager.ts';
import { info, warn as logWarn } from './logger.ts';

const SEEDED_KEY = 'tineapp-seeded-v4';

// ═══════════════════ JSON 文件读写 ═══════════════════

async function readJSON<T>(path: string): Promise<T> {
	if (window.appAPI) {
		return JSON.parse(await window.appAPI.readFile(`public/${path}`)) as T;
	}
	// 浏览器模式：先查 localStorage 缓存，再回退 fetch 静态文件
	const key = `file:${path}`;
	const cached = localStorage.getItem(key);
	if (cached) return JSON.parse(cached) as T;
	const res = await fetch(`/${path}`);
	if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
	const data = await res.json() as T;
	localStorage.setItem(key, JSON.stringify(data)); // 首次加载后缓存
	return data;
}

async function writeJSON(path: string, data: unknown): Promise<void> {
	const content = JSON.stringify(data, null, '\t') + '\n';
	if (window.appAPI) {
		await window.appAPI.writeFile(`public/${path}`, content);
	} else {
		localStorage.setItem(`file:${path}`, content);
	}
}

async function deleteJSON(path: string): Promise<void> {
	if (window.appAPI) {
		// Electron: 无法直接删文件，写空标记
	} else {
		localStorage.removeItem(`file:${path}`);
	}
}

async function listDir(dirPath: string): Promise<string[]> {
	if (window.appAPI) {
		return window.appAPI.listFiles(`public/${dirPath}`);
	}
	try {
		return await readJSON<string[]>(`${dirPath}/index.json`);
	} catch { return []; }
}

async function exists(path: string): Promise<boolean> {
	if (window.appAPI) return window.appAPI.exists(`public/${path}`);
	return localStorage.getItem(`file:${path}`) !== null;
}

// ═══════════════════ 索引 ═══════════════════

async function readIndex(dir: string): Promise<Record<string, string[]>> {
	try {
		return await readJSON<Record<string, string[]>>(`data/${dir}/index.json`);
	} catch { return {}; }
}

async function writeIndex(dir: string, index: Record<string, string[]>): Promise<void> {
	await writeJSON(`data/${dir}/index.json`, index);
}

// ═══════════════════ 缓存 ═══════════════════

const cache = new Map<string, unknown>();

// ═══════════════════ World Repository ═══════════════════

export async function listWorlds(): Promise<World[]> {
	const files = await listDir('data/worlds');
	const worlds: World[] = [];
	const mapKey = 'world-file-map';
	const fileMap: Record<string, string> = {};
	for (const f of files) {
		if (f === 'index.json' || f === '_all.json') continue;
		try {
			const json = await readJSON<JsonWorldData>(`data/worlds/${f}`);
			const w = World.fromJSON(json);
			worlds.push(w);
			fileMap[String(w.id)] = f;
		} catch { /* skip */ }
	}
	localStorage.setItem(mapKey, JSON.stringify(fileMap));
	return worlds.sort((a, b) => a.id - b.id);
}

export async function getWorld(id: number): Promise<World | undefined> {
	const worlds = await listWorlds();
	return worlds.find(w => w.id === id);
}

export async function saveWorld(world: World): Promise<void> {
	const json = world.toJSON();
	const fname = `${world.getName('zh_CN') || `World${world.id}`}.json`;
	await writeJSON(`data/worlds/${fname}`, json);

	// worlds 索引是 string[] 格式。通过映射表追踪旧文件名，精确替换。
	const mapKey = `world-file-map`;
	let fileMap: Record<string, string> = {};
	try { fileMap = JSON.parse(localStorage.getItem(mapKey) || '{}'); } catch { /* ok */ }
	const oldFname = fileMap[String(world.id)];

	let files: string[] = [];
	try {
		const raw = await readJSON<unknown>(`data/worlds/index.json`);
		if (Array.isArray(raw)) files = raw.map(String);
		else if (raw && typeof raw === 'object') files = Object.values(raw as Record<string, unknown>).flat().map(String);
	} catch { /* 索引不存在则新建 */ }

	// 移除旧文件，添加新文件
	const clean = files.filter(f => f !== fname && f !== oldFname);
	clean.push(fname);
	await writeJSON(`data/worlds/index.json`, clean);

	// 更新映射
	fileMap[String(world.id)] = fname;
	localStorage.setItem(mapKey, JSON.stringify(fileMap));

	info('data', `保存世界：${world.getName('zh_CN')}`);
}

export async function deleteWorld(id: number): Promise<void> {
	// 删除世界文件
	const worlds = await listWorlds();
	const target = worlds.find(w => w.id === id);
	if (target) {
		const fname = `${target.getName('zh_CN') || `World${id}`}.json`;
		await deleteJSON(`data/worlds/${fname}`);
	}

	// worlds 索引清理（通过映射表精确删除）
	const mapKey = 'world-file-map';
	let fileMap: Record<string, string> = {};
	try { fileMap = JSON.parse(localStorage.getItem(mapKey) || '{}'); } catch { /* ok */ }
	const oldFname = fileMap[String(id)];
	delete fileMap[String(id)];
	localStorage.setItem(mapKey, JSON.stringify(fileMap));

	const idx = await readJSON<string[]>(`data/worlds/index.json`).catch(() => [] as string[]);
	if (Array.isArray(idx) && oldFname) {
		await writeJSON(`data/worlds/index.json`, idx.filter(f => f !== oldFname));
	}

	// 清理关联实体索引（Record 格式）
	for (const dir of ['characters', 'events', 'states', 'organizations', 'regions']) {
		const dix = await readIndex(dir);
		delete dix[String(id)];
		await writeIndex(dir, dix);
	}

	// 清理该世界标签
	const allTags = await listTags();
	const filtered = allTags.filter(t => t.world !== id);
	saveTags(filtered);

	info('data', `删除世界 #${id} 及其全部关联数据`);
}

export async function getNextWorldId(): Promise<number> {
	const worlds = await listWorlds();
	return worlds.length > 0 ? Math.max(...worlds.map(w => w.id)) + 1 : 0;
}

// ═══════════════════ Character Repository ═══════════════════

export async function listCharacters(worldId: number): Promise<Character[]> {
	const index = await readIndex('characters');
	const files = index[String(worldId)] ?? [];
	const chars: Character[] = [];
	for (const f of files) {
		try {
			const json = await readJSON<JsonCharacterData>(`data/characters/${f}`);
			chars.push(Character.fromJSON(json));
		} catch { /* skip */ }
	}
	return chars.sort((a, b) => a.id - b.id);
}

export async function saveCharacter(char: Character): Promise<void> {
	const json = char.toJSON();
	const fname = `Character${char.worldId}_${char.id}.json`;
	await writeJSON(`data/characters/${fname}`, json);

	const index = await readIndex('characters');
	const key = String(char.worldId);
	if (!index[key]) index[key] = [];
	if (!index[key].includes(fname)) index[key].push(fname);
	await writeIndex('characters', index);
}

export async function saveCharacters(worldId: number, chars: Character[]): Promise<void> {
	for (const ch of chars) await saveCharacter(ch);
	info('data', `保存角色：世界 #${worldId}，${chars.length} 个`);
}

export async function getNextCharId(worldId: number): Promise<number> {
	const chars = await listCharacters(worldId);
	return chars.length > 0 ? Math.max(...chars.map(c => c.id)) + 1 : 0;
}

// ═══════════════════ WorldEvent Repository ═══════════════════

export async function listWorldEvents(worldId: number): Promise<WorldEvent[]> {
	const index = await readIndex('events');
	const files = index[String(worldId)] ?? [];
	const events: WorldEvent[] = [];
	for (const f of files) {
		try {
			const json = await readJSON<JsonWorldEvent>(`data/events/${f}`);
			events.push(WorldEvent.fromJSON(json, worldId));
		} catch { /* skip */ }
	}
	return events.sort((a, b) => a.span.start.sortKey - b.span.start.sortKey);
}

export async function saveWorldEvent(event: WorldEvent): Promise<void> {
	const json = event.toJSON();
	const fname = `Event_${event.id}.json`;
	await writeJSON(`data/events/${fname}`, json);

	const index = await readIndex('events');
	const key = String(event.worldId);
	if (!index[key]) index[key] = [];
	if (!index[key].includes(fname)) index[key].push(fname);
	await writeIndex('events', index);
}

export async function saveWorldEvents(worldId: number, events: WorldEvent[]): Promise<void> {
	for (const e of events) await saveWorldEvent(e);
	info('data', `保存世界事件：世界 #${worldId}，${events.length} 个`);
}

export async function deleteWorldEvent(event: WorldEvent): Promise<void> {
	const fname = `Event_${event.id}.json`;
	await deleteJSON(`data/events/${fname}`);
	const index = await readIndex('events');
	const key = String(event.worldId);
	if (index[key]) {
		index[key] = index[key].filter(f => f !== fname);
		if (index[key].length === 0) delete index[key];
	}
	await writeIndex('events', index);
}

// ═══════════════════ State Repository ═══════════════════

export async function listStates(worldId: number): Promise<State[]> {
	const index = await readIndex('states');
	const files = index[String(worldId)] ?? [];
	const states: State[] = [];
	for (const f of files) {
		try {
			const json = await readJSON<JsonStateData>(`data/states/${f}`);
			states.push(State.fromJSON(json, worldId));
		} catch { /* skip */ }
	}
	return states;
}

export async function saveState(state: State): Promise<void> {
	const json = state.toJSON();
	const fname = `State_${state.id}.json`;
	await writeJSON(`data/states/${fname}`, json);

	const index = await readIndex('states');
	const key = String(state.worldId);
	if (!index[key]) index[key] = [];
	if (!index[key].includes(fname)) index[key].push(fname);
	await writeIndex('states', index);
}

export async function saveStates(worldId: number, states: State[]): Promise<void> {
	for (const s of states) await saveState(s);
	info('data', `保存国家：世界 #${worldId}，${states.length} 个`);
}

export async function deleteState(state: State): Promise<void> {
	const fname = `State_${state.id}.json`;
	await deleteJSON(`data/states/${fname}`);
	const index = await readIndex('states');
	const key = String(state.worldId);
	if (index[key]) {
		index[key] = index[key].filter(f => f !== fname);
		if (index[key].length === 0) delete index[key];
	}
	await writeIndex('states', index);
}

// ═══════════════════ Organization Repository ═══════════════════

export async function listOrganizations(worldId: number): Promise<Organization[]> {
	const index = await readIndex('organizations');
	const files = index[String(worldId)] ?? [];
	const orgs: Organization[] = [];
	for (const f of files) {
		try {
			const json = await readJSON<JsonOrgData>(`data/organizations/${f}`);
			orgs.push(Organization.fromJSON(json, worldId));
		} catch { /* skip */ }
	}
	return orgs;
}

export async function saveOrganization(org: Organization): Promise<void> {
	const json = org.toJSON();
	const fname = `Org_${org.id}.json`;
	await writeJSON(`data/organizations/${fname}`, json);

	const index = await readIndex('organizations');
	const key = String(org.worldId);
	if (!index[key]) index[key] = [];
	if (!index[key].includes(fname)) index[key].push(fname);
	await writeIndex('organizations', index);
}

export async function saveOrganizations(worldId: number, orgs: Organization[]): Promise<void> {
	for (const o of orgs) await saveOrganization(o);
	info('data', `保存组织：世界 #${worldId}，${orgs.length} 个`);
}

export async function deleteOrganization(org: Organization): Promise<void> {
	const fname = `Org_${org.id}.json`;
	await deleteJSON(`data/organizations/${fname}`);
	const index = await readIndex('organizations');
	const key = String(org.worldId);
	if (index[key]) {
		index[key] = index[key].filter(f => f !== fname);
		if (index[key].length === 0) delete index[key];
	}
	await writeIndex('organizations', index);
}

// ═══════════════════ MapTile Repository ═══════════════════

export async function listMapTiles(worldId: number): Promise<MapTile[]> {
	const index = await readIndex('regions');
	const files = index[String(worldId)] ?? [];
	const tiles: MapTile[] = [];
	for (const f of files) {
		const match = f.match(/^(\d{3})-(\d{3})\.json$/);
		if (!match) continue;
		const x = Number(match[1]);
		const y = Number(match[2]);
		try {
			const json = await readJSON<JsonMapTile>(`data/regions/${f}`);
			tiles.push(MapTile.fromJSON(json, worldId, x, y));
		} catch { /* skip */ }
	}
	return tiles;
}

export async function saveMapTile(tile: MapTile): Promise<void> {
	const fname = `${tile.filename}.json`;
	await writeJSON(`data/regions/${fname}`, tile.toJSON());

	const index = await readIndex('regions');
	const key = String(tile.worldId);
	if (!index[key]) index[key] = [];
	if (!index[key].includes(fname)) index[key].push(fname);
	await writeIndex('regions', index);
}

export async function deleteMapTile(tile: MapTile): Promise<void> {
	const fname = `${tile.filename}.json`;
	const index = await readIndex('regions');
	const key = String(tile.worldId);
	if (index[key]) {
		index[key] = index[key].filter(f => f !== fname);
		if (index[key].length === 0) delete index[key];
	}
	await writeIndex('regions', index);
}

// ═══════════════════ Tag Repository ═══════════════════

let _tagsCache: Tag[] | null = null;

export async function listTags(): Promise<Tag[]> {
	if (_tagsCache !== null) return _tagsCache;
	const stored = localStorage.getItem('tineapp-tags');
	if (stored) {
		_tagsCache = (JSON.parse(stored) as JsonTagData[]).map(t => Tag.fromJSON(t));
		return _tagsCache;
	}
	// 从种子文件加载，并持久化到 localStorage
	const loaded: Tag[] = [];
	const files = await listDir('data/tags');
	for (const f of files) {
		if (f === 'index.json') continue;
		try {
			const json = await readJSON<JsonTagData>(`data/tags/${f}`);
			loaded.push(Tag.fromJSON(json));
		} catch { /* skip */ }
	}
	_tagsCache = loaded;
	if (loaded.length > 0) {
		localStorage.setItem('tineapp-tags', JSON.stringify(loaded.map(t => t.toJSON())));
	}
	return _tagsCache;
}

export function saveTags(tags: Tag[]): void {
	_tagsCache = tags;
	localStorage.setItem('tineapp-tags', JSON.stringify(tags.map(t => t.toJSON())));
}

// ═══════════════════ 种子加载 ═══════════════════

export async function seedFromFiles(): Promise<void> {
	if (localStorage.getItem(SEEDED_KEY)) return;
	try {
		const worlds = await listWorlds();
		for (const w of worlds) {
			const chars = await listCharacters(w.id);
			const events = await listWorldEvents(w.id);
			const states = await listStates(w.id);
			const orgs = await listOrganizations(w.id);
			info('data', `种子加载：世界 "${w.getName('zh_CN')}" — ${chars.length} 角色, ${events.length} 事件, ${states.length} 国家, ${orgs.length} 组织`);
		}
		const tags = await listTags();
		info('data', `种子加载完成：${worlds.length} 个世界, ${tags.length} 个标签`);
		localStorage.setItem(SEEDED_KEY, '1');
	} catch (e) {
		logWarn('data', `种子加载失败：${(e as Error).message}`);
	}
}
