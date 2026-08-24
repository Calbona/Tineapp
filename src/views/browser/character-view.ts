/**
 * 人物传记页 — 搜索框 + 左侧角色列表 + 右侧详情。
 * 详情底部有修改按钮，点击关系人名跳转星图。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listCharacters } from '../../services/repository.ts';
import Character from '../../models/Character.ts';
import World from '../../models/World.ts';

import './character-view.css';

export const CharacterViewPage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', t('character.title')),
			(() => { const m = div('cv-layout'); m.innerHTML = `<div class="cv-loading">${t('character.loading')}</div>`; initView(m); return m; })(),
		);
	},
};

async function initView(main: HTMLElement) {
	try {
		const worlds = await listWorlds();
		if (worlds.length === 0) { main.innerHTML = `<div class="cv-empty">${t('character.noWorld')}</div>`; return; }
		const targetCharId = Number(sessionStorage.getItem('tineapp-editor-charId') ?? '');
		let current = worlds[0];
		if (!isNaN(targetCharId)) {
			for (const w of worlds) {
				const tc = await listCharacters(w.id);
				if (tc.some(c => c.id === targetCharId)) { current = w; break; }
			}
		}
		let chars = await listCharacters(current.id);
		const nb = buildNameBook(chars);
		renderUI(main, worlds, current, chars, nb);

		if (!isNaN(targetCharId)) {
			const cl = main.querySelector('.cv-char-list') as HTMLElement;
			const detail = main.querySelector('.cv-detail') as HTMLElement;
			const targetCh = chars.find(c => c.id === targetCharId);
			if (targetCh) {
				const items = cl.querySelectorAll('.cv-char-item');
				const idx = chars.indexOf(targetCh);
				if (items[idx]) { items[idx].classList.add('active'); renderDetail(detail, targetCh, nb, current.id); }
			}
		}

		const sel = main.querySelector('.cv-world-select') as HTMLSelectElement;
		const search = main.querySelector('.cv-search') as HTMLInputElement;
		sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return; current = w;
			chars = await listCharacters(current.id);
			const n2 = buildNameBook(chars);
			doSearch(search.value, main.querySelector('.cv-char-list') as HTMLElement, chars, n2, main.querySelector('.cv-detail') as HTMLElement);
		});
		search.addEventListener('input', () => doSearch(search.value, main.querySelector('.cv-char-list') as HTMLElement, chars, nb, main.querySelector('.cv-detail') as HTMLElement));
	} catch (err) { main.innerHTML = `<div class="cv-error">${t('character.loadError')}${(err as Error).message}</div>`; }
}

function doSearch(query: string, el: HTMLElement, chars: Character[], nb: Map<number, string>, detail: HTMLElement) {
	const q = query.trim().toLowerCase();
	const filtered = q ? chars.filter(ch => ch.getName('zh_CN').toLowerCase().includes(q) || Object.values(ch.name).some(v => v.toLowerCase().includes(q))) : chars;
	renderCharList(el, filtered, nb, detail);
}

function renderUI(main: HTMLElement, worlds: World[], current: World, chars: Character[], nb: Map<number, string>) {
	main.innerHTML = '';
	const sel = document.createElement('select'); sel.className = 'cv-world-select';
	for (const w of worlds) {
		const o = document.createElement('option'); o.value = String(w.id);
		o.textContent = w.getName('zh_CN'); if (w.id === current.id) o.selected = true; sel.append(o);
	}
	const searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.className = 'text-input cv-search';
	searchInput.placeholder = '搜索角色…'; searchInput.style.cssText = 'flex:1;margin-left:8px';
	main.append(div('cv-world-bar', h('label', 'cv-world-label', t('character.selectWorld')), sel, searchInput));
	const content = div('cv-content');
	const cl = div('cv-char-list');
	const d = div('cv-detail');
	d.innerHTML = `<div class="cv-placeholder">${t('character.placeholder')}</div>`;
	content.append(cl, d);
	main.append(content);
	renderCharList(cl, chars, nb, d);
}

function renderCharList(el: HTMLElement, chars: Character[], nb: Map<number, string>, detail: HTMLElement) {
	el.innerHTML = chars.length === 0 ? `<div class="cv-empty">${t('character.noCharacters')}</div>` : '';
	for (const ch of chars) {
		const name = ch.getName('zh_CN');
		const evts = ch.events;
		const birth = evts.find(e => e.isBirth) ?? [...evts].sort((a, b) => a.time.sortKey - b.time.sortKey)[0];
		const death = evts.find(e => e.isDeath);
		let sub = '';
		if (birth && death) sub = `${birth.time.format()} — ${death.time.format()}`;
		else if (birth) sub = `${birth.time.format()} — `;
		const item = div('cv-char-item');
		item.innerHTML = `<div class="cv-char-name">${name}</div>${sub ? `<div class="cv-char-sub">${sub}</div>` : ''}`;
		item.addEventListener('click', () => {
			el.querySelectorAll('.cv-char-item').forEach(e => e.classList.remove('active'));
			item.classList.add('active');
			renderDetail(detail, ch, nb, ch.worldId);
		});
		el.appendChild(item);
	}
}

function renderDetail(el: HTMLElement, ch: Character, nb: Map<number, string>, worldId: number) {
	const pn = ch.getName('zh_CN');
	const nameObj = ch.name;
	const allN = Object.entries(nameObj).filter(([, v]) => v);
	const nameBlock = allN.length > 0
		? allN.map(([l, v]) => `<span class="cv-name-tag"><b>${l}</b> ${v}</span>`).join('')
		: `<span class="cv-name-tag">${t('character.unnamed')}</span>`;

	let ph = '';
	const props = ch.properties;
	if (Object.keys(props).length > 0) {
		ph = `<div class="cv-section"><h3>${t('character.properties')}</h3><div class="cv-props">`;
		for (const [k, v] of Object.entries(props)) ph += `<div class="cv-prop"><span class="cv-prop-key">${k}</span><span class="cv-prop-val">${Array.isArray(v) ? v.join(' / ') : v}</span></div>`;
		ph += '</div></div>';
	}

	const sorted = [...ch.events].sort((a, b) => a.time.sortKey - b.time.sortKey);
	let eh = `<div class="cv-section"><h3>${t('character.events')}</h3><div class="cv-timeline">`;
	if (sorted.length === 0) eh += `<div class="cv-empty">${t('character.noEvents')}</div>`;
	else for (const e of sorted) {
		const tl = e.type ? `【${e.type}】` : '';
		eh += `<div class="cv-event"><div class="cv-event-time">${e.span.format()}</div><div class="cv-event-body">${tl ? `<span class="cv-event-type">${tl}</span>` : ''}<span class="cv-event-desc">${e.describe}</span></div></div>`;
	}
	eh += '</div></div>';

	const rels = ch.relationships;
	let rh = `<div class="cv-section"><h3>${t('character.relationships')}</h3><div class="cv-relationships">`;
	if (rels.length === 0) rh += `<div class="cv-empty">${t('character.noRelationships')}</div>`;
	else for (const r of rels) {
		const tn = nb.get(r.targetId) ?? `${t('character.unknownChar')}#${r.targetId}`;
		rh += `<div class="cv-rel"><div class="cv-rel-type">${r.type}</div><div class="cv-rel-target" data-char-id="${r.targetId}" style="cursor:pointer;text-decoration:underline" title="点击查看星图">${tn}</div><div class="cv-rel-desc">${r.describe}</div><div class="cv-rel-time">${r.span.format()}</div></div>`;
	}
	rh += '</div></div>';

	const editBtn = `<button class="submit-btn" style="margin-top:16px" id="cv-edit-btn">✏ 修改此角色</button>`;
	el.innerHTML = `<h2 class="cv-detail-name">${pn}</h2><div class="cv-names">${nameBlock}</div>${ph}${eh}${rh}${editBtn}`;

	el.querySelector('#cv-edit-btn')?.addEventListener('click', () => {
		sessionStorage.setItem('tineapp-editor-worldId', String(worldId));
		sessionStorage.setItem('tineapp-editor-charId', String(ch.id));
		window.location.hash = '#editor/character/new';
	});

	el.querySelectorAll('[data-char-id]').forEach(relEl => {
		relEl.addEventListener('click', (e) => {
			e.stopPropagation();
			const id = (relEl as HTMLElement).getAttribute('data-char-id');
			sessionStorage.setItem('tineapp-editor-worldId', String(worldId));
			sessionStorage.setItem('tineapp-editor-charId', id!);
			window.location.hash = '#browser/starmap';
		});
	});
}

function buildNameBook(chars: Character[]): Map<number, string> {
	const m = new Map<number, string>();
	for (const ch of chars) m.set(ch.id, ch.getName('zh_CN'));
	return m;
}
