/**
 * 事件明细页 — 展示选中事件的完整信息（从事件查询页跳转）。
 * 世界事件：显示 ID、时间、类型、描述
 * 角色事件：额外显示角色名称、属性、该角色的全部事件
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { getWorld, listCharacters, listWorldEvents } from '../../services/repository.ts';
import { fmtSpan } from '../../services/event-utils.ts';
import Character from '../../models/Character.ts';
import WorldEvent from '../../models/WorldEvent.ts';
import './event-view.css';

export const EventDetailPage: Page = {
	async render(container: HTMLElement) {
		const raw = sessionStorage.getItem('ev-detail');
		if (!raw) { container.innerHTML = '<div class="ch-error">未选择事件</div>'; return; }
		const detail = JSON.parse(raw) as { type: string; worldId: number; eventId?: string; charId?: number; eventIdx?: number };

		container.innerHTML = '';
		const back = button('← 返回事件查询', () => { history.back(); }, 'back-btn');
		container.appendChild(back);

		if (detail.type === 'world') {
			await renderWorldEvent(container, detail.worldId, detail.eventId!);
		} else {
			await renderCharacterEvent(container, detail.worldId, detail.charId!, detail.eventIdx!);
		}
	},
};

async function renderWorldEvent(container: HTMLElement, worldId: number, eventId: string) {
	const world = await getWorld(worldId);
	const events = await listWorldEvents(worldId);
	const evt = events.find(e => e.id === eventId);
	if (!evt) { container.innerHTML += '<div class="ch-error">事件未找到</div>'; return; }

	let html = `<h1 class="page-title">事件明细 — 世界事件</h1>`;
	html += '<div class="form-section">';
	html += `<p><b>世界：</b>${world?.getName('zh_CN') ?? `#${worldId}`}</p>`;
	html += `<p><b>事件 ID：</b>${evt.id}</p>`;
	html += `<p><b>时间：</b>${evt.span.format()}</p>`;
	html += `<p><b>类型：</b>${evt.type || '—'}</p>`;
	html += `<p><b>描述：</b>${evt.describe}</p>`;
	html += '</div>';

	const detailEl = div('cv-detail'); detailEl.innerHTML = html;
	container.appendChild(detailEl);
}

async function renderCharacterEvent(container: HTMLElement, worldId: number, charId: number, eventIdx: number) {
	const world = await getWorld(worldId);
	const chars = await listCharacters(worldId);
	const ch = chars.find(c => c.id === charId);
	if (!ch) { container.innerHTML += '<div class="ch-error">角色未找到</div>'; return; }
	const evt = ch.events[eventIdx];
	if (!evt) { container.innerHTML += '<div class="ch-error">事件未找到</div>'; return; }

	let html = `<h1 class="page-title">事件明细 — 角色事件</h1>`;
	html += '<div class="form-section">';
	html += `<p><b>世界：</b>${world?.getName('zh_CN') ?? `#${worldId}`}</p>`;
	html += `<p><b>角色：</b>${ch.getName('zh_CN')}</p>`;
	html += `<h3 style="margin-top:16px">事件信息</h3>`;
	html += `<p><b>时间：</b>${evt.span.format()}</p>`;
	html += `<p><b>类型：</b>${evt.type || '—'}</p>`;
	html += `<p><b>描述：</b>${evt.describe}</p>`;
	html += '</div>';

	// 角色属性
	const props = ch.properties;
	if (Object.keys(props).length > 0) {
		html += '<div class="form-section"><h3>角色属性</h3>';
		for (const [k, v] of Object.entries(props)) {
			html += `<p style="font-size:0.9rem"><b>${k}：</b>${Array.isArray(v) ? v.join(' / ') : v}</p>`;
		}
		html += '</div>';
	}

	// 角色全部事件
	html += '<div class="form-section"><h3>该角色全部事件</h3><div class="cv-timeline">';
	const sorted = [...ch.events].sort((a, b) => a.time.sortKey - b.time.sortKey);
	for (let i = 0; i < sorted.length; i++) {
		const e = sorted[i];
		const marker = i === eventIdx ? ' ← 当前' : '';
		html += `<div class="cv-event"><div class="cv-event-time">${e.span.format()}${marker}</div><div class="cv-event-body">${e.type ? `<span class="cv-event-type">【${e.type}】</span>` : ''}${e.describe}</div></div>`;
	}
	html += '</div></div>';

	// 角色人际关系
	const rels = ch.relationships;
	if (rels.length > 0) {
		html += '<div class="form-section"><h3>人际关系</h3><div class="cv-relationships">';
		for (const r of rels) {
			const tn = chars.find(c => c.id === r.targetId)?.getName('zh_CN') ?? `角色#${r.targetId}`;
			html += `<div class="cv-rel"><div class="cv-rel-type">${r.type}</div><div class="cv-rel-target">${tn}</div><div class="cv-rel-desc">${r.describe}</div></div>`;
		}
		html += '</div></div>';
	}

	const detailEl = div('cv-detail'); detailEl.innerHTML = html;
	container.appendChild(detailEl);
}
