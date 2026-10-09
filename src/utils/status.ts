/**
 * 问题状态机 —— 全生命周期闭环流转
 *
 * 依据：概要设计 4.2（问题全生命周期流程）+ demo-flow.js STATUS_MAP。
 * 状态：待交办 → 整改中 → 待验收 → 已销号（终态）
 *                ↘ 验收驳回后直接返回整改中
 * 非法流转一律拒绝（如已销号不可再驳回、待交办不可直接销号）。
 */

/** 问题状态 */
export type ProblemStatus = 'pending' | 'inProgress' | 'verify' | 'rejected' | 'closed'

/** 业务操作 */
export type ProblemAction = 'assign' | 'progress' | 'submit' | 'accept' | 'reject' | 'rework'

/** 状态中文标签 */
export const STATUS_LABELS: Record<ProblemStatus, string> = {
  pending: '待交办',
  inProgress: '整改中',
  verify: '待验收',
  rejected: '已驳回',
  closed: '已销号',
}

/** 合法流转表：key = 当前状态，value = 可执行操作及目标状态 */
const TRANSITION_TABLE: Record<ProblemStatus, Partial<Record<ProblemAction, ProblemStatus>>> = {
  pending: { assign: 'inProgress' },
  inProgress: { submit: 'verify' },
  verify: { accept: 'closed', reject: 'inProgress' },
  // 兼容历史“已驳回”数据；新流程不再产生该中间状态。
  rejected: { rework: 'inProgress' },
  closed: {},
}

/**
 * 执行状态流转
 * @param from 当前状态
 * @param action 业务操作
 * @returns 目标状态
 * @throws 非法流转时抛错（由调用方捕获并提示）
 */
export function transition(from: ProblemStatus, action: ProblemAction): ProblemStatus {
  const target = TRANSITION_TABLE[from]?.[action]
  if (!target) {
    throw new Error(`非法状态流转：${STATUS_LABELS[from]} 不允许执行 ${action}`)
  }
  return target
}

/**
 * 判断流转是否合法（不抛错版本，用于按钮禁用等场景）
 */
export function canTransition(from: ProblemStatus, action: ProblemAction): boolean {
  return Boolean(TRANSITION_TABLE[from]?.[action])
}
