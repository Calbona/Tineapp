/**
 * 数据查看器 — 按世界浏览 public/data/ 中的 JSON 文件。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds } from '../../services/repository.ts';
import World from '../../models/World.ts';
import './data-viewer.css';

interface FileEntry { name: string; dir: string; content?: string }

export const DataViewerPage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', '数据查看器'),
			(() => { const m = div('ch-main'); m.innerHTML = '<div class="ch-loading">加载中…</div>'; initView(m); return m; })(),
		);
	},
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) { main.innerHTML = '<div class="ch-empty">暂无世界数据</div>'; return; }
		let current = worlds[0];
		let files = await loadFiles(current.id);
		renderUI(main, worlds, current, files);

		const sel = main.querySelector('.ch-world-select') as HTMLSelectElement | null;
		if (!sel) return;
		sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return; current = w;
			files = await loadFiles(current.id);
			renderFileList(main.querySelector('.cv-char-list') as HTMLElement, files, main.querySelector('.cv-detail') as HTMLElement);
		});
	} catch (err) { main.innerHTML = `<div class="ch-error">加载失败：${(err as Error).message}</div>`; }
}

async function loadFiles(worldId: number): Promise<FileEntry[]> {
	const files: FileEntry[] = [];
	const worldKey = String(worldId);

	// world 文件（索引格式：string[]）
	try {
		const res = await fetch('/data/worlds/index.json');
		if (res.ok) {
			const list = await res.json() as string[];
			for (const f of list) {
				try {
					const r = await fetch(`/data/worlds/${f}`);
					if (r.ok) files.push({ name: f, dir: 'worlds', content: await r.text() });
				} catch { files.push({ name: f, dir: 'worlds' }); }
			}
		}
	} catch { /* skip */ }

	// 其他目录（索引格式：Record<string, string[]>）
	for (const dir of ['characters', 'events', 'states', 'organizations', 'regions']) {
		try {
			const res = await fetch(`/data/${dir}/index.json`);
			if (!res.ok) continue;
			const idx = await res.json() as Record<string, string[]>;
			for (const f of idx[worldKey] ?? []) {
				try {
					const r = await fetch(`/data/${dir}/${f}`);
					if (r.ok) files.push({ name: f, dir, content: await r.text() });
				} catch { files.push({ name: f, dir }); }
			}
		} catch { /* skip */ }
	}

	// tags 索引是 string[] 格式，需按 world 字段过滤
	try {
		const res = await fetch('/data/tags/index.json');
		if (res.ok) {
			const list = await res.json() as string[];
			for (const f of list) {
				try {
					const r = await fetch(`/data/tags/${f}`);
					if (r.ok) {
						const text = await r.text();
						const tag = JSON.parse(text) as { world: number };
						if (tag.world === worldId) files.push({ name: f, dir: 'tags', content: text });
					}
				} catch { /* skip */ }
			}
		}
	} catch { /* skip */ }

	files.sort((a, b) => a.dir.localeCompare(b.dir) || a.name.localeCompare(b.name));
	return files;
}

function renderUI(main: HTMLElement, worlds: World[], current: World, files: FileEntry[]) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'ch-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN'); if (w.id === current.id) o.selected = true; sel.append(o);
	}
	main.append(div('ch-world-bar', h('label', 'ch-world-label', '选择世界：'), sel, h('span', 'ch-event-count', `${files.length} 个文件`)));

	const content = div('cv-content');
	const listEl = div('cv-char-list');
	const viewerEl = div('cv-detail');
	viewerEl.innerHTML = '<div class="cv-placeholder">← 点击左侧文件查看内容</div>';
	content.append(listEl, viewerEl);
	main.append(content);
	renderFileList(listEl, files, viewerEl);
}

function renderFileList(listEl: HTMLElement, files: FileEntry[], viewerEl: HTMLElement) {
	listEl.innerHTML = '';
	let lastDir = '';
	for (const f of files) {
		if (f.dir !== lastDir) {
			lastDir = f.dir;
			const header = document.createElement('div');
			header.className = 'dv-dir-header';
			header.textContent = f.dir;
			listEl.appendChild(header);
		}
		const item = div('cv-char-item');
		item.innerHTML = `<div class="cv-char-name" style="font-size:0.82rem">${f.name}</div>`;
		item.addEventListener('click', () => {
			listEl.querySelectorAll('.cv-char-item').forEach(el => el.classList.remove('active'));
			item.classList.add('active');
			if (f.content) {
				try {
					const parsed = JSON.parse(f.content);
					viewerEl.innerHTML = `<h2 class="cv-detail-name">${f.dir}/${f.name}</h2><pre class="dv-json-pre">${escapeHtml(JSON.stringify(parsed, null, '\t'))}</pre>`;
				} catch {
					viewerEl.innerHTML = `<h2 class="cv-detail-name">${f.dir}/${f.name}</h2><pre class="dv-json-pre">${escapeHtml(f.content)}</pre>`;
				}
			} else {
				viewerEl.innerHTML = `<h2 class="cv-detail-name">${f.dir}/${f.name}</h2><div class="cv-empty">无法加载</div>`;
			}
		});
		listEl.appendChild(item);
	}
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
