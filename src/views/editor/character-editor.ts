/**
 * 角色编辑器 — 登记/修改角色，含属性和事件增删。
 * 事件类型从 localStorage tineapp-types 动态加载。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import type { JsonCharacterData, JsonName } from '../../services/data-manager.ts';
import { getCharacters, saveCharacters, getNextCharId } from '../../services/data-store.ts';
import TypeRegistry from '../../models/TypeRegistry.ts';
import { KEYS, loadCalendarUnits, textInput, type CalendarUnit } from './common.ts';

let _calendarUnits: CalendarUnit[] | null = null;

export const CharacterEditorPage: Page = {
	async render(container: HTMLElement) {
		const worldId = Number(sessionStorage.getItem(KEYS.WORLD_ID) ?? '0');
		const charIdStr = sessionStorage.getItem(KEYS.CHAR_ID);
		const isNew = !charIdStr;

		if (!_calendarUnits) {
			_calendarUnits = await loadCalendarUnits(worldId);
		}

		const chars = await getCharacters(worldId);
		let data: Record<string, unknown>;

		if (isNew) {
			const newId = await getNextCharId(worldId);
			data = { world: worldId, id: newId, name: { zh_CN: '', en_US: '' }, properties: {}, events: [], relationships: [] } as unknown as Record<string, unknown>;
		} else {
			const ch = chars.find(c => c.id === Number(charIdStr));
			if (!ch) { container.innerHTML = '<div class="ch-error">角色未找到</div>'; return; }
			data = JSON.parse(JSON.stringify(ch)) as Record<string, unknown>;
		}

		sessionStorage.removeItem(KEYS.CHAR_ID);
		renderForm(container, isNew, worldId, data, chars);
	},
};

function renderForm(
	container: HTMLElement, isNew: boolean, worldId: number,
	data: Record<string, unknown>, allChars: JsonCharacterData[],
) {
	container.innerHTML = '';

	const name = (data.name ?? {}) as JsonName;
	const props = (data.properties ?? {}) as Record<string, string>;
	const events = (data.events ?? []) as Record<string, unknown>[];

	const back = button(t('nav.backShort'), () => { history.back(); }, 'back-btn');
	const title = h('h1', '', isNew ? t('editor.newCharacter') : `${t('editor.modifyCharacter')} #${data.id}`);

	const nameZh = textInput(name['zh_CN'] ?? '', 'zh_CN 名称', v => { name['zh_CN'] = v; });
	const nameEn = textInput(name['en_US'] ?? '', 'en_US 名称', v => { name['en_US'] = v; });

	// 属性
	const propList = div('entity-list');
	const renderProps = () => {
		propList.innerHTML = '';
		for (const [key, val] of Object.entries(props)) {
			const r = div('form-row');
			r.innerHTML = `<span style="min-width:100px;font-size:0.85rem">${key}</span>`;
			r.appendChild(textInput(String(val), '值', v => { props[key] = v; }, { flex: true }));
			r.appendChild(button('✕', () => { delete props[key]; renderProps(); }, 'small-btn'));
			propList.appendChild(r);
		}
	};
	renderProps();
	const newKey = textInput('', '属性键', () => {}, { width: 100 });
	const newVal = textInput('', '值', () => {}, { flex: true });
	const addProp = button('＋ 添加属性', () => {
		const k = (newKey as HTMLInputElement).value.trim();
		if (!k) { alert('属性键不能为空'); return; }
		props[k] = (newVal as HTMLInputElement).value.trim();
		(newKey as HTMLInputElement).value = ''; (newVal as HTMLInputElement).value = '';
		renderProps();
	}, 'small-btn');

	// 事件
	const eventList = div('entity-list');
	const calUnits = _calendarUnits ?? [{ name: 'year' }];
	const charEventTypes = TypeRegistry.instance.charEventTypes;
	const renderEvents = () => {
		eventList.innerHTML = events.length === 0 ? '<div style="color:#aaa;padding:8px">暂无事件</div>' : '';
		for (let i = 0; i < events.length; i++) {
			const evt = events[i];
			const st = (evt.time ?? (evt.time = {})) as Record<string, number | undefined>;
			const et = (evt.endTime ?? (evt.endTime = {})) as Record<string, number | undefined>;
			if (i === 0 && !events.some(e => e.type === 'birth')) evt.type = 'birth';

			let startHtml = ''; let endHtml = '';
			for (const u of calUnits) {
				startHtml += `<input class="text-input" style="width:45px" placeholder="${u.name}" value="${st[u.name] ?? ''}" data-ei="${i}" data-ef="${u.name}">`;
				endHtml += `<input class="text-input" style="width:45px" placeholder="${u.name}" value="${et[u.name] ?? ''}" data-ei="${i}" data-ef="end_${u.name}">`;
			}

			const curEnd = (evt.endType as string) || '';
			const typeOpts = charEventTypes.map(t => `<option value="${t}" ${evt.type === t ? 'selected' : ''}>${t}</option>`).join('') + `<option value="" ${!evt.type ? 'selected' : ''}>其他</option>`;

			const row = div('entity-row');
			row.innerHTML = `${startHtml} <span style="color:#ccc;font-size:0.8rem">→</span> ${endHtml}
				<select class="form-select" style="width:65px;font-size:0.75rem" data-ei="${i}" data-ef="endType">
					<option value="" ${curEnd === '' ? 'selected' : ''}>默认</option>
					<option value="instant" ${curEnd === 'instant' ? 'selected' : ''}>瞬时</option>
					<option value="lifelong" ${curEnd === 'lifelong' ? 'selected' : ''}>终身</option>
					<option value="eternal" ${curEnd === 'eternal' ? 'selected' : ''}>永恒</option>
				</select>
				<select class="form-select" style="width:75px" data-ei="${i}" data-ef="type">${typeOpts}</select>
				<input class="text-input" style="flex:1" placeholder="描述" value="${evt.describe ?? ''}" data-ei="${i}" data-ef="describe">
				<button class="small-btn" data-ei="${i}" data-eact="del">✕</button>`;
			eventList.appendChild(row);
		}

		eventList.oninput = (e) => {
			const t = e.target as HTMLElement;
			const ei = Number(t.getAttribute('data-ei'));
			const ef = t.getAttribute('data-ef');
			if (isNaN(ei) || !ef) return;
			const v = (t as HTMLInputElement).value;
			const evt2 = events[ei];
			if (ef === 'type') evt2.type = v || undefined;
			else if (ef === 'describe') evt2.describe = v;
			else if (ef === 'endType') evt2.endType = v || undefined;
			else if (ef.startsWith('end_')) {
				const et2 = (evt2.endTime ?? (evt2.endTime = {})) as Record<string, number | undefined>;
				et2[ef.slice(4)] = v ? Number(v) : undefined;
			} else {
				const st2 = (evt2.time ?? (evt2.time = {})) as Record<string, number | undefined>;
				st2[ef] = v ? Number(v) : undefined;
			}
		};
		eventList.onclick = (e) => {
			const btn = (e.target as HTMLElement).closest('button') as HTMLElement;
			if (!btn) return;
			const ei = Number(btn.getAttribute('data-ei'));
			if (!isNaN(ei) && btn.getAttribute('data-eact') === 'del') { events.splice(ei, 1); renderEvents(); }
		};
	};
	renderEvents();
	const addEvent = button('＋ 添加事件', () => { events.push({ time: { year: 0 }, describe: '' }); renderEvents(); }, 'small-btn');

	// 保存
	const saveBtn = button(isNew ? t('editor.createCharacter') : t('editor.saveCharacter'), async () => {
		if (!(name['zh_CN'] ?? '').trim()) { alert('角色名称不能为空'); return; }
		if (!events.some(e => e.type === 'birth')) { alert('角色缺少出生事件（第一个事件即视为出生）'); return; }

		const cleanData = { ...data, properties: props, events, name: { zh_CN: name['zh_CN'], en_US: name['en_US'] } };
		const idx = allChars.findIndex(c => c.id === data.id);
		if (idx >= 0) allChars[idx] = cleanData as unknown as JsonCharacterData;
		else allChars.push(cleanData as unknown as JsonCharacterData);
		await saveCharacters(worldId, allChars);
		alert('保存成功！');
		history.back();
	}, 'submit-btn');

	container.append(back, title,
		div('form-section', h('h2', '', t('editor.characterInfo')), div('form-row', h('label', 'form-label', '名称'), nameZh, nameEn)),
		div('form-section', h('h2', '', '属性'), propList, div('form-row', newKey, newVal, addProp)),
		div('form-section', h('h2', '', '生平事件'), eventList, addEvent),
		saveBtn,
	);
}
