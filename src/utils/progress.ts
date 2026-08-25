/**
 * 整改进度计算 —— 三扇区公式（30/30/40）
 *
 * 依据：docs/architecture.md 2.3（过渡层约束）。
 * 总进度 = min(100, 整改措施(30) + 整改成效(30) + 佐证附件(40))
 * 各扇区：对应内容非空即得满分，否则 0 分。
 */

export interface ProgressInput {
  /** 整改措施文本（非空得 30 分） */
  measures?: string
  /** 整改成效文本（非空得 30 分） */
  effect?: string
  /** 佐证附件（数组非空得 40 分） */
  attachments?: unknown[]
}

export const PROGRESS_WEIGHTS = { measures: 30, effect: 30, attachments: 40 } as const

/** 阶段权重计算（污染类型阶段模板，权重合计 100） */
export function calcPhaseProgress(
  phases: { weight: number }[],
  completedIndexes: number[],
): number {
  let total = 0
  phases.forEach((phase, idx) => {
    if (completedIndexes.includes(idx)) total += phase.weight
  })
  return Math.min(100, total)
}

/**
 * 计算总进度（0-100）
 * @param input 三项输入
 * @returns 0~100 的整数进度
 */
export function calcProgress(input: ProgressInput): number {
  let total = 0
  if (input.measures && String(input.measures).trim().length > 0) total += PROGRESS_WEIGHTS.measures
  if (input.effect && String(input.effect).trim().length > 0) total += PROGRESS_WEIGHTS.effect
  if (Array.isArray(input.attachments) && input.attachments.length > 0)
    total += PROGRESS_WEIGHTS.attachments
  return Math.min(100, total)
}

/**
 * 是否可提交验收：进度必须达到 100%
 * @param input 三项输入
 */
export function canSubmitAcceptance(input: ProgressInput): boolean {
  return calcProgress(input) >= 100
}
