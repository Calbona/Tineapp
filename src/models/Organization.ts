/**
 * 组织 — 含标签（通过标签系统映射到成员）。
 */
import TimeSpan from './TimeSpan.ts';
import Tag from './Tag.ts';
import type { JsonOrgData, JsonName } from '../services/data-manager.ts';

export default class Organization {

	readonly worldId: number;
	readonly id: string;
	readonly name: JsonName;
	readonly span: TimeSpan;
	readonly tags: string[];

	constructor(
		worldId: number, id: string, name: JsonName,
		span: TimeSpan, tags: string[] = [],
	) {
		this.worldId = worldId;
		this.id = id;
		this.name = name;
		this.span = span;
		this.tags = tags;
	}

	getName(lang: string = 'zh_CN'): string {
		return this.name[lang] ?? Object.values(this.name).find(v => v.length > 0) ?? this.id;
	}

	/** 通过标签系统解析成员角色 ID */
	getMemberIds(allTags: Tag[]): number[] {
		const ids = new Set<number>();
		for (const tagName of this.tags) {
			const tag = allTags.find(t => t.world === this.worldId && t.name === tagName);
			if (tag) {
				for (const id of tag.resolveCharacterIds(allTags)) ids.add(id);
			}
		}
		return [...ids];
	}

	static fromJSON(json: JsonOrgData, worldId: number): Organization {
		return new Organization(
			worldId, json.id, json.name,
			TimeSpan.fromJSON(json.time, json.endTime),
			json.tags ?? [],
		);
	}

	toJSON(): JsonOrgData {
		return {
			id: this.id,
			name: this.name,
			...this.span.toJSON(),
			tags: this.tags,
		};
	}
}
