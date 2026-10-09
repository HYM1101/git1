/** 全局类型定义 —— 与后端字段命名对齐（重要等级/预警等级/状态均为枚举字符串） */

import type { ImportantLevel } from '@/utils/level'
import type { WarningLevel } from '@/utils/warning'
import type { ProblemStatus } from '@/utils/status'

/** 用户角色（三角色权限模型） */
export type Role = 'admin' | 'operator' | 'responsible'

/** 当前登录用户 */
export interface UserInfo {
  id: number
  username: string
  realName: string
  role: Role
  /** 所属区域编码（responsible 必填，用于数据隔离） */
  regionCode?: string
  /** 所属区域名称 */
  regionName?: string
  /** 单位 */
  dept?: string
}

/** 登录响应 */
export interface LoginResult {
  token: string
  refreshToken?: string
  user: UserInfo
}

/** 问题生命周期时间线条目 */
export interface TimelineItem {
  time: string
  action: string
  desc?: string
  user?: string
}

/** 问题台账实体（核心字段，对接后端 /api/problems） */
export interface Problem {
  id: string
  problemNo: string
  title: string
  /** 问题详细内容（录入页“问题内容”） */
  content?: string
  discoveredDate?: string
  source: string
  regionCode: string
  regionName: string
  pollutionType: string
  /** 问题类别（对应 8 类判定对象：涉重企业/尾矿库/矿山/水源保护区/供水厂/垃圾填埋场/散乱污等，用于风险等级推断） */
  category?: string
  /** 行业类别（原型已有，后端未返回时允许为空） */
  industry?: string
  entityName?: string
  requirements?: string
  address?: string
  responsibleUnit?: string
  responsiblePerson?: string
  deadline: string
  /** 重要等级（静态三色，矩阵判定） */
  importantLevel: ImportantLevel
  sourceGrade?: '低' | '中' | '高'
  riskGrade?: '低' | '中' | '高'
  /** 预警等级（动态四色） */
  warningLevel: WarningLevel
  overdueDays: number
  status: ProblemStatus
  progress: number
  /** 最近一次进度填报内容 */
  measures?: string
  effect?: string
  progressAttachments?: { name: string; size: number }[]
  riskTags: string[]
  lng?: number
  lat?: number
  createdAt: string
  /** 生命周期时间线（创建/下发/进度/验收等留痕） */
  timeline?: TimelineItem[]
  /** 已完成整改阶段下标（对应 constants/phases 阶段模板） */
  completedPhases?: number[]
}

/** 分页请求参数 */
export interface PageQuery {
  page: number
  pageSize: number
}

/** 分页响应 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 统一响应体（与后端契约一致：code/message/data） */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
