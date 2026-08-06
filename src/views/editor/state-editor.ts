/**
 * 国家编辑器 — 登记/修改国家，含领土时段管理。
 * 数据驱动：时间输入字段由世界历法 units 动态生成。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { getWorld, listStates, saveState } from '../../services/repository.ts';
import State, { Territory, Region } from '../../models/State.ts';
import TimeSpan from '../../models/TimeSpan.ts';
import TimePoint from '../../models/TimePoint.ts';
import { KEYS, textInput, timeInputs, loadCalendarUnits } from './common.ts';

export const StateEditorPage: Page = {
	async render(container: HTMLElement) {
		const worldId = Number(sessionStorage.getItem(KEYS.WORLD_ID) ?? '0');
		const editId = sessionStorage.getItem(KEYS.STATE_ID);
		const world = await getWorld(worldId);
		if (!world) { container.innerHTML = '<div class="ch-error">世界未找到</div>'; return; }
		const units = await loadCalendarUnits(worldId);
		const states = await listStates(worldId);
		const isNew = !editId;
		let state: State;
		if (editId) {
			const found = states.find(s => s.id === editId);
			if (!found) { container.innerHTML = '<div class="ch-error">国家未找到</div>'; return; }
			state = new State(found.worldId, found.id, { ...found.name }, found.span, found.territories.map(t => new Territory(t.span, t.regions.map(r => new Region(r.x, r.y)))));
		} else {
			state = new State(worldId, '', { zh_CN: '', en_US: '' }, new TimeSpan(new TimePoint(0), null));
		}
		renderForm(container, isNew, state, units, async () => {
			if (!state.id.trim()) { alert('国家ID不能为空'); return; }
			if (!state.getName('zh_CN').trim()) { alert('国家名称不能为空'); return; }
			await saveState(state);
			sessionStorage.removeItem(KEYS.STATE_ID);
			history.back();
		});
	},
};

function renderForm(container: HTMLElement, isNew: boolean, state: State, units: { name: string }[], onSave: () => void) {
	const name = state.name;
	const tp = (p: TimePoint) => ({ year: p.year, month: p.month, day: p.day, hour: p.hour } as Record<string, number | undefined>);
	const st = tp(state.span.start);
	const et = state.span.end ? tp(state.span.end) : {} as Record<string, number | undefined>;
	const territories = state.territories.map(t => ({
		time: tp(t.span.start),
		endTime: t.span.end ? tp(t.span.end) : {} as Record<string, number | undefined>,
		regions: t.regions.map(r => ({ x: r.x, y: r.y })),
	}));

	container.innerHTML = '';
	const idInp = textInput(state.id, 'ID', v => { (state as unknown as Record<string, string>).id = v; }, { width: 80 });
	if (!isNew) idInp.disabled = true;
	const nameZh = textInput(name['zh_CN'] ?? '', 'zh_CN 名称', v => { name['zh_CN'] = v; });
	const nameEn = textInput(name['en_US'] ?? '', 'en_US 名称', v => { name['en_US'] = v; });
	const stRow = div('form-row', h('label', 'form-label', '开始'), ...timeInputs(st, units, { width: 55 }));
	const etRow = div('form-row', h('label', 'form-label', '结束'), ...timeInputs(et, units, { width: 55 }));

	const terrList = div('entity-list');
	const renderTerrs = () => {
		terrList.innerHTML = territories.length === 0 ? '<div style="color:#aaa;padding:4px">暂无领土</div>' : '';
		for (let i = 0; i < territories.length; i++) {
			const t = territories[i];
			const row = div('entity-row');
			row.innerHTML = `<span style="font-size:0.75rem;color:#888;min-width:30px">#${i + 1}</span>`;
			for (const u of units) {
				const inp = document.createElement('input'); inp.type = 'number'; inp.className = 'text-input'; inp.style.width = '45px';
				inp.placeholder = u.name; if (t.time[u.name] !== undefined) inp.value = String(t.time[u.name]);
				inp.addEventListener('input', () => { t.time[u.name] = inp.value ? Number(inp.value) : undefined; });
				row.appendChild(inp);
			}
			row.appendChild(document.createTextNode(' → '));
			for (const u of units) {
				const inp = document.createElement('input'); inp.type = 'number'; inp.className = 'text-input'; inp.style.width = '45px';
				inp.placeholder = u.name; if (t.endTime[u.name] !== undefined) inp.value = String(t.endTime[u.name]);
				inp.addEventListener('input', () => { t.endTime[u.name] = inp.value ? Number(inp.value) : undefined; });
				row.appendChild(inp);
			}
			const rStr = t.regions.map(r => `${r.x}, ${r.y}`).join(' ');
			const rInp = document.createElement('input'); rInp.type = 'text'; rInp.className = 'text-input'; rInp.style.flex = '1';
			rInp.placeholder = '坐标 (x,y x,y)'; rInp.value = rStr;
			rInp.addEventListener('change', () => { t.regions = rInp.value.match(/\d+\s*,\s*\d+/g)?.map(m => { const [x, y] = m.replace(/\s/g, '').split(',').map(Number); return { x, y }; }) ?? []; });
			row.appendChild(rInp);
			row.appendChild(button('✕', () => { territories.splice(i, 1); renderTerrs(); }, 'small-btn'));
			terrList.appendChild(row);
		}
	};
	renderTerrs();

	const saveBtn = button(isNew ? '登记国家' : '保存修改', () => {
		if (!state.id.trim()) { alert('国家ID不能为空'); return; }
		if (!state.getName('zh_CN').trim()) { alert('国家名称不能为空'); return; }
		const newSpan = TimeSpan.fromRecord(st, et, units);
		const newTerrs = territories.map(t => new Territory(TimeSpan.fromRecord(t.time, t.endTime, units), t.regions.map(r => new Region(r.x, r.y))));
		(state as unknown as Record<string, unknown>).span = newSpan;
		(state as unknown as Record<string, unknown>).territories = newTerrs;
		onSave();
	}, 'submit-btn');

	container.append(
		button(t('nav.backShort'), () => { history.back(); }, 'back-btn'),
		h('h1', '', isNew ? t('editor.newState') : '修改国家'),
		div('form-section', h('h2', '', '基本信息'), div('form-row', h('label', 'form-label', '名称'), nameZh, nameEn), stRow, etRow),
		div('form-section', h('h2', '', '领土时段'), terrList, button('＋ 添加领土时段', () => { territories.push({ time: { year: 0 }, endTime: {}, regions: [] }); renderTerrs(); }, 'small-btn')),
		saveBtn,
	);
}
