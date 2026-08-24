/**
 * 世界事件编辑器 — 根据世界历法动态生成时间输入字段。
 * 事件数据存储为独立 JSON 文件（public/data/events/）。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorldEvents, saveWorldEvent, getWorld } from '../../services/repository.ts';
import WorldEvent from '../../models/WorldEvent.ts';
import TimeSpan from '../../models/TimeSpan.ts';
import TimePoint from '../../models/TimePoint.ts';
import TypeRegistry from '../../models/TypeRegistry.ts';
import { KEYS, loadCalendarUnits, timeInputs, type CalendarUnit } from './common.ts';

export const EventEditorPage: Page = {
	async render(container: HTMLElement) {
		const worldId = Number(sessionStorage.getItem(KEYS.WORLD_ID) ?? '0');
		const editIdx = Number(sessionStorage.getItem(KEYS.EVENT_IDX) ?? '-1');

		const world = await getWorld(worldId);
		if (!world) { container.innerHTML = '<div class="ch-error">世界未找到（请先保存世界）</div>'; return; }

		const units = await loadCalendarUnits(worldId);
		const events = await listWorldEvents(worldId);
		let evt: WorldEvent;

		if (editIdx >= 0 && editIdx < events.length) {
			evt = events[editIdx];
		} else {
			const st: Record<string, number> = {};
			for (const u of units) st[u.name] = u.initial ?? 0;
			const newId = `AA${String(events.length).padStart(3, '0')}`;
			evt = new WorldEvent(worldId, newId, new TimeSpan(new TimePoint(0), null), '', '');
		}

		renderForm(container, editIdx < 0, evt, worldId, units, async () => {
			if (!evt.describe.trim()) { alert('事件描述不能为空'); return; }
			await saveWorldEvent(evt);
			sessionStorage.removeItem(KEYS.EVENT_IDX);
			history.back();
		});
	},
};

function renderForm(
	container: HTMLElement, isNew: boolean,
	evt: WorldEvent, worldId: number,
	units: CalendarUnit[], onSave: () => void,
) {
	const st = { year: evt.span.start.year, month: evt.span.start.month, day: evt.span.start.day, hour: evt.span.start.hour } as Record<string, number | undefined>;
	const et = evt.span.end ? { year: evt.span.end.year, month: evt.span.end.month, day: evt.span.end.day, hour: evt.span.end.hour } as Record<string, number | undefined> : {} as Record<string, number | undefined>;
	container.innerHTML = '';

	const startInputs = timeInputs(st, units);
	const startRow = div('form-row', h('label', 'form-label', '开始'), ...startInputs);

	const endInputs = timeInputs(et, units);
	const endRow = div('form-row', h('label', 'form-label', '结束'), ...endInputs);

	const endTypeSel = document.createElement('select');
	endTypeSel.className = 'form-select'; endTypeSel.style.width = '110px';
	for (const o of [{ v: '', l: '默认（世界策略）' }, { v: 'instant', l: '瞬时' }, { v: 'lifelong', l: '终身' }, { v: 'eternal', l: '永恒' }]) {
		const opt = document.createElement('option'); opt.value = o.v; opt.textContent = o.l;
		if (o.v === (evt.span.endType || '')) opt.selected = true; endTypeSel.appendChild(opt);
	}
	const endTypeRow = div('form-row', h('label', 'form-label', '结束类型'), endTypeSel);

	const typeSel = document.createElement('select'); typeSel.className = 'form-select';
	const worldTypes = TypeRegistry.instance.worldEventTypes;
	for (const o of ['', ...worldTypes]) {
		const opt = document.createElement('option'); opt.value = o; opt.textContent = o || '（无）';
		if (o === (evt.type || '')) opt.selected = true; typeSel.appendChild(opt);
	}
	const typeRow = div('form-row', h('label', 'form-label', '类型'), typeSel);

	const ta = document.createElement('textarea'); ta.className = 'text-input'; ta.style.cssText = 'flex:1;min-height:60px';
	ta.value = evt.describe; ta.placeholder = '事件描述…';
	const descRow = div('form-row', h('label', 'form-label', '描述'), ta);

	const saveBtn = button(isNew ? '登记事件' : '保存修改', () => {
		if (!ta.value.trim()) { alert('事件描述不能为空'); return; }

		const span = TimeSpan.fromRecord(st, et, units, endTypeSel.value || undefined);
		(evt as unknown as Record<string, unknown>).span = span;
		(evt as unknown as Record<string, unknown>).type = typeSel.value || '';
		(evt as unknown as Record<string, unknown>).describe = ta.value;

		onSave();
	}, 'submit-btn');

	container.append(
		button(t('nav.backShort'), () => { history.back(); }, 'back-btn'),
		h('h1', '', isNew ? t('editor.newEvent') : '修改事件'),
		div('form-section', h('h2', '', '事件信息'), startRow, endRow, endTypeRow, typeRow, descRow),
		saveBtn,
	);
}
