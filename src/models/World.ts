/**
 * 世界 — 聚合根。
 * 管理历法选择、配置，不直接持有子实体（子实体通过 Repository 管理）。
 */
import type { JsonWorldData, JsonWorldConfig, JsonName } from '../services/data-manager.ts';

export class WorldConfig {
	tagWhitelist: string[];
	tagBlacklist: string[];
	charWhitelist: string[];
	charBlacklist: string[];
	defaultEndTimeStrategy: string;
	mapWidth: number;
	mapHeight: number;

	constructor(cfg?: Partial<WorldConfig>) {
		this.tagWhitelist = cfg?.tagWhitelist ?? ['ALL'];
		this.tagBlacklist = cfg?.tagBlacklist ?? [];
		this.charWhitelist = cfg?.charWhitelist ?? [];
		this.charBlacklist = cfg?.charBlacklist ?? [];
		this.defaultEndTimeStrategy = cfg?.defaultEndTimeStrategy ?? 'instant';
		this.mapWidth = cfg?.mapWidth ?? 10;
		this.mapHeight = cfg?.mapHeight ?? 10;
	}

	static fromJSON(json?: Partial<JsonWorldConfig>): WorldConfig {
		return new WorldConfig(json);
	}

	toJSON(): JsonWorldConfig {
		return {
			tagWhitelist: this.tagWhitelist,
			tagBlacklist: this.tagBlacklist,
			charWhitelist: this.charWhitelist,
			charBlacklist: this.charBlacklist,
			defaultEndTimeStrategy: this.defaultEndTimeStrategy,
			mapWidth: this.mapWidth,
			mapHeight: this.mapHeight,
		};
	}
}

export default class World {

	readonly id: number;
	readonly name: JsonName;
	readonly chronology: string;
	readonly config: WorldConfig;

	constructor(id: number, name: JsonName, chronology: string, config?: WorldConfig) {
		this.id = id;
		this.name = name;
		this.chronology = chronology;
		this.config = config ?? new WorldConfig();
	}

	getName(lang: string = 'zh_CN'): string {
		return this.name[lang] ?? Object.values(this.name).find(v => v.length > 0) ?? `World#${this.id}`;
	}

	static fromJSON(json: JsonWorldData): World {
		return new World(
			json.id, json.name, json.chronology,
			WorldConfig.fromJSON(json.config),
		);
	}

	toJSON(): JsonWorldData {
		return {
			id: this.id,
			name: this.name,
			chronology: this.chronology,
			config: this.config.toJSON(),
		};
	}
}
