/**
 * 地图地块 — 可命名的地图坐标单元。
 * 文件按坐标命名：{xxx}-{yyy}.json，存储于 public/data/regions/。
 */
import type { JsonMapTile, JsonName } from '../services/data-manager.ts';

export default class MapTile {

	readonly worldId: number;
	readonly x: number;
	readonly y: number;
	readonly name: JsonName;

	constructor(worldId: number, x: number, y: number, name: JsonName = {}) {
		this.worldId = worldId;
		this.x = x;
		this.y = y;
		this.name = name;
	}

	/** 文件名（不含扩展名），如 "000-000" */
	get filename(): string {
		return `${String(this.x).padStart(3, '0')}-${String(this.y).padStart(3, '0')}`;
	}

	/** 坐标显示字符串，如 "0, 0" */
	get coord(): string {
		return `${this.x}, ${this.y}`;
	}

	getName(lang: string = 'zh_CN'): string {
		return this.name[lang]
			?? Object.values(this.name).find(v => v.length > 0)
			?? `(${this.coord})`;
	}

	/** 设置某语言名称，返回新实例（不可变风格） */
	withName(lang: string, value: string): MapTile {
		const newName = { ...this.name, [lang]: value };
		if (!value) delete newName[lang];
		return new MapTile(this.worldId, this.x, this.y, newName);
	}

	rename(lang: string, value: string): void {
		if (value) this.name[lang] = value;
		else delete this.name[lang];
	}

	static fromJSON(json: JsonMapTile, worldId: number, x: number, y: number): MapTile {
		return new MapTile(worldId, x, y, json.name ?? {});
	}

	toJSON(): JsonMapTile {
		return { name: this.name };
	}
}
