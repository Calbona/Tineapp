/**
 * 运行日志 — 查看系统运行时日志。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { getLogs, clearLogs, type LogEntry } from '../../services/logger.ts';

export const LogViewPage: Page = {
	render(container: HTMLElement) {
		const logs = getLogs();
		container.innerHTML = '';

		const back = button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn');
		const title = h('h1', 'page-title', t('nav.log'));
		const clearBtn = button('清空日志', () => { clearLogs(); this.render(container); }, 'small-btn');

		if (logs.length === 0) {
			const empty = div('ch-content'); empty.innerHTML = '<div class="ch-empty">暂无日志记录</div>';
			container.append(back, title, empty);
			return;
		}

		let rows = '';
		for (const e of logs.reverse()) {
			const d = new Date(e.time);
			const ts = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
			const lc = e.level === 'error' ? 'ch-src-char' : e.level === 'warn' ? 'ch-src-world' : '';
			rows += `<tr><td class="ch-cell-time">${ts}</td><td class="ch-cell-type ${lc}">${e.level}</td><td class="ch-cell-type">${e.category}</td><td class="ch-cell-desc">${e.message}</td></tr>`;
		}

		const tableWrap = div('ch-table-wrap');
		tableWrap.innerHTML = `<table class="ch-table"><thead><tr><th>时间</th><th>级别</th><th>分类</th><th>消息</th></tr></thead><tbody>${rows}</tbody></table>`;
		const content = div('ch-content'); content.appendChild(tableWrap);

		container.append(back, title, clearBtn, content);
	},
};
