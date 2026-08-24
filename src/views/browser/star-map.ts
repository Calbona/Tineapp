/**
 * 人物关系星图 — 以选定角色为中心，展示一层关系网。
 * 支持方向过滤、搜索切换中心人物、点击连线人物提升为中心。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listCharacters } from '../../services/repository.ts';
import Character from '../../models/Character.ts';
import CharacterRelationship from '../../models/CharacterRelationship.ts';
import World from '../../models/World.ts';
import './star-map.css';

interface RelEdge {
	targetId: number;
	targetName: string;
	type: string;
	describe: string;
	direction: 'out' | 'in';
}

let _chars: Character[] = [];
let _centerId: number | null = null;
let _worldId = 0;
let _showOut = true;
let _showIn = false;

export const StarMapPage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', t('nav.starmap')),
			(() => { const m = div('sm-main'); m.innerHTML = '<div class="ch-loading">加载中…</div>'; initView(m); return m; })(),
		);
	},
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) { main.innerHTML = '<div class="ch-empty">暂无世界数据</div>'; return; }
		// 从 sessionStorage 读取目标世界和角色
		const targetWorldId = Number(sessionStorage.getItem('tineapp-editor-worldId') ?? '');
		const targetCharId = Number(sessionStorage.getItem('tineapp-editor-charId') ?? '');
		_worldId = !isNaN(targetWorldId) && worlds.some(w => w.id === targetWorldId) ? targetWorldId : worlds[0].id;
		_chars = await listCharacters(_worldId);
		if (_chars.length === 0) { main.innerHTML = '<div class="ch-empty">该世界暂无角色</div>'; return; }
		_centerId = (!isNaN(targetCharId) && _chars.some(c => c.id === targetCharId)) ? targetCharId : _chars[0].id;

		renderUI(main, worlds, worlds[0]);
	} catch (err) { main.innerHTML = `<div class="ch-error">加载失败：${(err as Error).message}</div>`; }
}

function getEdges(): RelEdge[] {
	const center = _chars.find(c => c.id === _centerId);
	if (!center) return [];
	const nameBook = new Map(_chars.map(c => [c.id, c.getName('zh_CN')]));
	const edges: RelEdge[] = [];

	if (_showOut) {
		for (const rel of center.relationships) {
			if (nameBook.has(rel.targetId)) {
				edges.push({ targetId: rel.targetId, targetName: nameBook.get(rel.targetId)!, type: rel.type, describe: rel.describe, direction: 'out' });
			}
		}
	}
	if (_showIn) {
		for (const ch of _chars) {
			if (ch.id === _centerId) continue;
			for (const rel of ch.relationships) {
				if (rel.targetId === _centerId) {
					edges.push({ targetId: ch.id, targetName: ch.getName('zh_CN'), type: rel.type, describe: rel.describe, direction: 'in' });
				}
			}
		}
	}
	return edges;
}

function renderUI(main: HTMLElement, worlds: World[], current: World) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'ch-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN'); if (w.id === current.id) o.selected = true; sel.append(o);
	}
	sel.addEventListener('change', async () => {
		const w = worlds.find(w => w.id === Number(sel.value));
		if (!w) return;
		_worldId = w.id;
		_chars = await listCharacters(_worldId);
		_centerId = _chars[0]?.id ?? null;
		updateSearch(main);
		renderGraph(main);
	});

	// 搜索框
	const searchDiv = div('sm-search-bar');
	searchDiv.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;position:relative';
	const searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.className = 'text-input';
	searchInput.placeholder = '搜索角色…'; searchInput.style.cssText = 'flex:1;min-width:150px';
	const matchList = div('sm-match-list');
	matchList.className = 'sm-match-list';
	matchList.style.display = 'none';

	const doSearch = () => {
		const q = searchInput.value.trim().toLowerCase();
		if (!q) { matchList.style.display = 'none'; return; }
		const matches = _chars.filter(c => c.getName('zh_CN').toLowerCase().includes(q));
		if (matches.length === 0) { matchList.innerHTML = '<div style="padding:8px;color:#aaa">无匹配</div>'; matchList.style.display = 'block'; return; }
		matchList.innerHTML = '';
		for (const ch of matches.slice(0, 10)) {
			const item = document.createElement('div');
			item.textContent = ch.getName('zh_CN');
			item.addEventListener('click', () => {
				_centerId = ch.id;
				searchInput.value = '';
				matchList.style.display = 'none';
				renderGraph(main);
			});
			matchList.appendChild(item);
		}
		matchList.style.display = 'block';
	};
	searchInput.addEventListener('input', doSearch);
	searchInput.addEventListener('focus', doSearch);
	searchInput.addEventListener('blur', () => { setTimeout(() => { matchList.style.display = 'none'; }, 200); });

	const searchWrap = div(''); searchWrap.style.cssText = 'position:relative;flex:1;min-width:150px';
	searchWrap.append(searchInput, matchList);
	searchDiv.append(h('label', 'ch-world-label', '选择世界：'), sel, searchWrap);

	// 方向过滤（互斥）
	const outCb = document.createElement('input'); outCb.type = 'radio'; outCb.name = 'sm-dir'; outCb.checked = _showOut;
	const inCb = document.createElement('input'); inCb.type = 'radio'; inCb.name = 'sm-dir'; inCb.checked = _showIn;
	const outLabel = document.createElement('label'); outLabel.style.cssText = 'font-size:0.85rem;cursor:pointer;margin-right:12px';
	outLabel.append(outCb, document.createTextNode(' 发出的关系'));
	const inLabel = document.createElement('label'); inLabel.style.cssText = 'font-size:0.85rem;cursor:pointer';
	inLabel.append(inCb, document.createTextNode(' 收到的关系'));
	outCb.addEventListener('change', () => { _showOut = true; _showIn = false; renderGraph(main); });
	inCb.addEventListener('change', () => { _showOut = false; _showIn = true; renderGraph(main); });

	const filterBar = div('sm-filter-bar', outLabel, inLabel);
	filterBar.style.cssText = 'margin-bottom:8px;display:flex;align-items:center;gap:8px';

	main.append(div('ch-world-bar', '', searchDiv), filterBar);
	renderGraph(main);
}

function updateSearch(main: HTMLElement) {
	const graphArea = main.querySelector('.sm-graph-area');
	if (graphArea) renderGraph(main);
}

function renderGraph(main: HTMLElement) {
	main.querySelector('.sm-graph-area')?.remove();

	const center = _chars.find(c => c.id === _centerId);
	if (!center) return;

	const edges = getEdges();
	const uniqueTargets = [...new Set(edges.map(e => e.targetId))];
	const total = uniqueTargets.length;

	const graphArea = div('sm-graph-area');
	graphArea.style.cssText = 'position:relative;min-height:500px;background:#1a1a1a;border-radius:10px;border:1px solid #333;overflow:hidden';
	graphArea.className = 'sm-graph-area';

	// 先附加到 DOM 再计算位置
	main.appendChild(graphArea);
	const cx = graphArea.offsetWidth / 2 || 450;
	const cy = Math.max(280, graphArea.offsetHeight / 2 || 280);

	// 中央人物
	const centerEl = div('sm-center-node');
	centerEl.style.cssText = `position:absolute;left:${cx - 55}px;top:${cy - 55}px;width:110px;height:110px;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;border:2px solid #555`;
	centerEl.innerHTML = `<div style="text-align:center;color:#fff"><div style="font-size:1rem;font-weight:600">${center.getName('zh_CN')}</div><div style="font-size:0.7rem;opacity:0.8">${center.events.length} 事件 · ${center.relationships.length} 关系</div></div>`;
	centerEl.title = '点击查看人物传记';
	centerEl.addEventListener('click', () => {
		sessionStorage.setItem('tineapp-editor-worldId', String(_worldId));
		sessionStorage.setItem('tineapp-editor-charId', String(center.id));
		window.location.hash = '#browser/character';
	});
	graphArea.appendChild(centerEl);

	// SVG 连线层
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
	svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none';
	graphArea.appendChild(svg);

	// 周围人物 — 环形排列
	const radius = 200;
	const lineColor = '#666';

	const targetIds = uniqueTargets;
	const targetMap = new Map<number, HTMLElement>();

	for (let i = 0; i < targetIds.length; i++) {
		const tid = targetIds[i];
		const angle = (2 * Math.PI * i) / Math.max(targetIds.length, 1) - Math.PI / 2;
		const tx = cx + radius * Math.cos(angle);
		const ty = cy + radius * Math.sin(angle);
		const tChar = _chars.find(c => c.id === tid);
		if (!tChar) continue;

		// 连线（同一对人物之间每条关系一根线，错开角度）
		const pairEdges = edges.filter(e => e.targetId === tid);
		pairEdges.forEach((e, ei) => {
			const offset = (ei - (pairEdges.length - 1) / 2) * 8; // 错开
			const sAngle = angle + (offset / radius);
			const sx = cx + 55 * Math.cos(sAngle);
			const sy = cy + 55 * Math.sin(sAngle);
			const ex = tx - 35 * Math.cos(sAngle);
			const ey = ty - 35 * Math.sin(sAngle);

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', String(sx)); line.setAttribute('y1', String(sy));
			line.setAttribute('x2', String(ex)); line.setAttribute('y2', String(ey));
			line.setAttribute('stroke', lineColor);
			line.setAttribute('stroke-width', '1.5');
			line.setAttribute('stroke-opacity', '0.6');
			svg.appendChild(line);

			// 描述标签
			const mx = (sx + ex) / 2;
			const my = (sy + ey) / 2;
			const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			label.setAttribute('x', String(mx)); label.setAttribute('y', String(my - 4));
			label.setAttribute('fill', '#999');
			label.setAttribute('font-size', '10px'); label.setAttribute('text-anchor', 'middle');
			label.textContent = e.describe.length > 6 ? e.describe.slice(0, 5) + '…' : e.describe;
			svg.appendChild(label);
		});

		// 周围人物节点
		const node = div('sm-peripheral-node');
		node.style.cssText = `position:absolute;left:${tx - 38}px;top:${ty - 38}px;width:76px;height:76px;border-radius:50%;background:#2a2a2a;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;border:1px solid #555;transition:border-color 0.15s`;
		node.innerHTML = `<div style="text-align:center;color:#ccc"><div style="font-size:0.8rem">${tChar.getName('zh_CN')}</div></div>`;
		node.title = `点击设为中心人物`;
		node.addEventListener('click', () => {
			_centerId = tid;
			renderGraph(main);
		});
		node.addEventListener('mouseenter', () => { node.style.borderColor = '#999'; });
		node.addEventListener('mouseleave', () => { node.style.borderColor = '#555'; });
		graphArea.appendChild(node);
		targetMap.set(tid, node);
	}

	// 响应式宽度
	if (graphArea.offsetWidth === 0) {
		setTimeout(() => {
			centerEl.style.left = `${(graphArea.offsetWidth || 900) / 2 - 55}px`;
		}, 50);
	}


	if (edges.length > 0) {
	}
}
