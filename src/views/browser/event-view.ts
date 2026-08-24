/**
 * 事件查询 — 搜索框匹配世界事件 + 角色事件的描述，点击跳转事件明细。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listCharacters, listWorldEvents } from '../../services/repository.ts';
import { filterCharacters, fmtSpan } from '../../services/event-utils.ts';
import { listTags } from '../../services/repository.ts';
import type { UnifiedEvent } from '../../services/data-manager.ts';
import World from '../../models/World.ts';
import './chronicle.css';
import './event-view.css';

let _allEvents: UnifiedEvent[] = [];
let _currentWorld: World | null = null;

export const EventViewPage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', t('nav.event')),
			(() => { const m = div('ch-main'); m.innerHTML = '<div class="ch-loading">加载中…</div>'; initView(m); return m; })(),
		);
	},
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) { main.innerHTML = '<div class="ch-empty">暂无世界数据</div>'; return; }
		_currentWorld = worlds[0];
		await reloadEvents();
		renderUI(main, worlds);

		const sel = main.querySelector('.ch-world-select') as HTMLSelectElement | null;
		const search = main.querySelector('.ev-search') as HTMLInputElement | null;
		if (sel) sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return; _currentWorld = w;
			await reloadEvents();
			if (search) { search.value = ''; doSearch(search.value, main); }
		});
		if (search) search.addEventListener('input', () => doSearch(search.value, main));
	} catch (err) { main.innerHTML = `<div class="ch-error">加载失败：${(err as Error).message}</div>`; }
}

async function reloadEvents() {
	if (!_currentWorld) return;
	const chars = await listCharacters(_currentWorld.id);
	const tags = await listTags();
	const filtered = filterCharacters(_currentWorld, chars, tags);
	const worldEvents = await listWorldEvents(_currentWorld.id);
	const events: UnifiedEvent[] = [];
	const wName = _currentWorld.getName('zh_CN');

	for (const evt of worldEvents) {
		events.push({
			time: evt.span.start.toJSON(), endTime: evt.span.end?.toJSON(), endType: evt.span.endType || undefined,
			type: evt.type || undefined, describe: evt.describe,
			sourceName: wName, sourceType: 'world', groupId: evt.id, sortKey: evt.span.start.sortKey,
		});
	}
	for (const ch of filtered) {
		const chName = ch.getName('zh_CN');
		ch.events.forEach((evt, ei) => {
			events.push({
				time: evt.time.toJSON(), endTime: evt.endTime?.toJSON(), endType: evt.endType || undefined,
				type: evt.type || undefined, describe: evt.describe,
				sourceName: chName, sourceType: 'character', groupId: `${ch.id}/${ei}`, sortKey: evt.time.sortKey,
			});
		});
	}
	events.sort((a, b) => a.sortKey - b.sortKey);
	_allEvents = events;
}

function renderUI(main: HTMLElement, worlds: World[]) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'ch-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN'); if (_currentWorld && w.id === _currentWorld.id) o.selected = true; sel.append(o);
	}

	const searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.className = 'text-input ev-search';
	searchInput.placeholder = '输入关键词搜索事件描述…'; searchInput.style.cssText = 'flex:1;font-size:1rem;padding:12px 16px';

	const searchBar = div('ch-world-bar', h('label', 'ch-world-label', '选择世界：'), sel);
	searchBar.style.marginBottom = '12px';

	main.append(searchBar, searchInput);
	const results = div('ev-results');
	results.style.cssText = 'margin-top:12px';
	main.append(results);

	searchInput.addEventListener('input', () => doSearch(searchInput.value, main));
}

function doSearch(query: string, main: HTMLElement) {
	const results = main.querySelector('.ev-results') as HTMLElement;
	if (!results) return;

	const q = query.trim().toLowerCase();
	const filtered = q ? _allEvents.filter(e => e.describe.toLowerCase().includes(q)) : [];

	if (!q) { results.innerHTML = ''; return; }
	if (filtered.length === 0) { results.innerHTML = '<div class="ch-empty">未找到匹配的事件</div>'; return; }

	let html = `<div class="ch-table-wrap"><table class="ch-table"><thead><tr><th>时间</th><th>来源</th><th>类型</th><th>描述</th></tr></thead><tbody>`;
	for (let i = 0; i < filtered.length; i++) {
		const evt = filtered[i];
		const src = evt.sourceType === 'world'
			? `<span class="ch-src-world">${evt.sourceName}</span>`
			: `<span class="ch-src-char">${evt.sourceName}</span>`;
		const desc = highlight(evt.describe, q);
		html += `<tr class="ev-result-row" style="cursor:pointer" data-ei="${i}"><td class="ch-cell-time">${fmtSpan(evt)}</td><td class="ch-cell-src">${src}</td><td class="ch-cell-type">${evt.type || '—'}</td><td class="ch-cell-desc">${desc}</td></tr>`;
	}
	html += '</tbody></table></div>';
	results.innerHTML = html;

	results.querySelectorAll('.ev-result-row').forEach(row => {
		row.addEventListener('click', () => {
			const ei = Number((row as HTMLElement).getAttribute('data-ei'));
			const evt = filtered[ei];
			if (evt.sourceType === 'world') {
				sessionStorage.setItem('ev-detail', JSON.stringify({ type: 'world', worldId: _currentWorld!.id, eventId: evt.groupId }));
			} else {
				const [chId, eIdx] = evt.groupId.split('/');
				sessionStorage.setItem('ev-detail', JSON.stringify({ type: 'character', worldId: _currentWorld!.id, charId: Number(chId), eventIdx: Number(eIdx) }));
			}
			window.location.hash = '#browser/event-detail';
		});
	});
}

function highlight(text: string, query: string): string {
	const i = text.toLowerCase().indexOf(query);
	if (i < 0) return text;
	return text.slice(0, i) + '<mark>' + text.slice(i, i + query.length) + '</mark>' + text.slice(i + query.length);
}
