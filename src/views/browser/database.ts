/**
 * 数据库页 — 列出已有世界，每行含修改/删除按钮。
 */
import type { Page } from '../../core/router.ts';
import './database.css';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, deleteWorld, listCharacters, listWorldEvents, listStates, listOrganizations } from '../../services/repository.ts';
import World from '../../models/World.ts';

export const DatabasePage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', '', t('database.title')),
			(() => { const l = div('db-list'); l.innerHTML = `<div class="db-placeholder">${t('chronicle.loading')}</div>`; loadWorlds(l); return l; })(),
		);
	},
};

async function loadWorlds(el: HTMLElement) {
	const worlds = await listWorlds();
	if (worlds.length === 0) { el.innerHTML = `<div class="db-placeholder">${t('chronicle.noWorld')}</div>`; return; }
	renderList(el, worlds);
}

async function renderList(el: HTMLElement, worlds: World[]) {
	el.innerHTML = '';
	for (const w of worlds) {
		const chars = await listCharacters(w.id);
		const events = await listWorldEvents(w.id);
		const states = await listStates(w.id);
		const orgs = await listOrganizations(w.id);
		const row = div('db-row');
		row.innerHTML = `<span class="db-world-name">${w.getName('zh_CN')}</span><span class="db-world-meta">${events.length} 事件 · ${states.length} 国家 · ${orgs.length} 组织 · ${chars.length} 角色</span>`;
		row.appendChild(button('修改', () => { window.location.hash = `#editor/world/${w.id}`; }, 'small-btn'));
		row.appendChild(button('删除', async () => {
			if (confirm(`确认删除世界"${w.getName('zh_CN')}"及其全部数据？`)) {
				await deleteWorld(w.id);
				const worlds = await listWorlds();
				renderList(el, worlds);
			}
		}, 'small-btn'));
		el.appendChild(row);
	}
}
