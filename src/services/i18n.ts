/**
 * 国际化服务 — 从 public/assets/lang/ 加载翻译 JSON，数据驱动。
 * 使用方式：t('home.addModify') 返回当前语言的对应文本。
 */
import { loadSettings, onSettingsChange } from './config-loader.ts';

/** 当前语言的翻译表 */
let _messages: Record<string, unknown> = {};

/** 已加载的语言缓存 */
const _loaded = new Set<string>();

/** 页面重渲染回调（语言切换时触发） */
type LangListener = () => void;
const _listeners: Set<LangListener> = new Set();

/**
 * 获取翻译文本。
 * @param key 点分隔的键路径，如 'settings.title'
 * @param fallback 未找到时的回退值
 */
export function t(key: string, fallback: string = key): string {
	const parts = key.split('.');
	let node: unknown = _messages;
	for (const p of parts) {
		if (node == null || typeof node !== 'object') return fallback;
		node = (node as Record<string, unknown>)[p];
	}
	return typeof node === 'string' ? node : fallback;
}

/**
 * 初始化 — 加载当前设置的语言
 */
export async function initI18n(): Promise<void> {
	const settings = loadSettings();
	await loadLanguage(settings.language);

	// 语言切换时重新加载并通知所有视图重渲染
	onSettingsChange(async (s) => {
		await loadLanguage(s.language);
		for (const fn of _listeners) fn();
	});
}

/**
 * 加载指定语言的翻译文件
 */
async function loadLanguage(lang: string): Promise<void> {
	if (_loaded.has(lang)) return;

	try {
		const path = `public/assets/lang/${lang}.json`;
		let text: string;
		if (window.appAPI) {
			text = await window.appAPI.readFile(path);
		} else {
			const res = await fetch(`/assets/lang/${lang}.json`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			text = await res.text();
		}
		_messages = JSON.parse(text);
		_loaded.add(lang);
		return;
	} catch { /* 加载失败时保持当前翻译 */ }

	// 回退：加载 zh_CN
	if (lang !== 'zh_CN') {
		await loadLanguage('zh_CN');
	}
}

/**
	* 注册语言变更监听器（页面重渲染回调）。
 * 返回取消注册的函数。
 */
export function onLanguageChange(fn: LangListener): () => void {
	_listeners.add(fn);
	return () => _listeners.delete(fn);
}
