/**
 * 标签管理器 — 按世界管理标签。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { listWorlds, listCharacters, listTags, saveTags } from '../../services/repository.ts';
import Tag from '../../models/Tag.ts';

export const TagManagerPage: Page = {
	async render(container: HTMLElement) {
		const tags = await listTags();
		const worlds = await listWorlds();
		container.innerHTML = '';

		const back = button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn');
		const title = h('h1', 'page-title', '标签管理');

		const list = div('entity-list');
		const renderList = () => {
			list.innerHTML = tags.length === 0 ? '<div style="color:#aaa;padding:8px">暂无标签</div>' : '';
			for (let i = 0; i < tags.length; i++) {
				const tg = tags[i];
				const wname = worlds.find(w => w.id === tg.world)?.getName('zh_CN') ?? `世界#${tg.world}`;
				const isALL = tg.isReserved;
				const row = div('form-row');
				row.innerHTML = `<span style="min-width:80px;font-size:0.85rem;color:#888">${wname}</span><span style="flex:1"><b>${tg.name}</b>${isALL ? ' <span style="color:#999;font-size:0.75rem">(保留·全角色)</span>' : ''}</span><span style="font-size:0.78rem;color:#999">${isALL ? '自动' : tg.characterIds.length + '个角色'}</span>`;
				if (!isALL) row.appendChild(button('✕', () => { if (confirm(`删除"${tg.name}"？`)) { tags.splice(i, 1); saveTags(tags); renderList(); } }, 'small-btn'));
				list.appendChild(row);
			}
		};
		renderList();

		const worldSelect = document.createElement('select'); worldSelect.className = 'form-select'; worldSelect.style.width = '120px';
		for (const w of worlds) { const o = document.createElement('option'); o.value = String(w.id); o.textContent = w.getName('zh_CN'); worldSelect.appendChild(o); }

		const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'text-input'; nameInput.placeholder = '标签名（ALL=全角色）'; nameInput.style.width = '140px';

		const charArea = div('entity-list'); charArea.style.cssText = 'max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;padding:8px;margin-top:8px;display:none';

		const showCharList = async () => {
			const chars = await listCharacters(Number(worldSelect.value));
			charArea.innerHTML = chars.length === 0 ? '<div style="color:#aaa">该世界暂无角色</div>' : '';
			charArea.style.display = 'block';
			for (const ch of chars) {
				const label = document.createElement('label'); label.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 0;font-size:0.85rem;cursor:pointer';
				const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = String(ch.id);
				label.appendChild(cb); label.appendChild(document.createTextNode(`${ch.getName('zh_CN')} (#${ch.id})`));
				charArea.appendChild(label);
			}
		};

		worldSelect.addEventListener('change', () => { charArea.style.display = 'none'; });
		const selectBtn = button('选择人物', () => { charArea.style.display === 'none' ? showCharList() : (charArea.style.display = 'none'); }, 'small-btn');

		const addBtn = button('＋ 添加标签', () => {
			const worldId = Number(worldSelect.value);
			const name = nameInput.value.trim();
			if (!name) { alert('请输入标签名称'); return; }
			if (tags.some(t => t.world === worldId && t.name === name)) { alert('该世界下标签已存在'); return; }
			const ids = name === 'ALL' ? [] : [...charArea.querySelectorAll<HTMLInputElement>('input:checked')].map(cb => Number(cb.value));
			tags.push(new Tag(worldId, name, ids));
			saveTags(tags);
			nameInput.value = ''; charArea.style.display = 'none'; charArea.innerHTML = '';
			renderList();
		}, 'small-btn');

		container.append(back, title,
			div('form-section', h('h2', '', '已有标签'), list),
			div('form-section', h('h2', '', '新增标签'), div('form-row', worldSelect, nameInput, selectBtn, addBtn), charArea),
		);
	},
};
