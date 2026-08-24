/**
 * 标签 — 按世界分类角色，支持嵌套引用。
 * 无 characters 且 name === 'ALL' 时自动包含全角色。
 */
import type { JsonTagData } from '../services/data-manager.ts';

export default class Tag {

	readonly world: number;
	readonly name: string;
	readonly characterIds: number[];
	readonly tagNames: string[];

	static readonly RESERVED = new Set(['ALL']);

	constructor(world: number, name: string, characterIds: number[] = [], tagNames: string[] = []) {
		this.world = world;
		this.name = name;
		this.characterIds = Tag.RESERVED.has(name) ? [] : characterIds;
		this.tagNames = tagNames;
	}

	get isReserved(): boolean { return Tag.RESERVED.has(this.name); }

	/** 递归解析此标签包含的所有角色 ID（需传入全部标签列表） */
	resolveCharacterIds(allTags: Tag[]): number[] {
		const ids = new Set<number>();
		if (this.name === 'ALL' && this.characterIds.length === 0) return [];
		for (const id of this.characterIds) ids.add(id);
		for (const refName of this.tagNames) {
			const ref = allTags.find(t => t.world === this.world && t.name === refName);
			if (ref) for (const id of ref.resolveCharacterIds(allTags)) ids.add(id);
		}
		return [...ids];
	}

	static fromJSON(json: JsonTagData): Tag {
		return new Tag(json.world, json.name, json.characters ?? [], json.tags ?? []);
	}

	toJSON(): JsonTagData {
		const j: JsonTagData = { world: this.world, name: this.name };
		if (this.characterIds.length > 0) j.characters = this.characterIds;
		if (this.tagNames.length > 0) j.tags = this.tagNames;
		return j;
	}
}
