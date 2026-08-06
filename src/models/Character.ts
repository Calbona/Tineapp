/**
 * 角色 — 聚合根。
 * 管理多语言名称、属性、生平事件、人际关系。
 */
import TimePoint from './TimePoint.ts';
import TimeSpan from './TimeSpan.ts';
import CharacterEvent from './CharacterEvent.ts';
import CharacterRelationship from './CharacterRelationship.ts';
import type { JsonCharacterData, JsonName } from '../services/data-manager.ts';

export default class Character {

	readonly worldId: number;
	readonly id: number;
	readonly name: JsonName;
	readonly properties: Record<string, string | string[]>;

	private _events: CharacterEvent[] = [];
	private _relationships: CharacterRelationship[] = [];

	constructor(
		worldId: number,
		id: number,
		name: JsonName,
		properties: Record<string, string | string[]> = {},
	) {
		this.worldId = worldId;
		this.id = id;
		this.name = name;
		this.properties = properties;
	}

	// ── 工厂 ──

	static fromJSON(json: JsonCharacterData): Character {
		const ch = new Character(json.world, json.id, json.name, json.properties ?? {});
		for (const e of json.events ?? []) ch._events.push(CharacterEvent.fromJSON(e));
		for (const r of json.relationships ?? []) ch._relationships.push(CharacterRelationship.fromJSON(r));
		return ch;
	}

	toJSON(): JsonCharacterData {
		return {
			world: this.worldId,
			id: this.id,
			name: this.name,
			properties: Object.keys(this.properties).length > 0 ? this.properties : undefined,
			events: this._events.map(e => e.toJSON()),
			relationships: this._relationships.map(r => r.toJSON()),
		};
	}

	// ── 名称 ──

	getName(lang: string = 'zh_CN'): string {
		return this.name[lang]
			?? Object.values(this.name).find(v => v.length > 0)
			?? '(未命名)';
	}

	// ── 属性 ──

	getProperty(key: string): string | string[] | undefined {
		return this.properties[key];
	}

	// ── 事件 ──

	get events(): CharacterEvent[] {
		return [...this._events];
	}

	getEventsByType(type: string): CharacterEvent[] {
		return this._events.filter(e => e.type === type);
	}

	addEvent(event: CharacterEvent): void {
		this._events.push(event);
	}

	removeEvent(index: number): void {
		this._events.splice(index, 1);
	}

	/** 获取寿命区间 */
	getLifespan(): TimeSpan | null {
		const birth = this._events.find(e => e.isBirth);
		const death = this._events.find(e => e.isDeath);
		if (!birth) return null;
		if (!death) return new TimeSpan(birth.span.start, null, 'lifelong');
		return new TimeSpan(birth.span.start, death.span.start, '');
	}

	/** 判断在给定时间是否存活 */
	isAliveAt(time: TimePoint): boolean {
		const birth = this._events.find(e => e.isBirth);
		if (!birth || time.isBefore(birth.span.start)) return false;
		const death = this._events.find(e => e.isDeath);
		if (death && time.isAfter(death.span.start)) return false;
		return true;
	}

	// ── 关系 ──

	get relationships(): CharacterRelationship[] {
		return [...this._relationships];
	}

	addRelationship(rel: CharacterRelationship): void {
		this._relationships.push(rel);
	}

	getRelationshipsByType(type: string): CharacterRelationship[] {
		return this._relationships.filter(r => r.type === type);
	}
}
