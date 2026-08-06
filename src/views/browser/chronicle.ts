/**
 * 大事年表 — 以表格列出选定世界的全部事件。
 * 与时间轴共享黑白名单筛选 + 事件收集逻辑（services/event-utils.ts）。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds } from '../../services/repository.ts';
import { collectAllEvents, fmtTime, fmtSpan } from '../../services/event-utils.ts';
import type { UnifiedEvent } from '../../services/data-manager.ts';
import World from '../../models/World.ts';
import './chronicle.css';

export const ChroniclePage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', t('chronicle.title')),
			(() => { const m = div('ch-main'); m.innerHTML = `<div class="ch-loading">${t('chronicle.loading')}</div>`; initView(m); return m; })(),
		);
	},
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) { main.innerHTML = `<div class="ch-empty">${t('chronicle.noWorld')}</div>`; return; }
		let current = worlds[0];
		let events = await collectAllEvents(current);
		renderUI(main, worlds, current, events);
		const sel = main.querySelector('.ch-world-select') as HTMLSelectElement;
		sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return; current = w;
			events = await collectAllEvents(w);
			renderTable(main.querySelector('.ch-content') as HTMLElement, events);
		});
	} catch (err) { main.innerHTML = `<div class="ch-error">${t('chronicle.loadError')}${(err as Error).message}</div>`; }
}

function renderUI(main: HTMLElement, worlds: World[], current: World, events: UnifiedEvent[]) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'ch-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN'); if (w.id === current.id) o.selected = true; sel.append(o);
	}
	main.append(div('ch-world-bar', h('label', 'ch-world-label', t('chronicle.selectWorld')), sel,
		h('span', 'ch-event-count', `${events.length} ${t('chronicle.events')}`)));
	main.append(div('ch-content'));
	renderTable(main.querySelector('.ch-content') as HTMLElement, events);
}

function renderTable(content: HTMLElement, events: UnifiedEvent[]) {
	if (events.length === 0) { content.innerHTML = `<div class="ch-empty">${t('chronicle.noEvents')}</div>`; return; }
	let rows = '';
	for (const evt of events) {
		const srcLabel = evt.sourceType === 'world' ? `<span class="ch-src-world">${evt.sourceName}</span>` : `<span class="ch-src-char">${evt.sourceName}</span>`;
		rows += `<tr><td class="ch-cell-time">${fmtSpan(evt)}</td><td class="ch-cell-src">${srcLabel}</td><td class="ch-cell-type">${evt.type ?? '—'}</td><td class="ch-cell-desc">${evt.describe}</td></tr>`;
	}
	content.innerHTML = `<div class="ch-table-wrap"><table class="ch-table"><thead><tr><th>${t('chronicle.colTime')}</th><th>${t('chronicle.colSource')}</th><th>${t('chronicle.colType')}</th><th>${t('chronicle.colDesc')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
