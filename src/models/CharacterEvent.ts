/**
 * 角色生平事件 — 出生、死亡、婚姻等。
 */
import TimeSpan from './TimeSpan.ts';
import TimePoint from './TimePoint.ts';
import type { JsonCharacterEvent, JsonTimePoint } from '../services/data-manager.ts';

export default class CharacterEvent {

	readonly span: TimeSpan;
	readonly type: string;
	readonly describe: string;

	static readonly RESERVED_TYPES = new Set(['birth', 'death', 'marriage']);

	constructor(span: TimeSpan, type: string, describe: string) {
		this.span = span;
		this.type = type;
		this.describe = describe;
	}

	static fromJSON(json: JsonCharacterEvent): CharacterEvent {
		return new CharacterEvent(
			TimeSpan.fromJSON(json.time, json.endTime, json.endType),
			json.type ?? '',
			json.describe ?? '',
		);
	}

	toJSON(): JsonCharacterEvent {
		const j: JsonCharacterEvent = { ...this.span.toJSON(), describe: this.describe };
		if (this.type) j.type = this.type;
		return j;
	}

	get time(): TimePoint { return this.span.start; }
	get endTime(): TimePoint | null { return this.span.end; }
	get endType(): string { return this.span.endType; }

	get isBirth(): boolean { return this.type === 'birth'; }
	get isDeath(): boolean { return this.type === 'death'; }
}
