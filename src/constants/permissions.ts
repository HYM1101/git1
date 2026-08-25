/**
 * 权限矩阵 —— 与 demo-flow.js ROLES / PAGE_PERMISSIONS / MENU_PERMISSIONS 对齐
 *
 * 三角色系统：
 *  - admin       管理员：系统管理、数据统计
 *  - operator    科室人员：录入问题 + 审核下发 + 验收销号
 *  - responsible 整改责任人：接收任务 + 填报进度 + 上传佐证
 */
import type { Role } from '@/types'

/** 角色常量 */
export const ROLES: Record<'ADMIN' | 'OPERATOR' | 'RESPONSIBLE', Role> = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  RESPONSIBLE: 'responsible',
}

/** 角色中文名（展示用） */
export const ROLE_LABELS: Record<Role, string> = {
  admin: '管理员',
  operator: '科室人员',
  responsible: '整改责任人',
}

/**
 * 操作级权限（hasPermission）
 * - admin：全部操作
 * - operator：查看/录入/编辑/验收/导出（不含 delete/system）
 * - responsible：查看/填报
 */
export const OPERATION_PERMISSIONS: Record<Role, string[]> = {
  admin: ['view', 'add', 'edit', 'delete', 'verify', 'export', 'system'],
  operator: ['view', 'add', 'edit', 'verify', 'export'],
  responsible: ['view', 'edit'],
}

/** 判断某角色是否拥有某操作权限 */
export function hasPermission(role: Role | null | undefined, perm: string): boolean {
  if (!role) return false
  const perms = OPERATION_PERMISSIONS[role]
  return perms ? perms.includes(perm) : false
}

/** 页面访问权限（PC 端路由 name 维度，与 demo-flow.js PAGE_PERMISSIONS 对齐） */
export const PAGE_PERMISSIONS: Record<string, Role[]> = {
  Workbench: ['admin', 'operator', 'responsible'],
  LedgerList: ['admin', 'operator', 'responsible'],
  ProblemDetail: ['admin', 'operator', 'responsible'],
  ProblemInput: ['admin', 'operator'], // 仅管理员 + 科室可录入
  Schedule: ['admin', 'operator', 'responsible'],
  WarningCenter: ['admin', 'operator'], // 预警清单：管理员 + 科室
  GisMap: ['admin', 'operator', 'responsible'],
  AnalysisBoard: ['admin', 'operator'], // 统计分析：管理员 + 科室
  AdminPanel: ['admin'],
}

/** 菜单可见性（与 MENU_PERMISSIONS 对齐） */
export const MENU_PERMISSIONS: Record<string, Role[]> = {
  workbench: ['admin', 'operator', 'responsible'],
  ledger: ['admin', 'operator', 'responsible'],
  input: ['admin', 'operator'],
  files: ['admin', 'operator', 'responsible'],
  schedule: ['admin', 'operator', 'responsible'],
  warning: ['admin', 'operator'],
  gis: ['admin', 'operator', 'responsible'],
  analysis: ['admin', 'operator'],
  admin: ['admin'],
  screen: ['admin', 'operator', 'responsible'],
}

/** 判断角色是否可访问某页面 */
export function canAccessPage(pageName: string, role: Role | null | undefined): boolean {
  if (!role) return false
  const allowed = PAGE_PERMISSIONS[pageName]
  return allowed ? allowed.includes(role) : true
}

/** 判断角色是否可见某菜单 */
export function canAccessMenu(menuKey: string, role: Role | null | undefined): boolean {
  if (!role) return false
  const allowed = MENU_PERMISSIONS[menuKey]
  return allowed ? allowed.includes(role) : true
}
