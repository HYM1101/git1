/**
 * 整改阶段模板 —— 与 demo-flow.js PHASE_TEMPLATES 逐字对齐（只读迁移，不改业务语义）
 *
 * 六类污染类型的标准整改阶段与权重（权重合计 100，三扇区口径 30/30/40 的扩展版）
 * 前端仅展示，业务权威在后端（进度计算以本表为准直至后端就绪）
 */

export interface PhaseDef {
  /** 阶段名称 */
  name: string
  /** 权重（合计 100） */
  weight: number
  /** 是否必做阶段（false = 排查诊断类可选阶段） */
  required: boolean
}

/** 污染类型 → 整改阶段模板 */
export const PHASE_TEMPLATES: Record<string, PhaseDef[]> = {
  大气: [
    { name: '排查诊断', weight: 10, required: false },
    { name: '方案制定与审批', weight: 15, required: true },
    { name: '设施建设/升级改造', weight: 35, required: true },
    { name: '运行调试与监测', weight: 25, required: true },
    { name: '达标验收', weight: 15, required: true },
  ],
  水: [
    { name: '排查诊断', weight: 10, required: false },
    { name: '方案制定与审批', weight: 15, required: true },
    { name: '设施建设/升级改造', weight: 35, required: true },
    { name: '运行调试与监测', weight: 25, required: true },
    { name: '达标验收', weight: 15, required: true },
  ],
  固废: [
    { name: '现场勘查与溯源', weight: 10, required: false },
    { name: '处置方案审批', weight: 15, required: true },
    { name: '清理处置实施', weight: 35, required: true },
    { name: '现场恢复与监测', weight: 25, required: true },
    { name: '验收销号', weight: 15, required: true },
  ],
  土壤: [
    { name: '污染调查', weight: 10, required: false },
    { name: '修复方案审批', weight: 15, required: true },
    { name: '修复工程实施', weight: 40, required: true },
    { name: '效果评估监测', weight: 20, required: true },
    { name: '验收备案', weight: 15, required: true },
  ],
  噪声: [
    { name: '噪声源识别', weight: 10, required: false },
    { name: '降噪方案审批', weight: 20, required: true },
    { name: '降噪设施建设', weight: 35, required: true },
    { name: '效果监测', weight: 20, required: true },
    { name: '验收备案', weight: 15, required: true },
  ],
  生态: [
    { name: '生态损害评估', weight: 10, required: false },
    { name: '修复方案审批', weight: 15, required: true },
    { name: '生态修复实施', weight: 40, required: true },
    { name: '生态监测', weight: 20, required: true },
    { name: '验收备案', weight: 15, required: true },
  ],
}

/** 获取某污染类型的阶段模板（无匹配回退大气模板，与 demo-flow.js 一致） */
export function getPhases(pollutionType: string): PhaseDef[] {
  return PHASE_TEMPLATES[pollutionType] || PHASE_TEMPLATES['大气']
}
