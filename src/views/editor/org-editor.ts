/**
 * 组织编辑器 — 登记/修改组织。
 * 数据驱动：时间输入字段由世界历法 units 动态生成。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { getWorld, listOrganizations, saveOrganization } from '../../services/repository.ts';
import Organization from '../../models/Organization.ts';
import TimeSpan from '../../models/TimeSpan.ts';
import TimePoint from '../../models/TimePoint.ts';
import { KEYS, textInput, timeInputs, loadCalendarUnits } from './common.ts';

export const OrgEditorPage: Page = {
	async render(container: HTMLElement) {
		const worldId = Number(sessionStorage.getItem(KEYS.WORLD_ID) ?? '0');
		const editId = sessionStorage.getItem(KEYS.ORG_ID);
		const world = await getWorld(worldId);
		if (!world) { container.innerHTML = '<div class="ch-error">世界未找到</div>'; return; }
		const units = await loadCalendarUnits(worldId);
		const orgs = await listOrganizations(worldId);
		const isNew = !editId;
		let org: Organization;
		if (editId) {
			const found = orgs.find(o => o.id === editId);
			if (!found) { container.innerHTML = '<div class="ch-error">组织未找到</div>'; return; }
			org = new Organization(found.worldId, found.id, { ...found.name }, found.span, [...found.tags]);
		} else {
			org = new Organization(worldId, '', { zh_CN: '', en_US: '' }, new TimeSpan(new TimePoint(0), null));
		}
		renderForm(container, isNew, org, units, async () => {
			if (!org.id.trim()) { alert('组织ID不能为空'); return; }
			if (!org.getName('zh_CN').trim()) { alert('组织名称不能为空'); return; }
			await saveOrganization(org);
			sessionStorage.removeItem(KEYS.ORG_ID);
			history.back();
		});
	},
};

function renderForm(container: HTMLElement, isNew: boolean, org: Organization, units: { name: string }[], onSave: () => void) {
	const name = org.name;
	const tp = (p: TimePoint) => ({ year: p.year, month: p.month, day: p.day, hour: p.hour } as Record<string, number | undefined>);
	const st = tp(org.span.start);
	const et = org.span.end ? tp(org.span.end) : {} as Record<string, number | undefined>;
	const tags: string[] = [...org.tags];

	container.innerHTML = '';
	const idInp = textInput(org.id, 'ID', v => { (org as unknown as Record<string, string>).id = v; }, { width: 80 });
	if (!isNew) idInp.disabled = true;
	const nameZh = textInput(name['zh_CN'] ?? '', 'zh_CN 名称', v => { name['zh_CN'] = v; });
	const nameEn = textInput(name['en_US'] ?? '', 'en_US 名称', v => { name['en_US'] = v; });
	const stRow = div('form-row', h('label', 'form-label', '开始'), ...timeInputs(st, units, { width: 55 }));
	const etRow = div('form-row', h('label', 'form-label', '结束'), ...timeInputs(et, units, { width: 55 }));

	const tagList = div('entity-list');
	const renderTags = () => {
		tagList.innerHTML = tags.length === 0 ? '<div style="color:#aaa;padding:4px">暂无标签</div>' : '';
		for (let i = 0; i < tags.length; i++) {
			const row = div('form-row');
			row.appendChild(textInput(tags[i], '标签名', v => { tags[i] = v; }, { flex: true }));
			row.appendChild(button('✕', () => { tags.splice(i, 1); renderTags(); }, 'small-btn'));
			tagList.appendChild(row);
		}
	};
	renderTags();

	const saveBtn = button(isNew ? '登记组织' : '保存修改', () => {
		if (!org.id.trim()) { alert('组织ID不能为空'); return; }
		if (!org.getName('zh_CN').trim()) { alert('组织名称不能为空'); return; }
		const newSpan = TimeSpan.fromRecord(st, et, units);
		(org as unknown as Record<string, unknown>).span = newSpan;
		(org as unknown as Record<string, unknown>).tags = tags;
		onSave();
	}, 'submit-btn');

	container.append(
		button(t('nav.backShort'), () => { history.back(); }, 'back-btn'),
		h('h1', '', isNew ? t('editor.newOrg') : '修改组织'),
		div('form-section', h('h2', '', '基本信息'), div('form-row', h('label', 'form-label', '名称'), nameZh, nameEn), stRow, etRow),
		div('form-section', h('h2', '', '标签'), div('setting-sub', '标签中关联的角色即组织成员'), tagList, button('＋ 添加标签', () => { tags.push(''); renderTags(); }, 'small-btn')),
		saveBtn,
	);
}
