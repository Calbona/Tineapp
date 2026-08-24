/**
 * 历法注册表 — 集中管理 ChronologyJS 历法配置。
 * 数据持久化到 localStorage "tineapp-calendars"。
 * 时间输入字段根据历法的 units 定义动态生成，实现数据驱动。
 */

export interface CalendarDef {
	name: string;
	units: CalendarUnit[];
}

export interface CalendarUnit {
	name: string;
	default?: number;
	initial?: number;
}

const STORAGE_KEY = 'tineapp-calendars';

const DEFAULT_CALENDAR: CalendarDef = {
	name: 'ExampleWorldChronology',
	units: [
		{ name: 'year', default: 12, initial: -999 },
		{ name: 'month', default: 31 },
		{ name: 'day' },
	],
};

export default class CalendarRegistry {

	static #instance: CalendarRegistry | null = null;

	#calendars: CalendarDef[];

	private constructor() {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			try { this.#calendars = JSON.parse(raw) as CalendarDef[]; }
			catch { this.#calendars = [DEFAULT_CALENDAR]; }
		} else {
			this.#calendars = [DEFAULT_CALENDAR];
		}
	}

	static get instance(): CalendarRegistry {
		if (!CalendarRegistry.#instance) CalendarRegistry.#instance = new CalendarRegistry();
		return CalendarRegistry.#instance;
	}

	#save(): void {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#calendars));
	}

	/** 列出所有历法 */
	list(): CalendarDef[] {
		return this.#calendars;
	}

	/** 按名称查找历法 */
	get(name: string): CalendarDef | undefined {
		return this.#calendars.find(c => c.name === name);
	}

	/** 获取指定历法的时间单位列表 */
	getUnits(name: string): CalendarUnit[] {
		return this.get(name)?.units ?? DEFAULT_CALENDAR.units;
	}

	/** 获取默认历法 */
	get default(): CalendarDef {
		return this.#calendars[0] ?? DEFAULT_CALENDAR;
	}

	/** 更新全部历法配置（日历管理器使用） */
	replaceAll(calendars: CalendarDef[]): void {
		this.#calendars = calendars;
		this.#save();
	}
}
