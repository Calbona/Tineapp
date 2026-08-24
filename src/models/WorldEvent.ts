/**
 * 世界事件 — 不属于特定角色的大事件。
 */
import TimeSpan from './TimeSpan.ts';
import type { JsonWorldEvent } from '../services/data-manager.ts';

export default class WorldEvent {

	readonly worldId: number;
	readonly id: string;
	readonly span: TimeSpan;
	readonly type: string;
	readonly describe: string;

	constructor(worldId: number, id: string, span: TimeSpan, type: string, describe: string) {
		this.worldId = worldId;
		this.id = id;
		this.span = span;
		this.type = type;
		this.describe = describe;
	}

	/** 从 ID 字符串解析分类 */
	get idCategory(): string {
		const match = this.id.match(/^([A-Z]+)(\d+)$/);
		return match ? match[1] : this.id;
	}

	static fromJSON(json: JsonWorldEvent, worldId: number): WorldEvent {
		return new WorldEvent(
			worldId, json.id,
			TimeSpan.fromJSON(json.time, json.endTime, json.endType),
			json.type ?? '',
			json.describe ?? '',
		);
	}

	toJSON(): JsonWorldEvent {
		const j: JsonWorldEvent = { id: this.id, ...this.span.toJSON(), describe: this.describe };
		if (this.type) j.type = this.type;
		return j;
	}
}
