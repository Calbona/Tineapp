export default class EventType {

	#type: string;

	private static readonly RESERVED = new Set(['birth', 'death', 'marriage']);

	static #pool = new Map<string, EventType>();

	private constructor(type: string) { this.#type = type; }

	get type(): string { return this.#type; }

	/**
	 * 从享元池获取或创建 EventType 实例
	 */
	static get(type: string): EventType {
		if (!EventType.#pool.has(type)) EventType.#pool.set(type, new EventType(type));
		return EventType.#pool.get(type)!;
	}

	/**
	 * 清空享元池
	 */
	static clearPool(): void { EventType.#pool.clear(); }

}
