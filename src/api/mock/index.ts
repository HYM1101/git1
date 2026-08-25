/**
 * Mock Adapter —— 仅在 VITE_MOCK=on 时激活
 * 用 axios-mock-adapter 拦截请求，返回内存种子数据。
 * 后端就绪后设 VITE_MOCK=off 即可切换到真实接口。
 */
import type { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { mockProblems, mockUsers } from './problemData'
import type { ApiResponse, Problem, PageResult, LoginResult, UserInfo } from '@/types'

/** 包装成统一响应体 */
function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'success', data }
}

/** 分页切片 */
function paginate<T>(list: T[], page: number, pageSize: number): PageResult<T> {
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
  }
}

/** 初始化 Mock 拦截器 */
export function setupMock(instance: AxiosInstance): void {
  const mock = new MockAdapter(instance, { delayResponse: 300 })

  // ── 认证 ──
  mock.onPost('/auth/login').reply((config) => {
    const body = JSON.parse(config.data)
    const user = mockUsers.find((u) => u.username === body.username && u.password === body.password)
    if (!user) {
      return [200, ok(null as never)]
    }
    const { password: _pwd, ...userInfo } = user
    const result: LoginResult = {
      token: `mock-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${user.id}`,
      user: userInfo as UserInfo,
    }
    return [200, ok(result)]
  })

  mock.onGet('/auth/userInfo').reply((config) => {
    const auth = config.headers?.Authorization as string
    const match = auth?.match(/mock-token-(\d+)/)
    if (!match) return [401]
    const user = mockUsers.find((u) => u.id === Number(match[1]))
    if (!user) return [401]
    const { password: _pwd, ...userInfo } = user
    return [200, ok(userInfo as UserInfo)]
  })

  mock.onPost('/auth/refresh').reply(() => {
    return [
      200,
      ok({ token: `mock-token-refreshed-${Date.now()}`, refreshToken: 'mock-refresh-new' }),
    ]
  })

  mock.onPost('/auth/logout').reply(() => [200, ok(undefined as never)])

  // ── 问题台账 ──
  mock.onGet('/problems').reply((config) => {
    const params = config.params || {}
    let list = [...mockProblems]

    // 数据隔离：responsible 角色仅见本县（regionCode）数据
    const auth = config.headers?.Authorization as string
    const tokenMatch = auth?.match(/mock-token-(\d+)/)
    if (tokenMatch) {
      const user = mockUsers.find((u) => u.id === Number(tokenMatch[1]))
      if (user?.role === 'responsible' && user.regionCode) {
        list = list.filter((p) => p.regionCode === user.regionCode)
      }
    }

    // 筛选
    if (params.regionCode) list = list.filter((p) => p.regionCode === params.regionCode)
    if (params.pollutionType) list = list.filter((p) => p.pollutionType === params.pollutionType)
    if (params.importantLevel) list = list.filter((p) => p.importantLevel === params.importantLevel)
    if (params.warningLevel) list = list.filter((p) => p.warningLevel === params.warningLevel)
    if (params.status) list = list.filter((p) => p.status === params.status)
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(kw) || p.problemNo.toLowerCase().includes(kw),
      )
    }

    // 排序：预警等级优先 > 超期天数降序
    const warningOrder = { red: 0, orange: 1, yellow: 2, green: 3 }
    list.sort((a, b) => {
      const w = warningOrder[a.warningLevel] - warningOrder[b.warningLevel]
      if (w !== 0) return w
      return b.overdueDays - a.overdueDays
    })

    const page = Number(params.page) || 1
    const pageSize = Number(params.pageSize) || 20
    return [200, ok(paginate(list, page, pageSize))]
  })

  mock.onGet(/\/problems\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const problem = mockProblems.find((p) => p.id === id)
    if (!problem) return [404, ok(null as never)]
    return [200, ok(problem)]
  })

  mock.onPost('/problems').reply((config) => {
    const body = JSON.parse(config.data) as Partial<Problem>
    const id = `P${String(mockProblems.length + 1).padStart(4, '0')}`
    const newProblem: Problem = {
      id,
      problemNo: `BS-2026-${id.slice(1)}`,
      title: body.title || '未命名问题',
      source: body.source || '日常巡查',
      regionCode: body.regionCode || '451000',
      regionName: body.regionName || '右江区',
      pollutionType: body.pollutionType || '水',
      responsibleUnit: body.responsibleUnit,
      responsiblePerson: body.responsiblePerson,
      deadline: body.deadline || new Date().toISOString().slice(0, 10),
      importantLevel: body.importantLevel || 'green',
      sourceGrade: body.sourceGrade,
      riskGrade: body.riskGrade,
      warningLevel: 'green',
      overdueDays: 0,
      status: 'pending',
      progress: 0,
      riskTags: body.riskTags || [],
      lng: body.lng,
      lat: body.lat,
      createdAt: new Date().toISOString().slice(0, 10),
      completedPhases: [],
      timeline: [
        {
          time: new Date().toLocaleString('zh-CN', { hour12: false }),
          action: 'CREATE',
          desc: '系统录入',
          user: '录入人员',
        },
      ],
    }
    mockProblems.unshift(newProblem)
    return [200, ok(newProblem)]
  })

  mock
    .onPost(/\/problems\/[^/]+\/(assign|progress|submit|accept|reject|rework)$/)
    .reply((config) => {
      const parts = config.url?.split('/')
      const id = parts?.[2]
      const action = parts?.[3] ?? ''
      const problem = mockProblems.find((p) => p.id === id)
      if (!problem) return [404, ok(null as never)]
      // 简化流转映射
      const actionToStatus: Record<string, Problem['status']> = {
        assign: 'inProgress',
        submit: 'verify',
        accept: 'closed',
        reject: 'rejected',
        rework: 'inProgress',
      }
      if (actionToStatus[action]) {
        problem.status = actionToStatus[action]
        if (action === 'accept') problem.progress = 100
        if (action === 'submit') problem.completedPhases = [0, 1, 2, 3, 4]
      }
      // 追加生命周期时间线（留痕）
      const descMap: Record<string, string> = {
        assign: '下发责任单位',
        submit: '提交验收申请',
        accept: '验收通过，销号',
        reject: '验收驳回，退回整改',
        rework: '重新整改',
      }
      const userMap: Record<string, string> = {
        assign: '市局',
        submit: '责任单位',
        accept: '市局',
        reject: '市局',
        rework: '责任单位',
      }
      if (descMap[action]) {
        problem.timeline = [
          ...(problem.timeline || []),
          {
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
            action: action.toUpperCase(),
            desc: descMap[action],
            user: userMap[action],
          },
        ]
      }
      return [200, ok(problem)]
    })

  mock.onPost(/\/problems\/[^/]+\/progress$/).reply((config) => {
    const id = config.url?.split('/')[2]
    const body = JSON.parse(config.data)
    const problem = mockProblems.find((p) => p.id === id)
    if (!problem) return [404, ok(null as never)]
    // 三扇区进度更新 + 阶段勾选记录
    if (body.measures) problem.progress = Math.max(problem.progress, 30)
    if (body.effect) problem.progress = Math.max(problem.progress, 60)
    if (body.attachments?.length) problem.progress = 100
    if (Array.isArray(body.completedPhases)) problem.completedPhases = body.completedPhases
    // 进度留痕
    problem.timeline = [
      ...(problem.timeline || []),
      {
        time: new Date().toLocaleString('zh-CN', { hour12: false }),
        action: 'PROGRESS',
        desc: `填报整改进度（当前 ${problem.progress}%）`,
        user: '责任单位',
      },
    ]
    return [200, ok(problem)]
  })

  // ── 预警统计 ──
  mock.onGet('/warnings/stats').reply(() => {
    const stats = { red: 0, orange: 0, yellow: 0, green: 0 }
    mockProblems.forEach((p) => {
      stats[p.warningLevel]++
    })
    return [200, ok(stats)]
  })

  // ── 预警清单（含筛选）──
  mock.onGet('/warnings').reply((config) => {
    const params = config.params || {}
    let list = mockProblems
      .filter((p) => p.warningLevel !== 'green') // 仅预警问题
      .map((p) => ({
        id: p.id,
        problemNo: p.problemNo,
        title: p.title,
        warningLevel: p.warningLevel,
        overdueDays: p.overdueDays,
        responsibleUnit: p.responsibleUnit,
        responsiblePerson: p.responsiblePerson,
        deadline: p.deadline,
        status: p.status,
        urged: false,
        supervised: false,
      }))
    if (params.warningLevel) list = list.filter((w) => w.warningLevel === params.warningLevel)
    const warningOrder: Record<string, number> = { red: 0, orange: 1, yellow: 2 }
    list.sort((a, b) => {
      const w = (warningOrder[a.warningLevel] ?? 3) - (warningOrder[b.warningLevel] ?? 3)
      if (w !== 0) return w
      return b.overdueDays - a.overdueDays
    })
    const page = Number(params.page) || 1
    const pageSize = Number(params.pageSize) || 20
    return [200, ok(paginate(list, page, pageSize))]
  })

  // ── 统计分析 ──
  mock.onGet('/analysis/overview').reply(() => {
    return [
      200,
      ok({
        total: mockProblems.length,
        pending: mockProblems.filter((p) => p.status === 'pending').length,
        inProgress: mockProblems.filter((p) => p.status === 'inProgress').length,
        verify: mockProblems.filter((p) => p.status === 'verify').length,
        closed: mockProblems.filter((p) => p.status === 'closed').length,
        overdue: mockProblems.filter((p) => p.overdueDays > 0).length,
      }),
    ]
  })

  mock.onGet('/analysis/level').reply(() => {
    const stats = { red: 0, orange: 0, green: 0 }
    mockProblems.forEach((p) => stats[p.importantLevel]++)
    return [200, ok(stats)]
  })

  mock.onGet('/analysis/warning').reply(() => {
    const stats = { red: 0, orange: 0, yellow: 0, green: 0 }
    mockProblems.forEach((p) => stats[p.warningLevel]++)
    return [200, ok(stats)]
  })

  // 整改趋势（近 8 月销号数）
  mock.onGet('/analysis/trend').reply(() => {
    const months = [
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
    ]
    const trend = months.map((m, i) => ({
      month: m,
      count: mockProblems.filter(
        (p) =>
          p.status === 'closed' &&
          Number(p.createdAt.slice(0, 4) + p.createdAt.slice(5, 7)) <= Number(m.replace('-', '')) &&
          i < 8,
      ).length,
    }))
    // 简化：模拟逐月增长
    trend.forEach((t, i) => {
      t.count = Math.max(t.count, [2, 4, 5, 8, 9, 11, 14, 16][i] || 0)
    })
    return [200, ok(trend)]
  })

  // 区域排名
  mock.onGet('/analysis/rank').reply(() => {
    const map = new Map<string, number>()
    mockProblems.forEach((p) => {
      map.set(p.regionName, (map.get(p.regionName) || 0) + 1)
    })
    const rank = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    return [200, ok(rank)]
  })

  // ── GIS ──
  mock.onGet('/gis/points').reply(() => {
    return [
      200,
      ok(
        mockProblems.map((p) => ({
          id: p.id,
          lng: p.lng,
          lat: p.lat,
          level: p.importantLevel,
          title: p.title,
        })),
      ),
    ]
  })

  mock.onGet('/gis/heatmap').reply(() => {
    return [
      200,
      ok(
        mockProblems
          .filter((p) => p.lng && p.lat)
          .map((p) => ({ lng: p.lng, lat: p.lat, value: p.overdueDays })),
      ),
    ]
  })
}
