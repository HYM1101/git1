/** 问题台账域 API */
import request from './request'
import type { PageQuery, PageResult, Problem } from '@/types'

export interface ProblemQuery extends PageQuery {
  regionCode?: string
  pollutionType?: string
  importantLevel?: string
  warningLevel?: string
  status?: string
  keyword?: string
}

export const problemApi = {
  /** 问题列表（分页 + 筛选 + 排序） */
  getList: (params: ProblemQuery) =>
    request.get<unknown, PageResult<Problem>>('/problems', { params }),

  /** 问题详情 */
  getDetail: (id: string) => request.get<unknown, Problem>(`/problems/${id}`),

  /** 新增问题（自动定级） */
  create: (data: Partial<Problem>) => request.post<unknown, Problem>('/problems', data),

  /** 问题状态流转 */
  transition: (id: string, action: string) =>
    request.post<unknown, Problem>(`/problems/${id}/${action}`),

  /** 提交进度（三扇区 + 可选阶段勾选） */
  submitProgress: (
    id: string,
    data: {
      measures?: string
      effect?: string
      attachments?: unknown[]
      completedPhases?: number[]
    },
  ) => request.post<unknown, Problem>(`/problems/${id}/progress`, data),
}
