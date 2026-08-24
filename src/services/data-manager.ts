/**
 * JSON 类型定义 — 所有数据接口的单一真相源。
 * 工具函数已移入对应的模型类中，此处保留少量跨模块共用工具。
 */

// ═══════════════════ 缓存 ═══════════════════

const cache = new Map<string, unknown>();

export function clearCache(): void {
	cache.clear();
}

// ═══════════════════ 名称工具（跨类型共用） ═══════════════════

export function getName(name: Record<string, string>, lang: string): string {
	return name[lang] ?? Object.values(name).find(v => v.length > 0) ?? '(未命名)';
}

// ═══════════════════ 基础类型 ═══════════════════

export interface JsonTimePoint {
	year: number;
	month?: number;
	day?: number;
	hour?: number;
}

export type JsonName = Record<string, string>;

// ═══════════════════ 世界 ═══════════════════

export interface JsonWorldConfig {
	tagWhitelist: string[];
	tagBlacklist: string[];
	charWhitelist: string[];
	charBlacklist: string[];
	defaultEndTimeStrategy: string;
	mapWidth: number;
	mapHeight: number;
}

export interface JsonWorldData {
	id: number;
	name: JsonName;
	chronology: string;
	events?: JsonWorldEvent[];
	states?: JsonStateData[];
	organizations?: JsonOrgData[];
	config?: JsonWorldConfig;
}

// ═══════════════════ 世界事件 ═══════════════════

export interface JsonWorldEvent {
	id: string;
	time: JsonTimePoint;
	endTime?: JsonTimePoint;
	endType?: string;
	type?: string;
	describe: string;
}

// ═══════════════════ 角色 ═══════════════════

export interface JsonCharacterEvent {
	time: JsonTimePoint;
	endTime?: JsonTimePoint;
	endType?: string;
	type?: string;
	describe: string;
}

export interface JsonRelationship {
	target: number;
	time: JsonTimePoint;
	endTime?: JsonTimePoint;
	endType?: string;
	type: string;
	describe: string;
}

export interface JsonCharacterData {
	world: number;
	id: number;
	name: JsonName;
	properties?: Record<string, string | string[]>;
	events: JsonCharacterEvent[];
	relationships: JsonRelationship[];
}

// ═══════════════════ 国家 ═══════════════════

export interface JsonRegion {
	x: number;
	y: number;
}

export interface JsonTerritory {
	time: JsonTimePoint;
	endTime?: JsonTimePoint;
	regions: JsonRegion[];
}

export interface JsonStateData {
	id: string;
	name: JsonName;
	time: JsonTimePoint;
	endTime?: JsonTimePoint;
	territory: JsonTerritory[];
}

// ═══════════════════ 组织 ═══════════════════

export interface JsonOrgData {
	id: string;
	name: JsonName;
	time: JsonTimePoint;
	endTime?: JsonTimePoint;
	tags: string[];
}

// ═══════════════════ 标签 ═══════════════════

export interface JsonTagData {
	world: number;
	name: string;
	characters?: number[];
	tags?: string[];
}

// ═══════════════════ 地图地块 ═══════════════════

export interface JsonMapTile {
	name: JsonName;
}

// ═══════════════════ 统一事件（大事年表/时间轴用） ═══════════════════

export interface UnifiedEvent {
	time: JsonTimePoint;
	endTime?: JsonTimePoint;
	endType?: string;
	type?: string;
	describe: string;
	sourceName: string;
	sourceType: 'world' | 'character' | 'state';
	groupId: string;
	sortKey: number;
}
