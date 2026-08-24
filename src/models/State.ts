/**
 * 国家 — 含领土时段管理。
 */
import TimePoint from './TimePoint.ts';
import TimeSpan from './TimeSpan.ts';
import type { JsonStateData, JsonTerritory, JsonRegion, JsonName } from '../services/data-manager.ts';

export class Region {
	readonly x: number;
	readonly y: number;

	constructor(x: number, y: number) { this.x = x; this.y = y; }

	static fromJSON(json: JsonRegion): Region { return new Region(json.x, json.y); }
	toJSON(): JsonRegion { return { x: this.x, y: this.y }; }
	get id(): string { return `${this.x}, ${this.y}`; }
}

export class Territory {
	readonly span: TimeSpan;
	readonly regions: Region[];

	constructor(span: TimeSpan, regions: Region[] = []) {
		this.span = span;
		this.regions = regions;
	}

	static fromJSON(json: JsonTerritory): Territory {
		return new Territory(
			TimeSpan.fromJSON(json.time, json.endTime),
			(json.regions ?? []).map(r => Region.fromJSON(r)),
		);
	}

	toJSON(): JsonTerritory {
		return { ...this.span.toJSON(), regions: this.regions.map(r => r.toJSON()) };
	}

	contains(time: TimePoint): boolean { return this.span.contains(time); }
}

export default class State {

	readonly worldId: number;
	readonly id: string;
	readonly name: JsonName;
	readonly span: TimeSpan;
	readonly territories: Territory[];

	constructor(
		worldId: number, id: string, name: JsonName,
		span: TimeSpan, territories: Territory[] = [],
	) {
		this.worldId = worldId;
		this.id = id;
		this.name = name;
		this.span = span;
		this.territories = territories;
	}

	getName(lang: string = 'zh_CN'): string {
		return this.name[lang] ?? Object.values(this.name).find(v => v.length > 0) ?? this.id;
	}

	/** 获取指定时间点的领土 */
	getTerritoriesAt(time: TimePoint): Territory[] {
		return this.territories.filter(t => t.contains(time));
	}

	static fromJSON(json: JsonStateData, worldId: number): State {
		return new State(
			worldId, json.id, json.name,
			TimeSpan.fromJSON(json.time, json.endTime),
			(json.territory ?? []).map(t => Territory.fromJSON(t)),
		);
	}

	toJSON(): JsonStateData {
		return {
			id: this.id,
			name: this.name,
			...this.span.toJSON(),
			territory: this.territories.map(t => t.toJSON()),
		};
	}
}
