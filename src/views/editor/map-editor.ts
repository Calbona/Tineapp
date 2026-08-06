/**
 * 地图编辑器 — 在当前编辑的世界中为地块命名。
 * 从世界编辑器"打开地图"按钮进入，无世界选择栏。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listStates, listMapTiles, saveMapTile, deleteMapTile, getWorld } from '../../services/repository.ts';
import MapTile from '../../models/MapTile.ts';
import State from '../../models/State.ts';
import { loadSettings } from '../../services/config-loader.ts';
import { KEYS } from './common.ts';

export const MapEditorPage: Page = {
	async render(container: HTMLElement) {
		const worldId = Number(sessionStorage.getItem(KEYS.WORLD_ID) ?? '0');
		const w = await getWorld(worldId);
		if (!w) { container.innerHTML = '<div class="ch-error">世界未找到（请先保存世界）</div>'; return; }

		const worldName = w.getName('zh_CN');
		const mapW = w.config.mapWidth;
		const mapH = w.config.mapHeight;

		const states = await listStates(worldId);
		const tiles = await listMapTiles(worldId);
		const tileMap = new Map<string, MapTile>();
		for (const t of tiles) tileMap.set(t.coord, t);
		const palette = loadSettings().colorPalette;

		container.innerHTML = '';
		const back = button('← 返回编辑器', () => { history.back(); }, 'back-btn');
		const title = h('h1', 'page-title', `编辑地图 — ${worldName} (${mapW}×${mapH})`);
		const hint = div('setting-sub', '点击地块为其命名/改名。右键或点击"删除"清空名称。修改即时保存');

		// 地块命名面板
		const namePanel = div('form-row'); namePanel.style.cssText = 'align-items:center;gap:8px;margin-bottom:8px;padding:8px 12px;background:#fff;border:1px solid #ddd;border-radius:6px';
		const coordLabel = h('span', '', '选中: —'); coordLabel.style.cssText = 'min-width:70px;font-size:0.85rem;color:#888';
		const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'text-input'; nameInput.placeholder = '地块名称（zh_CN）'; nameInput.style.cssText = 'flex:1';
		const saveBtn = button('💾 保存', () => {}, 'small-btn');
		const delBtn = button('🗑 删除', () => {}, 'small-btn');
		namePanel.append(coordLabel, nameInput, saveBtn, delBtn);
		let selectedCoord = '';

		const mapArea = div('map-area'); mapArea.style.cssText = 'position:relative;border:2px solid #333;overflow:auto;background:#1a1a2e;min-height:400px';
		const legend = div('map-legend');

		container.append(back, title, hint, namePanel, mapArea, legend);

		const doRender = () => {
			const ownership = new Map<string, { stateId: string; stateName: string; color: string }>();
			let ci = 0;
			for (const s of states) {
				const color = palette[ci % palette.length]; ci++;
				for (const t of s.territories) {
					for (const r of t.regions) ownership.set(r.id, { stateId: s.id, stateName: s.getName('zh_CN'), color });
				}
			}

			const tileSize = Math.min(48, Math.floor(700 / Math.max(mapW, mapH, 1)));
			mapArea.innerHTML = '';
			mapArea.style.width = `${mapW * tileSize + 4}px`;
			mapArea.style.height = `${mapH * tileSize + 4}px`;

			for (let iy = 0; iy < mapH; iy++) {
				for (let ix = 0; ix < mapW; ix++) {
					const id = `${ix}, ${iy}`;
					const owner = ownership.get(id);
					const tile = tileMap.get(id);
					const el = document.createElement('div');
					const bg = owner ? owner.color : '#2a2a3e';
					el.style.cssText = `position:absolute;left:${ix * tileSize}px;top:${iy * tileSize}px;width:${tileSize - 1}px;height:${tileSize - 1}px;background:${bg};cursor:pointer;border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:${Math.max(8, tileSize * 0.2)}px;color:rgba(255,255,255,0.9);overflow:hidden;text-align:center`;
					const label = tile ? tile.getName('zh_CN') : '';
					if (label && tileSize >= 30) el.textContent = label.length > 6 ? label.slice(0, 5) + '…' : label;
					const stateName = owner ? owner.stateName : '无主';
					const tileName = tile ? tile.getName('zh_CN') : '未命名';
					el.title = `${tileName}\n坐标: ${id}\n${owner ? '属于: ' + stateName : '无国家'}`;
					el.addEventListener('click', () => {
						selectedCoord = id;
						coordLabel.textContent = `选中: ${id}`;
						nameInput.value = tile?.name['zh_CN'] ?? '';
					});
					mapArea.appendChild(el);
				}
			}

			const seen = new Set<string>(); legend.innerHTML = '';
			for (const [, o] of ownership) {
				if (seen.has(o.stateId)) continue; seen.add(o.stateId);
				const item = document.createElement('span'); item.className = 'map-legend-item';
				item.innerHTML = `<span style="display:inline-block;width:12px;height:12px;background:${o.color};margin-right:4px;border-radius:2px"></span>${o.stateName}`;
				legend.appendChild(item);
			}
		};

		saveBtn.addEventListener('click', async () => {
			if (!selectedCoord) return;
			const [sx, sy] = selectedCoord.split(', ').map(Number);
			const val = nameInput.value.trim();
			if (!val) return;
			let tile = tileMap.get(selectedCoord);
			if (tile) { tile.rename('zh_CN', val); }
			else { tile = new MapTile(worldId, sx, sy, { zh_CN: val }); }
			await saveMapTile(tile);
			tileMap.set(selectedCoord, tile);
			doRender();
		});

		delBtn.addEventListener('click', async () => {
			if (!selectedCoord) return;
			const tile = tileMap.get(selectedCoord);
			if (tile) { await deleteMapTile(tile); tileMap.delete(selectedCoord); }
			nameInput.value = '';
			doRender();
		});

		doRender();
	},
};
