/**
 * 国家概况 — 世界选择 + 左侧列表 + 右侧详情。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listStates } from '../../services/repository.ts';
import State from '../../models/State.ts';
import World from '../../models/World.ts';

export const StateViewPage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		container.append(
			button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn'),
			h('h1', 'page-title', t('nav.state')),
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
		let states = await listStates(current.id);
		renderUI(main, worlds, current, states);

		const sel = main.querySelector('.cv-world-select') as HTMLSelectElement | null;
		if (!sel) return;
		sel.addEventListener('change', async () => {
			const w = worlds.find(w => w.id === Number(sel.value));
			if (!w) return;
			current = w;
			states = await listStates(current.id);
			renderStateList(main.querySelector('.cv-char-list') as HTMLElement, states, main.querySelector('.cv-detail') as HTMLElement);
		});
	} catch (err) {
		main.innerHTML = `<div class="cv-error">加载失败：${(err as Error).message}</div>`;
	}
}

function renderUI(
	main: HTMLElement, worlds: World[], current: World, states: State[],
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
	detailEl.innerHTML = '<div class="cv-placeholder">← 点击左侧国家查看详情</div>';
	content.append(listEl, detailEl);
	main.append(content);

	renderStateList(listEl, states, detailEl);

	// 如果有预设 ID，自动选中
	const stateId = sessionStorage.getItem('tineapp-editor-stateId');
	if (stateId) {
		const idx = states.findIndex(s => s.id === stateId);
		if (idx >= 0) {
			const items = listEl.querySelectorAll('.cv-char-item');
			items[idx]?.classList.add('active');
			renderDetail(detailEl, states[idx]);
		}
	}
}

function renderStateList(el: HTMLElement, states: State[], detail: HTMLElement) {
	el.innerHTML = states.length === 0 ? '<div class="cv-empty">暂无国家数据</div>' : '';
	for (const s of states) {
		const item = div('cv-char-item');
		item.innerHTML = `<div class="cv-char-name">${s.getName('zh_CN')}</div><div class="cv-char-sub">${s.span.format()}</div>`;
		item.addEventListener('click', () => {
			el.querySelectorAll('.cv-char-item').forEach(e => e.classList.remove('active'));
			item.classList.add('active');
			renderDetail(detail, s);
		});
		el.appendChild(item);
	}
}

function renderDetail(el: HTMLElement, state: State) {
	let html = `<h2 class="cv-detail-name">${state.getName('zh_CN')}</h2>`;
	html += `<p style="color:#888;font-size:0.85rem">ID: ${state.id} | ${state.span.format()}</p>`;
	html += '<div class="cv-section"><h3>领土时段</h3><div class="cv-timeline">';
	if (state.territories.length === 0) html += '<div class="cv-empty">暂无领土数据</div>';
	for (const t of state.territories) {
		const regions = t.regions.map(r => r.id).join(', ') || '无';
		html += `<div class="cv-event"><div class="cv-event-time">${t.span.format()}</div><div class="cv-event-body">领土: ${regions}</div></div>`;
	}
	html += '</div></div>';
	el.innerHTML = html;
}
