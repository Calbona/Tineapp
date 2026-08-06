/**
 * 角色间关系 — 夫妻、亲子等。
 */
import TimeSpan from './TimeSpan.ts';
import TimePoint from './TimePoint.ts';
import type { JsonRelationship } from '../services/data-manager.ts';

export default class CharacterRelationship {

	readonly targetId: number;
	readonly span: TimeSpan;
	readonly type: string;
	readonly describe: string;

	static readonly RESERVED_TYPES = new Set(['parent', 'child', 'couple']);

	constructor(targetId: number, span: TimeSpan, type: string, describe: string) {
		this.targetId = targetId;
		this.span = span;
		this.type = type;
		this.describe = describe;
	}

	static fromJSON(json: JsonRelationship): CharacterRelationship {
		return new CharacterRelationship(
			json.target,
			TimeSpan.fromJSON(json.time, json.endTime, json.endType),
			json.type ?? '',
			json.describe ?? '',
		);
	}

	toJSON(): JsonRelationship {
		const j: JsonRelationship = {
			target: this.targetId,
			...this.span.toJSON(),
			type: this.type,
			describe: this.describe,
		};
		return j;
	}

	get time(): TimePoint { return this.span.start; }
	get endTime(): TimePoint | null { return this.span.end; }
	get endType(): string { return this.span.endType; }
}
