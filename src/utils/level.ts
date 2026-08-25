/**
 * 重要等级计算 —— 双维度矩阵判定（红/橙/绿三色，无分数无权重）
 *
 * 依据：概要设计 4.4.1；实现对齐 demo-flow.js 的 LEVEL_MATRIX。
 * 维度1：来源等级（低/中/高），按来源层级映射
 * 维度2：风险等级（低/中/高），按问题类别/污染类型/风险标签推断
 * 规则：来源 × 风险 3×3 矩阵联动定级，人工可修正（仅上调，留痕）
 */

/** 双维度取值（低/中/高） */
export type Grade = '低' | '中' | '高'

/** 重要等级（静态三色） */
export type ImportantLevel = 'red' | 'orange' | 'green'

/** 等级计算入参（支持只传一个维度，另一维度自动推断） */
export interface LevelForm {
  /** 来源等级（缺省时按 sourceLevel 推断） */
  sourceGrade?: Grade
  /** 风险等级（缺省时按 category/pollutionType/riskTags 推断） */
  riskGrade?: Grade
  /** 来源层级（旧数据兼容：中央/省级→高，市级→中，其他→低） */
  sourceLevel?: string
  /** 问题类别（对应 8 类判定对象：涉重企业/尾矿库/矿山/水源保护区/供水厂/垃圾填埋场/散乱污等） */
  category?: string
  /** 污染类型（大气/水/土壤/固废/噪声/生态） */
  pollutionType?: string
  /** 附加风险标签（监测超标/重复信访/重金属污染等） */
  riskTags?: string[]
}

/** 等级计算结果 */
export interface LevelResult {
  level: ImportantLevel
  /** 中文标签，如"高 · 红色重大问题" */
  label: string
  sourceGrade: Grade
  riskGrade: Grade
}

/** 3×3 判定矩阵：行=来源等级，列=风险等级 */
export const LEVEL_MATRIX: Record<Grade, Record<Grade, ImportantLevel>> = {
  高: { 高: 'red', 中: 'red', 低: 'orange' },
  中: { 高: 'red', 中: 'orange', 低: 'green' },
  低: { 高: 'orange', 中: 'green', 低: 'green' },
}

/** 等级中文标签 */
export const LEVEL_LABELS: Record<ImportantLevel, string> = {
  red: '高 · 红色重大问题',
  orange: '中 · 橙色较大问题',
  green: '低 · 绿色常规问题',
}

/** 8 类高风险判定对象关键词（命中任一视为高风险类别） */
const HIGH_RISK_CATEGORY_KEYWORDS = ['水源地', '供水厂', '垃圾填埋场', '涉重企业', '尾矿库', '矿山']

/** 高风险风险标签关键词 */
const HIGH_RISK_TAG_KEYWORDS = ['重金属', '危险废物', '危废', '暗管', '直排', '监测超标']

/**
 * 由来源层级推断来源等级（兼容旧数据 sourceLevel 字段）
 * @param sourceLevel 来源层级描述
 * @returns 低/中/高
 */
export function inferSourceGrade(sourceLevel?: string): Grade {
  if (!sourceLevel) return '低'
  if (
    sourceLevel.includes('中央') ||
    sourceLevel.includes('省级') ||
    sourceLevel.includes('国家')
  ) {
    return '高'
  }
  if (sourceLevel.includes('市级') || sourceLevel === 'special') {
    return '中'
  }
  return '低'
}

/**
 * 由问题类别/污染类型/风险标签推断风险等级
 * 规则对齐 demo-flow.js calcImportantLevel 的旧推断逻辑：
 *  - 命中 8 类高风险对象或重金属/危废/暗管/直排等 → 高
 *  - 散乱污/重复信访 → 中
 *  - 常规污染类型（大气/水/固废/土壤） → 中
 *  - 其余 → 低
 */
export function inferRiskGrade(
  form: Pick<LevelForm, 'category' | 'pollutionType' | 'riskTags'>,
): Grade {
  const category = form.category || ''
  const pollutionType = form.pollutionType || ''
  const riskTags = form.riskTags || []

  const hitHighCategory = HIGH_RISK_CATEGORY_KEYWORDS.some((kw) => category.includes(kw))
  const hitHighTag = riskTags.some((tag) => HIGH_RISK_TAG_KEYWORDS.some((kw) => tag.includes(kw)))
  if (hitHighCategory || hitHighTag) return '高'

  if (
    category.includes('散乱污') ||
    riskTags.some((t) => t.includes('信访') || t.includes('散乱污'))
  ) {
    return '中'
  }
  if (['大气', '水', '固废', '土壤'].includes(pollutionType)) return '中'

  return '低'
}

/**
 * 计算重要等级（双维度矩阵判定）
 * @param form 录入表单（含来源/风险两维度或其推断依据）
 * @returns 等级 + 标签 + 双维度取值（前端展示定级依据）
 */
export function calcImportantLevel(form: LevelForm): LevelResult {
  const sourceGrade = form.sourceGrade || inferSourceGrade(form.sourceLevel)
  const riskGrade = form.riskGrade || inferRiskGrade(form)

  const level = LEVEL_MATRIX[sourceGrade]?.[riskGrade] ?? 'green'
  return { level, label: LEVEL_LABELS[level], sourceGrade, riskGrade }
}

/**
 * 由问题标题推断问题类别（8 类判定对象）
 * 对齐 demo-flow.js inferCategory：垃圾填埋场/尾矿库/矿山/涉重企业/散乱污/供水厂/水源地
 * @param title 问题标题
 * @returns 类别字符串（未命中返回空串）
 */
export function inferCategory(title?: string): string {
  const t = (title || '').toLowerCase()
  if (t.includes('垃圾填埋场')) return '垃圾填埋场'
  if (t.includes('尾矿库')) return '尾矿库'
  if (t.includes('矿山') || t.includes('采石场') || t.includes('洗砂场')) return '矿山'
  if (t.includes('重金属') || t.includes('电镀')) return '涉重企业'
  if (t.includes('散乱污')) return '散乱污'
  if (t.includes('供水厂')) return '供水厂'
  if (t.includes('水源地')) return '水源地'
  return ''
}

/**
 * 自动推断风险标签（录入时智能打标，可人工增删）
 * 对齐 demo-flow.js inferRiskTags：分类标签 + 污染类型标签 + 标题关键词标签 + 预警/超期标签
 */
export function inferRiskTags(problem: {
  title?: string
  category?: string
  pollutionType?: string
  warningLevel?: string
  overdueDays?: number
}): string[] {
  const tags: string[] = []
  const title = problem.title || ''
  const category = problem.category || ''
  const pollutionType = problem.pollutionType || ''

  // 基于问题分类
  if (category === '水源地' || category === '供水厂') tags.push('水源地风险')
  if (category === '垃圾填埋场') tags.push('固废污染')
  if (category === '尾矿库' || category === '矿山' || category === '涉重企业')
    tags.push('重金属污染')
  if (category === '散乱污') tags.push('散乱污聚集')

  // 基于污染类型
  if (pollutionType === '水' || pollutionType === '水污染') tags.push('水污染')
  if (pollutionType === '大气') tags.push('大气污染')
  if (pollutionType === '土壤') tags.push('土壤污染')
  if (pollutionType === '固废') tags.push('固废污染')
  if (pollutionType === '噪声') tags.push('噪声扰民')
  if (pollutionType === '生态') tags.push('生态破坏')

  // 基于标题关键词
  if (title.includes('超标') || title.includes('监测')) tags.push('监测超标')
  if (title.includes('信访') || title.includes('举报') || title.includes('投诉'))
    tags.push('信访风险')
  if (title.includes('暗管') || title.includes('偷排')) tags.push('违法排污')
  if (title.includes('危废') || title.includes('危险废物')) tags.push('危废管控')
  if (title.includes('渗滤液') || title.includes('渗漏')) tags.push('渗滤液泄漏')
  if (title.includes('粉尘') || title.includes('扬尘')) tags.push('扬尘污染')
  if (title.includes('VOC') || title.includes('挥发性')) tags.push('VOCs污染')

  // 基于预警等级 / 超期
  if (problem.warningLevel === 'red') tags.push('红色预警')
  else if (problem.warningLevel === 'orange') tags.push('橙色预警')
  if ((problem.overdueDays || 0) > 0) tags.push(`超期${problem.overdueDays}天`)

  return tags
}
