/**
 * 类型注册表 — 集中管理事件类型和关系类型。
 * 每种类型分为保留键（不可删除）和自定义键（可增删）。
 * 数据持久化到 localStorage "tineapp-types"。
 */

export interface TypeSet {
	reserved: string[];
	custom: string[];
}

const STORAGE_KEY = 'tineapp-types';

const DEFAULTS: Record<string, TypeSet> = {
	charEvent: { reserved: ['birth', 'death', 'marriage'], custom: [] },
	worldEvent: { reserved: [], custom: [] },
	relationship: { reserved: ['parent', 'child', 'couple'], custom: [] },
};

export default class TypeRegistry {

	static #instance: TypeRegistry | null = null;

	#types: Record<string, TypeSet>;

	private constructor() {
		const raw = localStorage.getItem(STORAGE_KEY);
		this.#types = raw ? JSON.parse(raw) as Record<string, TypeSet> : { ...DEFAULTS };
		// 确保默认键存在
		for (const [k, v] of Object.entries(DEFAULTS)) {
			if (!this.#types[k]) this.#types[k] = { ...v };
		}
	}

	static get instance(): TypeRegistry {
		if (!TypeRegistry.#instance) TypeRegistry.#instance = new TypeRegistry();
		return TypeRegistry.#instance;
	}

	#save(): void {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#types));
	}

	// ── 读取 ──

	/** 获取指定类型集 */
	get(key: string): TypeSet {
		return this.#types[key] ?? { reserved: [], custom: [] };
	}

	/** 获取所有可用类型（保留 + 自定义） */
	list(key: string): string[] {
		const ts = this.get(key);
		return [...ts.reserved, ...ts.custom];
	}

	/** 角色事件类型 */
	get charEventTypes(): string[] { return this.list('charEvent'); }

	/** 世界事件类型 */
	get worldEventTypes(): string[] { return this.list('worldEvent'); }

	/** 关系类型 */
	get relationshipTypes(): string[] { return this.list('relationship'); }

	/** 判断是否为保留类型 */
	isReserved(key: string, name: string): boolean {
		return this.get(key).reserved.includes(name);
	}

	/** 列出所有类型集键 */
	get keys(): string[] { return Object.keys(this.#types); }

	// ── 修改 ──

	/** 添加自定义类型 */
	add(key: string, name: string): boolean {
		const ts = this.get(key);
		const all = [...ts.reserved, ...ts.custom];
		if (all.includes(name)) return false;
		if (!this.#types[key]) this.#types[key] = { reserved: [], custom: [] };
		this.#types[key].custom.push(name);
		this.#save();
		return true;
	}

	/** 删除自定义类型（保留类型不可删除） */
	remove(key: string, name: string): boolean {
		if (this.isReserved(key, name)) return false;
		const ts = this.#types[key];
		if (!ts) return false;
		const idx = ts.custom.indexOf(name);
		if (idx < 0) return false;
		ts.custom.splice(idx, 1);
		this.#save();
		return true;
	}

	/** 重置为默认值 */
	reset(): void {
		this.#types = JSON.parse(JSON.stringify(DEFAULTS));
		this.#save();
	}
}
