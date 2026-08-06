/**
 * 地图浏览 — 只读。世界选择 + 时间过滤 + 领土着色 + 地块名称展示。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listStates, listMapTiles } from '../../services/repository.ts';
import MapTile from '../../models/MapTile.ts';
import State from '../../models/State.ts';
import World from '../../models/World.ts';
import { loadSettings } from '../../services/config-loader.ts';

export const MapViewPage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', '地图'),
			(() => { const m = div('tl-main'); m.innerHTML = '<div class="tl-loading">加载中…</div>'; initView(m); return m; })(),
		);
	},
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) { main.innerHTML = '<div class="tl-empty">暂无世界数据</div>'; return; }
		let current = worlds[0];
		let states = await listStates(current.id);
		let tiles = await listMapTiles(current.id);
		let tileMap = buildTileMap(tiles);
		renderUI(main, worlds, current, states, tileMap);

		const sel = main.querySelector('.tl-world-select') as HTMLSelectElement | null;
		if (!sel) return;
		sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return;
			current = w;
			states = await listStates(current.id);
			tiles = await listMapTiles(current.id);
			tileMap = buildTileMap(tiles);
			renderMapContent(main, current, states, tileMap);
		});
	} catch (err) { main.innerHTML = `<div class="tl-error">加载失败：${(err as Error).message}</div>`; }
}

function buildTileMap(tiles: MapTile[]): Map<string, MapTile> {
	const m = new Map<string, MapTile>();
	for (const t of tiles) m.set(t.coord, t);
	return m;
}

function renderUI(
	main: HTMLElement, worlds: World[], current: World,
	states: State[], tileMap: Map<string, MapTile>,
) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'tl-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN');
		if (w.id === current.id) o.selected = true; sel.append(o);
	}
	main.append(div('tl-world-bar', h('label', 'tl-world-label', '选择世界：'), sel));
	renderMapContent(main, current, states, tileMap);
}

function renderMapContent(
	main: HTMLElement, current: World,
	states: State[], tileMap: Map<string, MapTile>,
) {
	const old = main.querySelectorAll('.map-time-bar, .map-area, .map-legend');
	old.forEach(e => e.remove());

	const mapW = current.config.mapWidth;
	const mapH = current.config.mapHeight;
	const palette = loadSettings().colorPalette;

	const yInp = document.createElement('input'); yInp.type = 'number'; yInp.className = 'text-input'; yInp.style.width = '70px'; yInp.placeholder = '年'; yInp.value = '0';
	const mInp = document.createElement('input'); mInp.type = 'number'; mInp.className = 'text-input'; mInp.style.width = '50px'; mInp.placeholder = '月';
	const dInp = document.createElement('input'); dInp.type = 'number'; dInp.className = 'text-input'; mInp.style.width = '50px'; dInp.placeholder = '日';
	const timeBar = div('form-row map-time-bar', h('label', 'form-label', '观察时间'), yInp, mInp, dInp);

	const mapArea = div('map-area'); mapArea.style.cssText = 'position:relative;border:2px solid #333;overflow:auto;background:#1a1a2e;min-height:400px';
	const legend = div('map-legend');

	main.append(timeBar, mapArea, legend);

	const doRender = () => {
		const obsYear = Number(yInp.value) || 0;
		const obsMonth = mInp.value ? Number(mInp.value) : undefined;
		const obsDay = dInp.value ? Number(dInp.value) : undefined;
		const obsKey = obsYear * 10000 + (obsMonth ?? 1) * 100 + (obsDay ?? 1);

		const ownership = new Map<string, { stateId: string; stateName: string; color: string }>();
		let ci = 0;
		for (const s of states) {
			const color = palette[ci % palette.length]; ci++;
			for (const t of s.territories) {
				const tsk = t.span.start.year * 10000 + (t.span.start.month ?? 1) * 100 + (t.span.start.day ?? 1);
				const tek = t.span.end ? t.span.end.year * 10000 + (t.span.end.month ?? 12) * 100 + (t.span.end.day ?? 30) : Infinity;
				if (obsKey >= tsk && obsKey <= tek) {
					for (const r of t.regions) ownership.set(r.id, { stateId: s.id, stateName: s.getName('zh_CN'), color });
				}
			}
		}

		const tileSize = Math.min(48, Math.floor(700 / Math.max(mapW, mapH, 1)));
		const coords: { x: number; y: number; id: string }[] = [];
		for (let iy = 0; iy < mapH; iy++) for (let ix = 0; ix < mapW; ix++) coords.push({ x: ix, y: iy, id: `${ix}, ${iy}` });

		mapArea.innerHTML = '';
		mapArea.style.width = `${mapW * tileSize + 4}px`;
		mapArea.style.height = `${mapH * tileSize + 4}px`;

		for (const { x, y, id } of coords) {
			const owner = ownership.get(id);
			const tile = tileMap.get(id);
			const el = document.createElement('div');
			const bg = owner ? owner.color : '#2a2a3e';
			el.style.cssText = `position:absolute;left:${x * tileSize}px;top:${y * tileSize}px;width:${tileSize - 1}px;height:${tileSize - 1}px;background:${bg};cursor:pointer;border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:${Math.max(8, tileSize * 0.22)}px;color:rgba(255,255,255,0.85);overflow:hidden;text-align:center`;
			const label = tile ? tile.getName('zh_CN') : '';
			if (label && tileSize >= 30) el.textContent = label.length > 6 ? label.slice(0, 5) + '…' : label;
			const stateName = owner ? owner.stateName : '无主';
			const tileName = tile ? tile.getName('zh_CN') : '未命名';
			el.title = `${tileName}\n坐标: ${id}\n${owner ? '属于: ' + stateName : '无国家'}`;
			el.addEventListener('dblclick', () => { if (owner) { sessionStorage.setItem('tineapp-editor-stateId', owner.stateId); window.location.hash = '#browser/state'; } });
			mapArea.appendChild(el);
		}

		const seen = new Set<string>(); legend.innerHTML = '';
		for (const [, o] of ownership) {
			if (seen.has(o.stateId)) continue; seen.add(o.stateId);
			const item = document.createElement('span'); item.className = 'map-legend-item';
			item.innerHTML = `<span style="display:inline-block;width:12px;height:12px;background:${o.color};margin-right:4px;border-radius:2px"></span>${o.stateName}`;
			legend.appendChild(item);
		}
	};

	[yInp, mInp, dInp].forEach(i => i.addEventListener('input', doRender));
	doRender();
}
