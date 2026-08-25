/**
 * 预警等级计算 —— 动态四级（红/橙/黄/绿），随整改超期自动升级
 *
 * 依据：概要设计 4.3（整改超期分级预警）+ 实施方案。
 * 规则：
 *  - 超期 <30 天（含未超期）→ 绿色
 *  - 超期 ≥30 天且 <90 天 → 黄色一级预警
 *  - 超期 ≥90 天且 <180 天 → 橙色二级预警
 *  - 超期 ≥180 天 → 红色三级预警（最高）
 *  - 已销号问题固定为绿色，不参与预警
 */

/** 预警等级（动态四色） */
export type WarningLevel = 'red' | 'orange' | 'yellow' | 'green'

/** 预警阈值（天），后台可配置（预留配置化） */
export const WARNING_THRESHOLDS = {
  yellow: 30,
  orange: 90,
  red: 180,
} as const

/** 问题状态枚举（与状态机 status.ts 保持一致） */
export type ProblemStatus = 'pending' | 'inProgress' | 'verify' | 'rejected' | 'closed'

/** 是否参与预警：待交办/整改中/待验收/已驳回 参与；已销号不参与 */
const NON_WARNING_STATUS: ProblemStatus[] = ['closed']

/**
 * 计算超期天数（负数表示剩余天数，0 表示当天到期）
 * @param deadline 整改截止日期（YYYY-MM-DD）
 * @param today 参考日期（默认今天，测试可注入）
 * @returns 超期天数
 */
export function calcOverdueDays(deadline: string, today: string = toDateStr(new Date())): number {
  if (!deadline) return 0
  const deadlineMs = new Date(deadline).getTime()
  const todayMs = new Date(today).getTime()
  if (Number.isNaN(deadlineMs) || Number.isNaN(todayMs)) return 0
  return Math.floor((todayMs - deadlineMs) / 86400000)
}

/**
 * 根据超期天数计算预警等级（分级判定）
 * @param overdueDays 超期天数（负数=未超期）
 * @param status 问题状态（已销号固定绿色）
 */
export function calcWarningLevel(overdueDays: number, status: ProblemStatus): WarningLevel {
  if (NON_WARNING_STATUS.includes(status)) return 'green'
  if (overdueDays >= WARNING_THRESHOLDS.red) return 'red'
  if (overdueDays >= WARNING_THRESHOLDS.orange) return 'orange'
  if (overdueDays >= WARNING_THRESHOLDS.yellow) return 'yellow'
  return 'green'
}

/**
 * 便捷入口：由截止日期 + 状态直接计算预警等级
 * @param deadline 整改截止日期
 * @param status 问题状态
 * @param today 参考日期（测试可注入）
 */
export function calcWarningByDeadline(
  deadline: string,
  status: ProblemStatus,
  today?: string,
): { level: WarningLevel; overdueDays: number } {
  const overdueDays = calcOverdueDays(deadline, today)
  return { level: calcWarningLevel(overdueDays, status), overdueDays }
}

/** 内部工具：Date → YYYY-MM-DD */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
