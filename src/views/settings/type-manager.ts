/**
 * 类型管理器 — 管理角色事件类型、世界事件类型、关系类型。
 * 保留键不可删除，用户可自由增删自定义类型。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import TypeRegistry from '../../models/TypeRegistry.ts';

export const TypeManagerPage: Page = {
	render(container: HTMLElement) {
		const registry = TypeRegistry.instance;
		container.innerHTML = '';

		const back = button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn');
		const title = h('h1', 'page-title', '类型管理');

		const configs: { key: string; label: string }[] = [
			{ key: 'charEvent', label: '人物事件类型' },
			{ key: 'worldEvent', label: '世界事件类型' },
			{ key: 'relationship', label: '关系类型' },
		];

		for (const cfg of configs) {
			const all = registry.list(cfg.key);
			const list = div('entity-list');

			for (const name of all) {
				const isReserved = registry.isReserved(cfg.key, name);
				const row = div('form-row');
				row.innerHTML = `<span style="flex:1;font-size:0.9rem">${name}${isReserved ? ' <span style="color:#999;font-size:0.75rem">(保留)</span>' : ''}</span>`;
				if (!isReserved) {
					row.appendChild(button('✕', () => {
						if (!confirm(`删除类型"${name}"？已使用此类型的事件/关系将失去该类型标记。`)) return;
						registry.remove(cfg.key, name);
						this.render(container);
					}, 'small-btn'));
				}
				list.appendChild(row);
			}

			const newInput = document.createElement('input');
			newInput.type = 'text'; newInput.className = 'text-input'; newInput.placeholder = '新类型名称';
			const addBtn = button('＋ 添加', () => {
				const val = newInput.value.trim();
				if (!val) { alert('请输入类型名称'); return; }
				if (!registry.add(cfg.key, val)) { alert('类型已存在或为保留键'); return; }
				this.render(container);
			}, 'small-btn');

			container.appendChild(div('form-section',
				h('h2', '', cfg.label),
				list,
				div('form-row', newInput, addBtn),
			));
		}

		container.prepend(title);
		container.prepend(back);
	},
};
