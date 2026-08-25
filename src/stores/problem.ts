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
    loading.value = true
    try {
      const result: PageResult<Problem> = await problemApi.getList({ ...query })
      list.value = result.list
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: string): Promise<void> {
    currentDetail.value = await problemApi.getDetail(id)
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
  }
})
