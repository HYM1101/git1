/** 文件与附件域 API */
import request from './request'

export const fileApi = {
  /** 上传附件（佐证/调度资料） */
  upload: (formData: FormData) =>
    request.post<unknown, { id: string; url: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** 下载附件（blob） */
  download: (id: string) =>
    request.get<unknown, Blob>(`/files/${id}/download`, { responseType: 'blob' }),

  /** 问题附件列表 */
  listByProblem: (problemId: string) =>
    request.get<unknown, unknown[]>(`/files/list`, { params: { problemId } }),
}

/** 预警域 API */
export const warningApi = {
  /** 预警清单 */
  getList: (params: Record<string, unknown>) =>
    request.get<unknown, unknown[]>('/warnings', { params }),

  /** 预警统计（四级数量） */
  getStats: () => request.get<unknown, Record<string, number>>('/warnings/stats'),

  /** 催办 */
  urge: (id: string) => request.post<unknown, void>(`/warnings/${id}/urge`),

  /** 督办（下发督办单） */
  supervise: (id: string) => request.post<unknown, void>(`/warnings/${id}/supervise`),
}

/** GIS 空间服务 API */
export const gisApi = {
  /** 问题点位 */
  getPoints: (params: Record<string, unknown>) =>
    request.get<unknown, unknown[]>('/gis/points', { params }),

  /** 热力图数据 */
  getHeatmap: () => request.get<unknown, unknown[]>('/gis/heatmap'),

  /** 空间统计（区域聚合） */
  getStatistics: () => request.get<unknown, unknown[]>('/gis/statistics'),
}

/** 统计分析 API */
export const analysisApi = {
  /** 综合态势指标 */
  getOverview: (params: Record<string, unknown> = {}) =>
    request.get<unknown, Record<string, number>>('/analysis/overview', { params }),

  /** 重要等级分布 */
  getLevelDistribution: (params: Record<string, unknown> = {}) =>
    request.get<unknown, Record<string, number>>('/analysis/level', { params }),

  /** 预警等级分布 */
  getWarningDistribution: (params: Record<string, unknown> = {}) =>
    request.get<unknown, Record<string, number>>('/analysis/warning', { params }),

  /** 整改趋势 */
  getTrend: () => request.get<unknown, unknown[]>('/analysis/trend'),

  /** 区域排名 */
  getRank: (params: Record<string, unknown> = {}) =>
    request.get<unknown, unknown[]>('/analysis/rank', { params }),
}
