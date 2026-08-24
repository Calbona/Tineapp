export default class RelationshipType {

	#type: string;

	private static readonly RESERVED = new Set(['parent', 'child', 'couple']);

	static #pool = new Map<string, RelationshipType>();

	private constructor(type: string) { this.#type = type; }

	get type(): string { return this.#type; }

	/**
	 * 从享元池获取 RelationshipType 实例
	 * @param type 用户输入的字符串
	 */
	static get(type: string): RelationshipType {
		if (!RelationshipType.#pool.has(type)) RelationshipType.#pool.set(type, new RelationshipType(type));
		return RelationshipType.#pool.get(type)!;
	}

	/**
	 * 清空享元池
	 */
	static clearPool(): void { RelationshipType.#pool.clear(); }

}
