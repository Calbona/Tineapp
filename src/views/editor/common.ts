/**
 * 编辑器共享工具 — 数据驱动的输入组件和上下文管理。
 */
import { getWorld, listCharacters } from '../../services/repository.ts';
import CalendarRegistry, { type CalendarUnit } from '../../models/CalendarRegistry.ts';

// ═══════════════════ Session Key 常量 ═══════════════════

export const KEYS = {
	DRAFT: 'tineapp-draft-world',
	WORLD_ID: 'tineapp-editor-worldId',
	EVENT_IDX: 'tineapp-editor-eventIdx',
	CHAR_ID: 'tineapp-editor-charId',
	STATE_ID: 'tineapp-editor-stateId',
	ORG_ID: 'tineapp-editor-orgId',
} as const;

export type { CalendarUnit };

// ═══════════════════ 历法 ═══════════════════

/** 加载指定世界的历法单位定义（数据驱动，不从世界 JSON 内嵌读取） */
export async function loadCalendarUnits(worldId: number): Promise<CalendarUnit[]> {
	const world = await getWorld(worldId);
	const calName = world?.chronology ?? 'ExampleWorldChronology';
	return CalendarRegistry.instance.getUnits(calName);
}

// ═══════════════════ DOM 输入 ═══════════════════

/** 创建一个文本输入框 */
export function textInput(
	value: string, placeholder: string,
	onChange: (v: string) => void,
	opts?: { flex?: boolean; width?: number },
): HTMLInputElement {
	const i = document.createElement('input');
	i.type = 'text'; i.className = 'text-input';
	i.placeholder = placeholder; i.value = value;
	if (opts?.flex) i.style.flex = '1';
	if (opts?.width) i.style.width = `${opts.width}px`;
	i.addEventListener('input', () => onChange(i.value));
	return i;
}

/** 为时间点生成一组数字输入框（按历法单位动态生成） */
export function timeInputs(
	tp: Record<string, number | undefined>,
	units: CalendarUnit[],
	opts?: { width?: number },
): HTMLInputElement[] {
	return units.map(u => {
		const i = document.createElement('input');
		i.type = 'number'; i.className = 'text-input';
		i.style.width = `${opts?.width ?? 50}px`;
		i.placeholder = u.name;
		const val = tp[u.name];
		if (val !== undefined) i.value = String(val);
		i.addEventListener('input', () => {
			tp[u.name] = i.value ? Number(i.value) : undefined;
		});
		return i;
	});
}
