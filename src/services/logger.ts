/**
 * 日志系统 — 记录运行时事件到 localStorage，支持级别和分类。
 * 所有数据操作（加载/保存/错误）均自动记录。
 */
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
	/** Unix 毫秒时间戳 */
	time: number;
	level: LogLevel;
	/** 分类：data / ui / system */
	category: string;
	message: string;
}

const KEY = 'tineapp-logs';
const MAX_LOGS = 500;

/** 读取全部日志 */
export function getLogs(): LogEntry[] {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? JSON.parse(raw) : [];
	} catch { return []; }
}

/** 写入一条日志 */
export function log(level: LogLevel, category: string, message: string): void {
	const logs = getLogs();
	logs.push({ time: Date.now(), level, category, message });
	if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
	localStorage.setItem(KEY, JSON.stringify(logs));
}

/** 便捷方法 */
export const info = (cat: string, msg: string) => log('info', cat, msg);
export const warn = (cat: string, msg: string) => log('warn', cat, msg);
export const error = (cat: string, msg: string) => log('error', cat, msg);

/** 清空日志 */
export function clearLogs(): void { localStorage.removeItem(KEY); }
