/**
 * 自定义历法 — 直接编辑 ChronologyJS JSON。
 * 使用 CalendarRegistry 模型读写数据。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';
import { info } from '../../services/logger.ts';
import CalendarRegistry from '../../models/CalendarRegistry.ts';

const GUIDE_HTML = `
<div class="setting-hint" style="line-height:1.8;margin-bottom:16px">
<h3 style="margin-bottom:8px">ChronologyJS 历法 JSON 格式说明</h3>
<p>每个历法是一个对象，放在数组中。核心字段：</p>
<table style="font-size:0.85rem;margin:8px 0;border-collapse:collapse" border="1" cellpadding="6">
<tr><th>字段</th><th>类型</th><th>说明</th></tr>
<tr><td><code>name</code></td><td>string</td><td>历法名称，世界登记时选择</td></tr>
<tr><td><code>units</code></td><td>object[]</td><td>时间单位数组，<b>从小到大</b>排列（时→日→月→年）</td></tr>
</table>
<p>每个 unit 的字段：</p>
<table style="font-size:0.85rem;margin:8px 0;border-collapse:collapse" border="1" cellpadding="6">
<tr><th>字段</th><th>类型</th><th>说明</th></tr>
<tr><td><code>name</code></td><td>string</td><td>单位名，如 <code>"day"</code>、<code>"month"</code>、<code>"year"</code></td></tr>
<tr><td><code>default</code></td><td>number（有下级单位时必填）</td><td>该单位包含多少个下一级单位。最小时单位不填</td></tr>
<tr><td><code>initial</code></td><td>number（可选）</td><td>起始值，仅最顶层单位需要（如年份从-999开始）</td></tr>
</table>
<pre class="cal-example">[
  {
    "name": "ExampleWorldChronology",
    "units": [
      { "name": "year",  "default": 12, "initial": -999 },
      { "name": "month", "default": 31 },
      { "name": "day" }
    ]
  }
]</pre>
</div>`;

export const CalendarManagerPage: Page = {
	render(container: HTMLElement) {
		const registry = CalendarRegistry.instance;
		const data = registry.list();
		container.innerHTML = '';

		const back = button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn');
		const title = h('h1', 'page-title', '自定义历法');
		const guide = div('form-section');
		guide.innerHTML = GUIDE_HTML;

		const textarea = document.createElement('textarea');
		textarea.className = 'text-input';
		textarea.style.cssText = 'width:100%;min-height:300px;font-family:monospace;font-size:0.85rem;';
		textarea.value = JSON.stringify(data, null, '\t');

		const saveBtn = button('💾 保存', () => {
			try {
				const parsed = JSON.parse(textarea.value);
				if (!Array.isArray(parsed)) throw new Error('必须是数组');
				registry.replaceAll(parsed);
				info('data', '保存历法配置');
				alert('已保存');
			} catch (e) {
				alert('JSON 格式错误：' + (e as Error).message);
			}
		}, 'submit-btn');

		container.append(back, title, guide, div('form-section', '', textarea), div('form-section', '', saveBtn));
	},
};
