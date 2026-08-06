/**
 * 时间段 — 不可变值对象。
 * 由开始时间 + 结束时间（可选）+ 结束类型组成。
 */
import TimePoint from './TimePoint.ts';
import type { JsonTimePoint } from '../services/data-manager.ts';

export type EndType = 'instant' | 'lifelong' | 'eternal' | 'default' | '';

export default class TimeSpan {

	readonly start: TimePoint;
	readonly end: TimePoint | null;
	readonly endType: EndType;

	constructor(start: TimePoint, end: TimePoint | null, endType: EndType = '') {
		this.start = start;
		this.end = end;
		this.endType = endType;
	}

	/** 从 JSON 创建 */
	static fromJSON(start: JsonTimePoint, end?: JsonTimePoint, endType?: string): TimeSpan {
		return new TimeSpan(
			TimePoint.fromJSON(start),
			end ? TimePoint.fromJSON(end) : null,
			(endType as EndType) ?? '',
		);
	}

	/** 序列化为 JSON */
	toJSON(): { time: JsonTimePoint; endTime?: JsonTimePoint; endType?: string } {
		const j: { time: JsonTimePoint; endTime?: JsonTimePoint; endType?: string } = {
			time: this.start.toJSON(),
		};
		if (this.end) j.endTime = this.end.toJSON();
		if (this.endType) j.endType = this.endType;
		return j;
	}

	/** 格式化输出 */
	format(): string {
		if (!this.end || this.endType === 'instant') {
			return this.start.format();
		}
		if (this.endType === 'lifelong') {
			return `${this.start.format()} — 终身`;
		}
		if (this.endType === 'eternal') {
			return `${this.start.format()} — 永恒`;
		}
		return `${this.start.format()} — ${this.end.format()}`;
	}

	/** 判断另一时间点是否在此时间段内 */
	contains(time: TimePoint): boolean {
		if (time.isBefore(this.start)) return false;
		if (!this.end || this.endType === 'instant' || this.endType === 'lifelong' || this.endType === 'eternal') return true;
		return !time.isAfter(this.end);
	}

	/** 从 Record 创建（数据驱动） */
	static fromRecord(start: Record<string, number | undefined>, end: Record<string, number | undefined>, units: { name: string }[], endType?: string): TimeSpan {
		return new TimeSpan(
			TimePoint.fromRecord(start, units),
			Object.values(end).some(v => v !== undefined) ? TimePoint.fromRecord(end, units) : null,
			(endType as EndType) ?? '',
		);
	}

	/** 是否为瞬时事件 */
	get isInstant(): boolean {
		return this.endType === 'instant' || (!this.end && this.endType === '');
	}
}
