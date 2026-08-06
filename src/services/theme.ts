/**
 * 主题管理 — 将 AppSettings.theme 映射到 <html data-theme="...">
 * 支持三态：light / dark / system（跟随系统，通过 media query 决定）
 */
import { loadSettings, onSettingsChange, type AppSettings, type Theme } from './config-loader.ts';

/**
 * 应用主题到 <html> 元素
 */
export function applyTheme(theme?: Theme): void {
	const t = theme ?? loadSettings().theme;
	const root = document.documentElement;

	if (t === 'system') {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
	} else {
		root.setAttribute('data-theme', t);
	}
}

/**
 * 初始化主题 — 应用当前设置 + 监听系统变化 + 监听设置变化
 */
export function initTheme(): void {
	applyTheme();

	// 当用户在系统层面切换深色/浅色时，若当前为 system 模式则跟随
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		const current = loadSettings().theme;
		if (current === 'system') applyTheme('system');
	});

	// 当其他标签页修改设置时同步
	window.addEventListener('storage', (e) => {
		if (e.key === 'tineapp-settings') applyTheme();
	});
}
