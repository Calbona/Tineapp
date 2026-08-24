/**
 * 全局设置管理 — 存储到 localStorage，提供默认值（与 config.toml 结构对齐）
 */

export type Theme = 'light' | 'dark' | 'system';
export type EndTimeStrategy = 'error' | 'instant' | 'lifelong' | 'eternal';

export interface AppSettings {
	theme: Theme;
	language: string;
	/** 自定义语言键列表（zh_CN 和 en_US 为保留键，不可删除） */
	customLanguages: string[];
	colorPalette: string[];
}

const STORAGE_KEY = 'tineapp-settings';

const DEFAULTS: AppSettings = {
	theme: 'system',
	language: 'zh_CN',
	customLanguages: [],
	colorPalette: [
		'#ffb0b0', '#ffd1b0', '#ffeeb0', '#ffffb0', '#baffb0',
		'#b0ffed', '#b0ddff', '#b0c4ff', '#b9b0ff', '#ffb0ff',
	],
};

type Listener = (s: AppSettings) => void;
const listeners: Set<Listener> = new Set();

/**
 * 读取全部设置
 */
export function loadSettings(): AppSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return deepMerge(DEFAULTS as unknown as Record<string, unknown>, parsed) as unknown as AppSettings;
		}
	} catch { /* ignore corrupt data */ }
	return { ...DEFAULTS };
}

/**
 * 保存全部设置
 */
export function saveSettings(settings: AppSettings): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	notify(settings);
}

/**
 * 重置为默认值
 */
export function resetSettings(): AppSettings {
	localStorage.removeItem(STORAGE_KEY);
	notify(DEFAULTS);
	return { ...DEFAULTS };
}

/**
 * 订阅设置变更
 */
export function onSettingsChange(fn: Listener): () => void {
	listeners.add(fn);
	return () => listeners.delete(fn);
}

function notify(settings: AppSettings): void {
	for (const fn of listeners) fn(settings);
}

/**
 * 深度合并 — defaults 提供缺失的键
 */
function deepMerge(defaults: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
	const result = { ...defaults };
	for (const key of Object.keys(overrides)) {
		const dv = defaults[key];
		const ov = overrides[key];
		if (isObject(dv) && isObject(ov)) {
			result[key] = deepMerge(dv as Record<string, unknown>, ov as Record<string, unknown>);
		} else if (ov !== undefined) {
			result[key] = ov;
		}
	}
	return result;
}

function isObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}
