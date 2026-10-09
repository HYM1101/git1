/**
 * 全局常量表 —— 双标签颜色/文案映射（与后端枚举对齐）
 *
 * 跨端一致性要求（概要设计 6.4）：
 *  - importantLevel: red/orange/green（重要等级三色）
 *  - warningLevel:   red/orange/yellow/green（预警等级四色）
 * 此表为唯一展示层映射源，PC 端与大屏端共用同一套值。
 */

import type { ImportantLevel } from '@/utils/level'
import type { WarningLevel } from '@/utils/warning'
import type { ProblemStatus } from '@/utils/status'

/** 重要等级 → 展示颜色（静态标签，左上角） */
export const IMPORTANT_LEVEL_COLORS: Record<ImportantLevel, string> = {
  red: '#E53935',
  orange: '#FB8C00',
  green: '#43A047',
}

/** 重要等级 → 中文短标签 */
export const IMPORTANT_LEVEL_LABELS: Record<ImportantLevel, string> = {
  red: '红色重大',
  orange: '橙色较大',
  green: '绿色常规',
}

/** 重要等级 → 完整标签（"高 · 红色重大问题"，与 demo-flow.js LEVEL_LABELS 对齐） */
export const IMPORTANT_LEVEL_FULL_LABELS: Record<ImportantLevel, string> = {
  red: '高 · 红色重大问题',
  orange: '中 · 橙色较大问题',
  green: '低 · 绿色常规问题',
}

/** 预警等级 → 底色（动态行背景色） */
export const WARNING_LEVEL_COLORS: Record<WarningLevel, string> = {
  red: '#FDECEA',
  orange: '#FDF1E7',
  yellow: '#FEF7E0',
  green: '#EAF4EE',
}

/** 预警等级 → 中文标签 */
export const WARNING_LEVEL_LABELS: Record<WarningLevel, string> = {
  red: '红色三级预警',
  orange: '橙色二级预警',
  yellow: '黄色一级预警',
  green: '正常',
}

/** 问题状态 → 颜色 */
export const STATUS_COLORS: Record<ProblemStatus, string> = {
  pending: '#FB8C00',
  inProgress: '#00897B',
  verify: '#7B1FA2',
  rejected: '#E53935',
  closed: '#43A047',
}

/** 污染类型枚举（用于筛选/统计，与后端 dictionary 对齐） */
export const POLLUTION_TYPES = ['大气', '水', '土壤', '固废', '噪声', '生态'] as const

/** 问题来源枚举 */
export const PROBLEM_SOURCES = [
  '中央环保督察',
  '省级专项检查',
  '日常巡查',
  '群众信访',
  '遥感发现',
  '企业自查',
] as const

/**
 * 百色市 12 区县（与百色市.json 区划、大屏 cityData 口径对齐，概要设计 6.4 跨端一致性）
 * code 为行政区划编码，name 为展示名
 */
export const REGIONS: ReadonlyArray<{ code: string; name: string }> = [
  { code: '451002', name: '右江区' },
  { code: '451003', name: '田阳区' },
  { code: '451022', name: '田东县' },
  { code: '451024', name: '德保县' },
  { code: '451026', name: '那坡县' },
  { code: '451027', name: '凌云县' },
  { code: '451028', name: '乐业县' },
  { code: '451029', name: '田林县' },
  { code: '451030', name: '西林县' },
  { code: '451031', name: '隆林县' },
  { code: '451081', name: '靖西市' },
  { code: '451082', name: '平果市' },
]

/** 百色市 12 县（市、区）地图展示中心，用于 mock 点位和 GIS 下钻。 */
export const REGION_CENTERS: Readonly<Record<string, { lng: number; lat: number }>> = {
  右江区: { lng: 106.618, lat: 23.905 },
  田阳区: { lng: 106.915, lat: 23.755 },
  田东县: { lng: 107.126, lat: 23.597 },
  德保县: { lng: 106.618, lat: 23.323 },
  靖西市: { lng: 106.418, lat: 23.134 },
  那坡县: { lng: 105.833, lat: 23.408 },
  凌云县: { lng: 106.561, lat: 24.345 },
  乐业县: { lng: 106.557, lat: 24.782 },
  田林县: { lng: 106.228, lat: 24.292 },
  西林县: { lng: 105.095, lat: 24.497 },
  隆林县: { lng: 105.344, lat: 24.771 },
  平果市: { lng: 107.59, lat: 23.323 },
}
