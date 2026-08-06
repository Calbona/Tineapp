/**
 * 时间点 — 不可变值对象。
 * 按世界所选历法的单位动态存储，字段由 ChronologyJS 历法定义决定。
 */
import type { JsonTimePoint } from '../services/data-manager.ts';

export default class TimePoint {

	readonly year: number;
	readonly month?: number;
	readonly day?: number;
	readonly hour?: number;

	constructor(year: number, month?: number, day?: number, hour?: number) {
		this.year = year;
		this.month = month;
		this.day = day;
		this.hour = hour;
	}

	/** 从 JSON 创建 */
	static fromJSON(json: JsonTimePoint): TimePoint {
		return new TimePoint(json.year, json.month, json.day, json.hour);
	}

	/** 序列化为 JSON */
	toJSON(): JsonTimePoint {
		const j: JsonTimePoint = { year: this.year };
		if (this.month !== undefined) j.month = this.month;
		if (this.day !== undefined) j.day = this.day;
		if (this.hour !== undefined) j.hour = this.hour;
		return j;
	}

	/** 格式化输出，如 "前100年1月40日" */
	format(): string {
		const parts: string[] = [];
		if (this.year < 0) {
			parts.push(`前${Math.abs(this.year)}年`);
		} else {
			parts.push(`${this.year}年`);
		}
		if (this.month !== undefined) parts.push(`${this.month}月`);
		if (this.day !== undefined) parts.push(`${this.day}日`);
		if (this.hour !== undefined) parts.push(`${this.hour}时`);
		return parts.join('');
	}

	/** 排序键值 */
	get sortKey(): number {
		let k = this.year * 10000;
		if (this.month !== undefined) k += this.month * 100;
		if (this.day !== undefined) k += this.day;
		if (this.hour !== undefined) k += this.hour / 100;
		return k;
	}

	/** 比较：this 在 other 之前 */
	isBefore(other: TimePoint): boolean {
		return this.sortKey < other.sortKey;
	}

	/** 比较：this 在 other 之后 */
	isAfter(other: TimePoint): boolean {
		return this.sortKey > other.sortKey;
	}

	/** 从 Record 创建（数据驱动：按 units 定义取值） */
	static fromRecord(rec: Record<string, number | undefined>, units: { name: string }[]): TimePoint {
		const vals: Record<string, number | undefined> = {};
		for (const u of units) vals[u.name] = rec[u.name];
		return new TimePoint(vals['year'] ?? 0, vals['month'], vals['day'], vals['hour']);
	}

	/** 相等 */
	equals(other: TimePoint): boolean {
		return this.year === other.year
			&& this.month === other.month
			&& this.day === other.day
			&& this.hour === other.hour;
	}
}
