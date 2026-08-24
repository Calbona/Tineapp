/**
 * 事件收集和过滤工具 — 大事年表和时间轴共用。
 * 数据驱动：通过 WorldConfig 黑白名单筛选角色。
 */
import { listCharacters, listWorldEvents, listTags } from './repository.ts';
import World from '../models/World.ts';
import Character from '../models/Character.ts';
import Tag from '../models/Tag.ts';
import TimePoint from '../models/TimePoint.ts';
import type { UnifiedEvent } from './data-manager.ts';

/** 收集事件：世界事件 + 筛选后的角色事件 */
export async function collectAllEvents(world: World): Promise<UnifiedEvent[]> {
	const allChars = await listCharacters(world.id);
	const allTags = await listTags();
	const chars = filterCharacters(world, allChars, allTags);
	const worldEvents = await listWorldEvents(world.id);
	const events: UnifiedEvent[] = [];
	const wName = world.getName('zh_CN');

	for (const evt of worldEvents) {
		events.push({
			time: evt.span.start.toJSON(),
			endTime: evt.span.end?.toJSON(),
			endType: evt.span.endType || undefined,
			type: evt.type || undefined,
			describe: evt.describe,
			sourceName: wName,
			sourceType: 'world',
			groupId: wName,
			sortKey: evt.span.start.sortKey,
		});
	}
	for (const ch of chars) {
		const chName = ch.getName('zh_CN');
		for (const evt of ch.events) {
			events.push({
				time: evt.time.toJSON(),
				endTime: evt.endTime?.toJSON(),
				endType: evt.endType || undefined,
				type: evt.type || undefined,
				describe: evt.describe,
				sourceName: chName,
				sourceType: 'character',
				groupId: chName,
				sortKey: evt.time.sortKey,
			});
		}
	}
	events.sort((a, b) => a.sortKey - b.sortKey);
	return events;
}

/** 根据世界配置的黑白名单筛选角色 */
export function filterCharacters(world: World, chars: Character[], allTags: Tag[]): Character[] {
	const cfg = world.config;
	const wl = new Set<number>();
	const bl = new Set<number>();

	for (const tag of allTags) {
		if (cfg.tagWhitelist.includes(tag.name)) {
			for (const id of tag.resolveCharacterIds(allTags)) wl.add(id);
		}
		if (cfg.tagBlacklist.includes(tag.name)) {
			for (const id of tag.resolveCharacterIds(allTags)) bl.add(id);
		}
	}
	for (const idStr of cfg.charWhitelist) { const id = Number(idStr); if (!isNaN(id)) wl.add(id); }
	for (const idStr of cfg.charBlacklist) { const id = Number(idStr); if (!isNaN(id)) bl.add(id); }

	if (wl.size > 0) return chars.filter(c => wl.has(c.id) && !bl.has(c.id));
	if (bl.size > 0) return chars.filter(c => !bl.has(c.id));
	return chars;
}

/** 格式化时间点（使用 TimePoint.format 逻辑） */
export function fmtTime(tp: { year: number; month?: number; day?: number; hour?: number }): string {
	return TimePoint.fromJSON(tp).format();
}

/** 格式化时间段（使用 TimeSpan 逻辑） */
export function fmtSpan(evt: UnifiedEvent): string {
	const start = TimePoint.fromJSON(evt.time);
	if (!evt.endTime || evt.endType === 'instant') return start.format();
	const end = TimePoint.fromJSON(evt.endTime);
	if (evt.endType === 'lifelong') return `${start.format()} — 终身`;
	if (evt.endType === 'eternal') return `${start.format()} — 永恒`;
	return `${start.format()} — ${end.format()}`;
}
