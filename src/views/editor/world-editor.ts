/**
 * 世界编辑器 — 仪表盘。面向对象设计，使用模型实例操作数据。
 */
import type { Page } from '../../core/router.ts';
import './world-editor.css';
import { div, button, h } from '../../core/dom.ts';
import { getRouter } from '../../core/router.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listCharacters, listWorldEvents, listStates, listOrganizations, listTags, listMapTiles, saveWorld, getNextWorldId, getWorld, deleteWorldEvent } from '../../services/repository.ts';
import World, { WorldConfig } from '../../models/World.ts';
import CalendarRegistry from '../../models/CalendarRegistry.ts';
import { KEYS, textInput } from './common.ts';

export const WorldEditorPage: Page = {
	async render(container: HTMLElement) {
		const router = getRouter();
		const worldIdStr = router.params['id'];
		const isNew = !worldIdStr;
		container.innerHTML = '';
		container.append(button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'), h('h1', '', '加载中…'));

		let world: World;
		if (isNew) {
			// 仅当草稿为未保存的新世界时才恢复（防止加载已存在世界的残留草稿）
			const draft = sessionStorage.getItem(KEYS.DRAFT);
			if (draft) {
				const d = JSON.parse(draft) as { id: number; name: Record<string, string>; chronology: string; config?: Record<string, unknown> };
				const existing = await getWorld(d.id);
				if (existing) { sessionStorage.removeItem(KEYS.DRAFT); } // 已是已保存世界，丢弃草稿
				else { world = new World(d.id, d.name, d.chronology, d.config ? new WorldConfig(d.config as Partial<WorldConfig>) : undefined); }
			}
			if (!world!) world = new World(await getNextWorldId(), { zh_CN: '', en_US: '' }, 'ExampleWorldChronology');
		} else {
			const w = await getWorld(Number(worldIdStr));
			if (!w) { container.innerHTML = '<div class="ch-error">世界未找到</div>'; return; }
			world = w;
		}

		sessionStorage.setItem(KEYS.DRAFT, JSON.stringify(world.toJSON()));
		sessionStorage.setItem(KEYS.WORLD_ID, String(world.id));

		const chars = isNew ? [] : await listCharacters(world.id);
		const wevents = isNew ? [] : await listWorldEvents(world.id);
		const states = isNew ? [] : await listStates(world.id);
		const orgs = isNew ? [] : await listOrganizations(world.id);
		const tiles = isNew ? [] : await listMapTiles(world.id);
		renderDashboard(container, isNew, world, chars, wevents, states, orgs, tiles);
	},
};

function saveDraft(w: World) {
	sessionStorage.setItem(KEYS.DRAFT, JSON.stringify(w.toJSON()));
}

function renderDashboard(
	container: HTMLElement, isNew: boolean, w: World,
	chars: { id: number; getName: (l: string) => string }[],
	wevents: { id: string; describe: string }[],
	states: { id: string; getName: (l: string) => string }[],
	orgs: { id: string; getName: (l: string) => string }[],
	tiles: { coord: string; getName: (l: string) => string }[],
) {
	container.innerHTML = '';

	const back = button(t('nav.back'), () => { if (isNew) sessionStorage.removeItem(KEYS.DRAFT); window.location.hash = '#home'; }, 'back-btn');
	const title = h('h1', '', isNew ? t('editor.newWorld') : `${t('editor.modifyWorld')} #${w.id}`);

	const nameZh = textInput(w.name['zh_CN'] ?? '', 'zh_CN 名称', v => { w.name['zh_CN'] = v; saveDraft(w); });
	const nameEn = textInput(w.name['en_US'] ?? '', 'en_US 名称', v => { w.name['en_US'] = v; saveDraft(w); });

	// 历法选择（数据驱动：从 CalendarRegistry 读取）
	const calendars = CalendarRegistry.instance.list();
	const calSelect = document.createElement('select'); calSelect.className = 'form-select';
	for (const cal of calendars) { const o = document.createElement('option'); o.value = cal.name; o.textContent = cal.name; if (cal.name === w.chronology) o.selected = true; calSelect.appendChild(o); }
	if (!isNew) calSelect.disabled = true;
	calSelect.addEventListener('change', () => { (w as unknown as Record<string, string>).chronology = calSelect.value; saveDraft(w); });
	const calRow = div('form-row', h('label', 'form-label', '历法'), calSelect,
		isNew ? div('setting-hint', '⚠ 保存后历法不可修改') : div('setting-hint', '历法已锁定，不可修改'),
	);

	// 地图尺寸
	const mapW = document.createElement('input'); mapW.type = 'number'; mapW.className = 'text-input'; mapW.style.width = '70px';
	mapW.min = '1'; mapW.max = '200'; mapW.value = String(w.config.mapWidth); mapW.placeholder = '宽';
	mapW.addEventListener('input', () => { w.config.mapWidth = Number(mapW.value) || 10; saveDraft(w); });
	const mapH = document.createElement('input'); mapH.type = 'number'; mapH.className = 'text-input'; mapH.style.width = '70px';
	mapH.min = '1'; mapH.max = '200'; mapH.value = String(w.config.mapHeight); mapH.placeholder = '高';
	mapH.addEventListener('input', () => { w.config.mapHeight = Number(mapH.value) || 10; saveDraft(w); });
	const mapSizeRow = div('form-row', h('label', 'form-label', '地图尺寸'), mapW, h('span', '', '×'), mapH,
		isNew ? div('setting-sub', '宽 × 高（格数），保存后不可修改') : div('setting-sub', '地图尺寸已锁定，不可修改'),
	);
	if (!isNew) { mapW.disabled = true; mapH.disabled = true; }

	const entities = [
		{ label: t('editor.newEvent'), count: wevents.length, hash: '#editor/event/new' },
		{ label: t('editor.newCharShort'), count: chars.length, hash: '#editor/character/new' },
		{ label: t('editor.newState'), count: states.length, hash: '#editor/state/new' },
		{ label: t('editor.newOrg'), count: orgs.length, hash: '#editor/org/new' },
	];

	const sections = entities.map(e => {
		const sec = div('form-section', div('db-row', h('span', 'db-world-name', `${e.label} (${e.count})`), button('＋ 新建', () => { saveDraft(w); window.location.hash = e.hash; }, 'small-btn')));
		if (e.label === t('editor.newEvent') && wevents.length > 0) {
			const list = div('entity-list');
			wevents.forEach((evt, i) => { const row = div('db-row'); row.innerHTML = `<span style="font-size:0.82rem;color:#666">${evt.id}</span><span style="flex:1">${evt.describe || '(无描述)'}</span>`; row.appendChild(button('修改', () => { saveDraft(w); sessionStorage.setItem(KEYS.EVENT_IDX, String(i)); window.location.hash = '#editor/event/new'; }, 'small-btn')); list.appendChild(row); });
			sec.appendChild(list);
		}
		if (e.label === t('editor.newCharShort') && chars.length > 0) {
			const list = div('entity-list');
			chars.forEach(ch => { const row = div('db-row'); row.innerHTML = `<span style="font-size:0.82rem;color:#666">#${ch.id}</span><span style="flex:1">${ch.getName('zh_CN')}</span>`; row.appendChild(button('修改', () => { sessionStorage.setItem(KEYS.CHAR_ID, String(ch.id)); window.location.hash = '#editor/character/new'; }, 'small-btn')); list.appendChild(row); });
			sec.appendChild(list);
		}
		if (e.label === t('editor.newState') && states.length > 0) {
			const list = div('entity-list');
			states.forEach(s => { const row = div('db-row'); row.innerHTML = `<span style="font-size:0.82rem;color:#666">${s.id}</span><span style="flex:1">${s.getName('zh_CN')}</span>`; row.appendChild(button('修改', () => { sessionStorage.setItem(KEYS.STATE_ID, s.id); window.location.hash = '#editor/state/new'; }, 'small-btn')); list.appendChild(row); });
			sec.appendChild(list);
		}
		if (e.label === t('editor.newOrg') && orgs.length > 0) {
			const list = div('entity-list');
			orgs.forEach(o => { const row = div('db-row'); row.innerHTML = `<span style="font-size:0.82rem;color:#666">${o.id}</span><span style="flex:1">${o.getName('zh_CN')}</span>`; row.appendChild(button('修改', () => { sessionStorage.setItem(KEYS.ORG_ID, o.id); window.location.hash = '#editor/org/new'; }, 'small-btn')); list.appendChild(row); });
			sec.appendChild(list);
		}
		return sec;
	});

	// 时间轴配置
	const cfg = w.config;
	const tgSection = div('form-section',
		h('h2', '', '时间轴配置'),
		div('form-row', h('label', 'form-label', 'endTime 策略'),
			(() => { const s = document.createElement('select'); s.className = 'form-select';
				for (const opt of ['instant','lifelong','eternal','error']) { const o = document.createElement('option'); o.value = opt; o.textContent = ({instant:'瞬时',lifelong:'终身',eternal:'永恒',error:'报错'} as Record<string,string>)[opt]; if (opt === cfg.defaultEndTimeStrategy) o.selected = true; s.appendChild(o); }
				s.addEventListener('change', () => { cfg.defaultEndTimeStrategy = s.value; saveDraft(w); }); return s; })(),
		), div('setting-sub', '事件缺少 endTime 时的默认策略'),
		h('h3', '', '标签白名单'), div('setting-sub', '勾选的标签中角色显示在时间轴上'),
		(() => { const area = div('entity-list'); area.style.cssText = 'max-height:120px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;padding:6px';
			listTags().then(tags => { const wtags = tags.filter(t => t.world === w.id);
				if (wtags.length === 0) { area.innerHTML = '<div style="color:#aaa;font-size:0.8rem">暂无标签</div>'; return; }
				for (const tg of wtags) { const lb = document.createElement('label'); lb.style.cssText = 'display:flex;align-items:center;gap:6px;padding:1px 0;font-size:0.82rem;cursor:pointer'; const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = tg.name; if (cfg.tagWhitelist.includes(tg.name)) cb.checked = true; cb.addEventListener('change', () => { cfg.tagWhitelist = [...area.querySelectorAll<HTMLInputElement>('input:checked')].map(c => c.value); saveDraft(w); }); lb.appendChild(cb); lb.appendChild(document.createTextNode(tg.name)); area.appendChild(lb); } }); return area; })(),
		h('h3', '', '标签黑名单'), div('setting-sub', '勾选的标签中角色始终隐藏'),
		(() => { const area = div('entity-list'); area.style.cssText = 'max-height:120px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;padding:6px';
			listTags().then(tags => { const wtags = tags.filter(t => t.world === w.id);
				for (const tg of wtags) { const lb = document.createElement('label'); lb.style.cssText = 'display:flex;align-items:center;gap:6px;padding:1px 0;font-size:0.82rem;cursor:pointer'; const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = tg.name; if (cfg.tagBlacklist.includes(tg.name)) cb.checked = true; cb.addEventListener('change', () => { cfg.tagBlacklist = [...area.querySelectorAll<HTMLInputElement>('input:checked')].map(c => c.value); saveDraft(w); }); lb.appendChild(cb); lb.appendChild(document.createTextNode(tg.name)); area.appendChild(lb); } }); return area; })(),
		h('h3', '', '角色白名单'), div('setting-sub', '勾选的角色强制显示'),
		(() => { const area = div('entity-list'); area.style.cssText = 'max-height:120px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;padding:6px';
			for (const ch of chars) { const lb = document.createElement('label'); lb.style.cssText = 'display:flex;align-items:center;gap:6px;padding:1px 0;font-size:0.82rem;cursor:pointer'; const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = String(ch.id); if (cfg.charWhitelist.includes(String(ch.id))) cb.checked = true; cb.addEventListener('change', () => { cfg.charWhitelist = [...area.querySelectorAll<HTMLInputElement>('input:checked')].map(c => c.value); saveDraft(w); }); lb.appendChild(cb); lb.appendChild(document.createTextNode(`${ch.getName('zh_CN')} (#${ch.id})`)); area.appendChild(lb); } return area; })(),
		h('h3', '', '角色黑名单'), div('setting-sub', '勾选的角色强制隐藏'),
		(() => { const area = div('entity-list'); area.style.cssText = 'max-height:120px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;padding:6px';
			for (const ch of chars) { const lb = document.createElement('label'); lb.style.cssText = 'display:flex;align-items:center;gap:6px;padding:1px 0;font-size:0.82rem;cursor:pointer'; const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = String(ch.id); if (cfg.charBlacklist.includes(String(ch.id))) cb.checked = true; cb.addEventListener('change', () => { cfg.charBlacklist = [...area.querySelectorAll<HTMLInputElement>('input:checked')].map(c => c.value); saveDraft(w); }); lb.appendChild(cb); lb.appendChild(document.createTextNode(`${ch.getName('zh_CN')} (#${ch.id})`)); area.appendChild(lb); } return area; })(),
	);

	// 地图地块概览
	const tileSection = div('form-section',
		h('h2', '', '地图地块'),
		div('setting-sub', `已命名 ${tiles.length} 个地块。在地图页面点击地块即可为其命名或改名`),
		tiles.length > 0
			? div('entity-list', ...tiles.map(tl => {
				const row = div('form-row');
				row.innerHTML = `<span style="font-size:0.82rem;color:#666;min-width:70px">${tl.coord}</span><span style="flex:1">${tl.getName('zh_CN')}</span>`;
				return row;
			}))
			: (() => { const el = div('entity-list'); el.innerHTML = '<div style="color:#aaa;padding:4px">暂无地块名称（前往地图页点击地块命名）</div>'; return el; })(),
		button('🗺 编辑地图', () => { saveDraft(w); window.location.hash = '#editor/map'; }, 'small-btn'),
	);

	const saveBtn = document.createElement('button');
	saveBtn.className = 'submit-btn';
	saveBtn.textContent = isNew ? t('editor.createWorld') : t('editor.saveWorld');
	saveBtn.addEventListener('click', async () => {
		if (!(w.name['zh_CN'] ?? '').trim()) { alert('世界名称（zh_CN）不能为空'); return; }
		try {
			await saveWorld(w);
			sessionStorage.removeItem(KEYS.DRAFT);
			sessionStorage.setItem(KEYS.WORLD_ID, String(w.id));
			alert('保存成功！');
			if (isNew) window.location.hash = '#home';
		} catch (err) {
			alert('保存失败：' + (err as Error).message);
		}
	});

	container.append(back, title, div('form-section', h('h2', '', t('editor.basicInfo')), div('form-row', h('label', 'form-label', '名称'), nameZh, nameEn), calRow, mapSizeRow), ...sections, tgSection, tileSection, saveBtn);
}
