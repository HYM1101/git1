/**
 * 问题台账 Store —— 列表数据、筛选条件、分页状态管理
 */
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { problemApi, type ProblemQuery } from '@/api/problem'
import type { Problem, PageResult } from '@/types'

export const useProblemStore = defineStore('problem', () => {
  // ── State ──
  const list = ref<Problem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentDetail = ref<Problem | null>(null)
  let listRequestId = 0
  let detailRequestId = 0

  const query = reactive<ProblemQuery>({
    page: 1,
    pageSize: 20,
    regionCode: undefined,
    pollutionType: undefined,
    importantLevel: undefined,
    warningLevel: undefined,
    status: undefined,
    keyword: undefined,
  })

  // ── Actions ──
  async function fetchList(): Promise<void> {
    const requestId = ++listRequestId
    loading.value = true
    try {
      const result: PageResult<Problem> = await problemApi.getList({ ...query })
      if (requestId !== listRequestId) return
      list.value = result.list
      total.value = result.total
    } finally {
      if (requestId === listRequestId) loading.value = false
    }
  }

  async function fetchDetail(id: string): Promise<void> {
    const requestId = ++detailRequestId
    const result = await problemApi.getDetail(id)
    if (requestId === detailRequestId) currentDetail.value = result
  }

  function resetQuery(): void {
    query.page = 1
    query.pageSize = 20
    query.regionCode = undefined
    query.pollutionType = undefined
    query.importantLevel = undefined
    query.warningLevel = undefined
    query.status = undefined
    query.keyword = undefined
  }

  function setPage(page: number): void {
    query.page = page
  }

  /** 录入成功后立即同步当前台账缓存，避免返回列表时出现旧数据。 */
  function addCreatedProblem(problem: Problem): void {
    list.value = [problem, ...list.value.filter((item) => item.id !== problem.id)]
    total.value += 1
    query.page = 1
  }

  function removeProblems(ids: string[]): void {
    const idSet = new Set(ids)
    const removed = list.value.filter((item) => idSet.has(item.id)).length
    list.value = list.value.filter((item) => !idSet.has(item.id))
    total.value = Math.max(0, total.value - removed)
  }

  return {
    list,
    total,
    loading,
    currentDetail,
    query,
    fetchList,
    fetchDetail,
    resetQuery,
    setPage,
    addCreatedProblem,
    removeProblems,
  }
})
