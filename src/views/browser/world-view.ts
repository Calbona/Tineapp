/**
 * 组织概况 — 世界选择 + 左侧列表 + 右侧详情。
 * 通过标签系统映射展示成员。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listCharacters, listOrganizations, listTags } from '../../services/repository.ts';
import Organization from '../../models/Organization.ts';
import Tag from '../../models/Tag.ts';
import World from '../../models/World.ts';
import Character from '../../models/Character.ts';

export const WorldViewPage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', t('nav.world')),
			(() => { const m = div('cv-layout'); m.innerHTML = `<div class="cv-loading">${t('chronicle.loading')}</div>`; initView(m); return m; })(),
		);
	},
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) {
			main.innerHTML = `<div class="cv-empty">暂无世界数据</div>`;
			return;
		}
		let current = worlds[0];
		let orgs = await listOrganizations(current.id);
		const chars = await listCharacters(current.id);
		const allTags = await listTags();
		const nameBook = buildNameBook(chars);
		renderUI(main, worlds, current, orgs, nameBook, allTags);

		const sel = main.querySelector('.cv-world-select') as HTMLSelectElement | null;
		if (!sel) return;
		sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return;
			current = w;
			orgs = await listOrganizations(current.id);
			const chars = await listCharacters(current.id);
			const nameBook = buildNameBook(chars);
			const allTags = await listTags();
			renderOrgList(main.querySelector('.cv-char-list') as HTMLElement, orgs, nameBook, allTags, main.querySelector('.cv-detail') as HTMLElement);
		});
	} catch (err) {
		main.innerHTML = `<div class="cv-error">加载失败：${(err as Error).message}</div>`;
	}
}

function buildNameBook(chars: Character[]): Map<number, string> {
	const m = new Map<number, string>();
	for (const ch of chars) m.set(ch.id, ch.getName('zh_CN'));
	return m;
}

function renderUI(
	main: HTMLElement, worlds: World[], current: World,
	orgs: Organization[], nameBook: Map<number, string>, allTags: Tag[],
) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'cv-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN');
		if (w.id === current.id) o.selected = true; sel.append(o);
	}
	main.append(div('cv-world-bar', h('label', 'cv-world-label', '选择世界：'), sel));

	const content = div('cv-content');
	const listEl = div('cv-char-list');
	const detailEl = div('cv-detail');
	detailEl.innerHTML = '<div class="cv-placeholder">← 点击左侧组织查看详情</div>';
	content.append(listEl, detailEl);
	main.append(content);

	renderOrgList(listEl, orgs, nameBook, allTags, detailEl);
}

function renderOrgList(
	el: HTMLElement, orgs: Organization[],
	nameBook: Map<number, string>, allTags: Tag[], detail: HTMLElement,
) {
	el.innerHTML = orgs.length === 0 ? '<div class="cv-empty">暂无组织数据</div>' : '';
	for (const o of orgs) {
		const memberIds = o.getMemberIds(allTags);
		const item = div('cv-char-item');
		item.innerHTML = `<div class="cv-char-name">${o.getName('zh_CN')}</div><div class="cv-char-sub">${o.span.format()} · ${memberIds.length} 人</div>`;
		item.addEventListener('click', () => {
			el.querySelectorAll('.cv-char-item').forEach(e => e.classList.remove('active'));
			item.classList.add('active');
			renderDetail(detail, o, nameBook, allTags);
		});
		el.appendChild(item);
	}
}

function renderDetail(
	el: HTMLElement, org: Organization,
	nameBook: Map<number, string>, allTags: Tag[],
) {
	const memberIds = org.getMemberIds(allTags);
	const tags = org.tags.join(', ') || '—';

	let html = `<h2 class="cv-detail-name">${org.getName('zh_CN')}</h2>`;
	html += `<p style="color:#888;font-size:0.85rem">ID: ${org.id} | ${org.span.format()}</p>`;

	html += '<div class="cv-section"><h3>成员</h3>';
	if (memberIds.length === 0) {
		html += '<div class="cv-empty">暂无成员（未关联标签或标签无角色）</div>';
	} else {
		html += '<div class="cv-relationships">';
		for (const id of memberIds) {
			const chName = nameBook.get(id) ?? `角色#${id}`;
			html += `<div class="cv-rel"><div class="cv-rel-target" data-char-id="${id}" style="cursor:pointer;text-decoration:underline">${chName}</div></div>`;
		}
		html += '</div>';
	}
	html += '</div>';

	html += '<div class="cv-section"><h3>关联标签</h3>';
	html += `<p style="font-size:0.9rem">${tags}</p>`;
	html += '</div>';

	el.innerHTML = html;

	// 点击人名跳转人物传记
	el.querySelectorAll('[data-char-id]').forEach(el => {
		el.addEventListener('click', (e) => {
			e.stopPropagation();
			const id = (el as HTMLElement).getAttribute('data-char-id');
			sessionStorage.setItem('tineapp-editor-charId', id!);
			window.location.hash = '#browser/character';
		});
	});
}
