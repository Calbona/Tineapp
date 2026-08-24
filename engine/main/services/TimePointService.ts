// engine\main\services\TimePointService.ts
//
// TimePoint（稀疏时间点）与 ChronologyJS 的 number[] 之间的胶水。
//
// 核心约束 —— 两条绝不混用：
//   1. 显示 = 稀疏：只显示用户显式创建的层级，绝不补齐。
//      用户输入「5 月」就显示「5 月」，绝不能显示成「5 月 1 日」。
//   2. 排序/换算 = 稠密：缺失的尾部层级按历法的 initial 补齐后交给 ChronologyJS，
//      此时「5 月」等价于「5 月 1 日」（该月起点），事件排序落在月初。
//
// 因此本服务只做「稀疏对象 → 短数组」这一层；补尾（补 initial）由 ChronologyJS 的
// time() 完成，所有时间运算（isLegal / toAbsolute / add / since / 比较）一律委托
// ChronologyJS，本服务不实现任何历法运算（不重造轮子）。

import type { TimePoint } from '../../types'

export class TimePointService {
  /**
   * 稀疏 → 短数组（仅供计算/排序）。
   * 只取出从 unit0 起连续创建的层级，产出短数组；尾部缺失层级由 ChronologyJS 的
   * time() 按 initial 补齐 —— 这正是「5 月按排序等价于 5 月 1 日」的来源。
   *
   * 注意：本方法仅用于计算/排序；显示不得使用本方法（见文件头约束）。
   */
  toValues(timePoint: TimePoint): number[] {
    const values: number[] = []
    for (let i = 0; ; i++) {
      const key = `unit${i}` as `unit${number}`
      if (!(key in timePoint)) break
      values.push(timePoint[key])
    }
    return values
  }

  // TODO：稠密 → 稀疏（ChronologyJS 计算结果的显示）需按历法 initial 丢弃尾部等于
  // initial 的层级；但「用户显式创建了哪几层」只存在于原始稀疏对象里，dense 数组无法
  // 无损还原，故显示时应尽量保留原始 TimePoint，而不是从计算结果反推。
}
