/**
 * 全局设置页。
 * 外观和语言为全局生效；时间跨度/调色盘/显示分组为新建世界时的默认值。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h, formRow, select, colorInput, textInput, toggleGroup } from '../../core/dom.ts';
import {
	loadSettings,
	saveSettings,
	resetSettings,
	type AppSettings,
} from '../../services/config-loader.ts';
import { applyTheme } from '../../services/theme.ts';
import { t } from '../../services/i18n.ts';

import './settings.css';

export const SettingsPage: Page = {
	render(container: HTMLElement) {
		const settings = loadSettings();

		container.innerHTML = '';

		const back = button(t('nav.back'), () => { window.location.hash = '#home'; }, 'back-btn');
		const title = h('h1', 'page-title', t('settings.title'));

		// 外观 — 全局生效，即时切换
		const themeGroup = toggleGroup(
			[
				{ value: 'light', label: t('settings.themeLight') },
				{ value: 'dark', label: t('settings.themeDark') },
				{ value: 'system', label: t('settings.themeSystem') },
			],
			settings.theme,
			(value) => {
				settings.theme = value as AppSettings['theme'];
				applyTheme(value as AppSettings['theme']);
			},
		);

		const appearanceSection = div('form-section',
			h('h2', '', t('settings.appearance')),
			div('setting-hint', t('settings.appearanceHint')),
			themeGroup,
		);

		// 语言 — 全局生效
		const langOptions = [
			{ value: 'zh_CN', label: '简体中文 (zh_CN)' },
			{ value: 'en_US', label: 'English (en_US)' },
		];
		for (const cl of settings.customLanguages) {
			langOptions.push({ value: cl, label: cl });
		}
		if (!langOptions.some(o => o.value === settings.language)) {
			langOptions.push({ value: settings.language, label: `${settings.language} (${t('settings.currentLanguage')})` });
		}

		const langSelect = select(langOptions, settings.language, (value) => {
			settings.language = value;
		}, 'form-select');

		const customLangInput = textInput('', t('settings.customLangPlaceholder'), () => {}, 'text-input');
		customLangInput.id = 'custom-lang-input';

		const addLangBtn = button(t('settings.addCustomLang'), () => {
			const input = document.getElementById('custom-lang-input') as HTMLInputElement;
			const code = input.value.trim();
			if (code && code !== 'zh_CN' && code !== 'en_US' && !settings.customLanguages.includes(code)) {
				settings.customLanguages.push(code);
				this.render(container);
			}
			input.value = '';
		}, 'small-btn');

		const langSection = div('form-section',
			h('h2', '', t('settings.language')),
			div('setting-hint', t('settings.languageHint')),
			formRow(t('settings.currentLanguage'), langSelect),
			div('form-row', customLangInput, addLangBtn),
		);

		// 调色盘（备用）
		const paletteContainer = div('palette-grid');

		const renderPalette = () => {
			paletteContainer.innerHTML = '';
			settings.colorPalette.forEach((color, i) => {
				const ci = colorInput(color, (value) => {
					settings.colorPalette[i] = value;
				});
				const removeBtn = button('✕', () => {
					settings.colorPalette.splice(i, 1);
					renderPalette();
				}, 'palette-remove-btn');
				const item = div('palette-item', ci, removeBtn);
				paletteContainer.append(item);
			});
		};
		renderPalette();

		const addColorBtn = button(t('settings.addColor'), () => {
			settings.colorPalette.push('#888888');
			renderPalette();
		}, 'small-btn');

		const presets = [
			{
				name: t('settings.presetSoft'),
				colors: ['#ffb0b0', '#ffd1b0', '#ffeeb0', '#ffffb0', '#baffb0', '#b0ffed', '#b0ddff', '#b0c4ff', '#b9b0ff', '#ffb0ff'],
			},
			{
				name: t('settings.presetEarth'),
				colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3', '#DAA520', '#B8860B', '#D2691E', '#Sienna', '#A0522D'],
			},
			{
				name: t('settings.presetCool'),
				colors: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600', '#7bc8f6', '#5b9bd5'],
			},
		];

		const presetButtons = presets.map(p =>
			button(p.name, () => {
				settings.colorPalette = [...p.colors];
				renderPalette();
			}, 'small-btn'),
		);

		const paletteSection = div('form-section',
			h('h2', '', t('settings.palette')),
			div('setting-hint', t('settings.paletteHint')),
			paletteContainer,
			div('palette-actions', addColorBtn, ...presetButtons),
		);

		// 操作按钮
		const saveBtn = button(t('settings.save'), () => {
			saveSettings(settings);
			showToast(t('settings.saved'));
		}, 'submit-btn');

		const resetBtn = button(t('settings.reset'), () => {
			if (confirm(t('settings.resetConfirm'))) {
				const defaults = resetSettings();
				applyTheme(defaults.theme);
				this.render(container);
				showToast(t('settings.resetDone'));
			}
		}, 'reset-btn');

		const actionsSection = div('form-section', saveBtn, resetBtn);

		container.append(
			back, title,
			appearanceSection, langSection,
			paletteSection,
			actionsSection,
		);
	},
};

/**
 * 底部 toast 提示，淡入 → 停顿 → 淡出。
 * @param msg 提示文字
 */
function showToast(msg: string): void {
	const toast = h('div', 'toast', msg);
	document.body.append(toast);
	requestAnimationFrame(() => toast.classList.add('show'));
	setTimeout(() => {
		toast.classList.remove('show');
		setTimeout(() => toast.remove(), 300);
	}, 1800);
}
