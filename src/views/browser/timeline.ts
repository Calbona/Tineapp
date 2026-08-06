/**
 * 时间轴 — 使用 TimelineJS 渲染横向可视化时间轴。
 * 与大事年表共享事件收集 + 黑白名单筛选逻辑（services/event-utils.ts）。
 */
import { Timeline } from '@knight-lab/timelinejs';
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds } from '../../services/repository.ts';
import { collectAllEvents, fmtTime, fmtSpan } from '../../services/event-utils.ts';
import type { UnifiedEvent } from '../../services/data-manager.ts';
import World from '../../models/World.ts';
import './timeline.css';

let _timelineInstance: InstanceType<typeof Timeline> | null = null;
let _currentEvents: UnifiedEvent[] = [];

export const TimelinePage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', t('timeline.title')),
			(() => { const m = div('tl-main'); m.innerHTML = `<div class="tl-loading">${t('timeline.loading')}</div>`; initView(m); return m; })(),
		);
	},
	destroy() { if (_timelineInstance) { document.getElementById('timeline-embed')!.innerHTML = ''; _timelineInstance = null; } },
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) { main.innerHTML = `<div class="tl-empty">${t('timeline.noWorld')}</div>`; return; }
		let current = worlds[0];
		_currentEvents = await collectAllEvents(current);
		renderUI(main, worlds, current);
		const sel = main.querySelector('.tl-world-select') as HTMLSelectElement;
		sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return; current = w;
			_currentEvents = await collectAllEvents(w);
			renderTimelineJS();
		});
	} catch (err) { main.innerHTML = `<div class="tl-error">${t('timeline.loadError')}${(err as Error).message}</div>`; }
}

function renderUI(main: HTMLElement, worlds: World[], current: World) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'tl-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN'); if (w.id === current.id) o.selected = true; sel.append(o);
	}
	main.append(div('tl-world-bar', h('label', 'tl-world-label', t('timeline.selectWorld')), sel,
		h('span', 'tl-event-count', `${_currentEvents.length} ${t('timeline.events')}`)));
	const embed = div('tl-embed'); embed.id = 'timeline-embed'; main.append(embed);
	renderTimelineJS();
}

function renderTimelineJS() {
	const embed = document.getElementById('timeline-embed'); if (!embed) return;
	embed.innerHTML = '';
	if (_currentEvents.length === 0) { embed.innerHTML = `<div class="tl-empty">${t('timeline.noEvents')}</div>`; return; }

	const groups = new Map<string, UnifiedEvent[]>();
	for (const evt of _currentEvents) { const g = groups.get(evt.groupId); if (g) g.push(evt); else groups.set(evt.groupId, [evt]); }
	const cols = ['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac'];
	let ci = 0; const gc = new Map<string, string>(); for (const [n] of groups) { gc.set(n, cols[ci % cols.length]); ci++; }

	const slides: Record<string, unknown>[] = [];
	for (const evt of _currentEvents) {
		const s: Record<string, unknown> = {
			start_date: td(evt.time),
			text: { headline: evt.describe, text: `时间：${fmtSpan(evt)}<br>事件来源：${evt.sourceName}<br>事件类型：${evt.type ?? '—'}` },
			group: evt.groupId,
			background: { color: (gc.get(evt.groupId) ?? '#333').replace('#', '') },
		};
		if (evt.endTime && evt.endType !== 'instant') s['end_date'] = td(evt.endTime);
		slides.push(s);
	}
	_timelineInstance = new Timeline('timeline-embed', { title: { text: { headline: _currentEvents[0]?.sourceName ?? '', text: `${_currentEvents.length} ${t('timeline.events')}，${groups.size} 个分组` } }, events: slides }, { timenav_position: 'top', scale_factor: 1, start_at_end: false, hash_bookmark: false });
}

function td(tp: { year: number; month?: number; day?: number; hour?: number }): Record<string, number> {
	const d: Record<string, number> = { year: tp.year };
	if (tp.month !== undefined) d.month = tp.month;
	if (tp.day !== undefined) d.day = tp.day;
	if (tp.hour !== undefined) d.hour = tp.hour;
	return d;
}
