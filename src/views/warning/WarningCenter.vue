<template>
  <AppShell>
    <section class="warning-content">
      <PageHeader title="预警中心" :crumbs="['预警中心']">
        <template #actions>
          <el-button :icon="Refresh" :loading="loading" @click="loadAll">刷新</el-button>
        </template>
      </PageHeader>

      <!-- 超期滚动播报 -->
      <el-alert v-if="topWarning" :closable="false" type="error" show-icon class="broadcast">
        <span class="broadcast-text"
          >⚠️ 红色三级预警：{{ topWarning.title }}（超期 {{ topWarning.overdueDays }} 天）</span
        >
      </el-alert>

      <!-- 四级统计 -->
      <div class="panel-grid">
        <StatPanel label="红色三级预警" :value="stats.red" color="#E53935">
          <div class="panel-row">
            <span>需立即督办</span><span>{{ stats.red }} 项</span>
          </div>
        </StatPanel>
        <StatPanel label="橙色二级预警" :value="stats.orange" color="#FB8C00">
          <div class="panel-row">
            <span>超期 ≥90 天</span><span>{{ stats.orange }} 项</span>
          </div>
        </StatPanel>
        <StatPanel label="黄色一级预警" :value="stats.yellow" color="#FDD835">
          <div class="panel-row">
            <span>超期 ≥30 天</span><span>{{ stats.yellow }} 项</span>
          </div>
        </StatPanel>
        <StatPanel label="正常" :value="stats.green" color="#43A047">
          <div class="panel-row">
            <span>未超期问题</span><span>{{ stats.green }} 项</span>
          </div>
        </StatPanel>
      </div>

      <nav class="warning-tabs" aria-label="预警等级">
        <button
          v-for="tab in warningTabs"
          :key="tab.value"
          type="button"
          :class="{ active: activeLevel === tab.value }"
          @click="activeLevel = tab.value"
        >
          {{ tab.label }} <b>{{ tab.count }}</b>
        </button>
      </nav>
      <div class="warning-filters">
        <input
          v-model="keyword"
          class="filter-input"
          placeholder="搜索问题标题、区域、责任单位…"
          aria-label="搜索"
        />
        <select v-model="region" class="filter-select" aria-label="区域筛选">
          <option value="">全部区域</option>
          <option v-for="item in regions" :key="item" :value="item">{{ item }}</option>
        </select>
        <select v-model="importantLevel" class="filter-select" aria-label="重要等级筛选">
          <option value="">全部等级</option>
          <option value="red">红色重大</option>
          <option value="orange">橙色较大</option>
          <option value="green">绿色常规</option>
        </select>
      </div>

      <!-- 预警清单 -->
      <div class="warning-panel" :class="{ 'is-loading': loading }">
        <div class="table-scroll">
          <table class="warning-table">
            <thead>
              <tr>
                <th class="check-col">
                  <input
                    type="checkbox"
                    aria-label="全选"
                    :checked="allVisibleSelected"
                    :disabled="!visibleList.length"
                    @change="toggleAllVisible"
                  />
                </th>
                <th class="level-col">重要等级</th>
                <th class="title-col">问题标题</th>
                <th class="region-col">区域</th>
                <th class="overdue-col">超期天数</th>
                <th class="warning-col">预警等级</th>
                <th class="unit-col">责任单位</th>
                <th class="action-col">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in visibleList"
                :key="row.id"
                :class="`warning-row--${row.warningLevel}`"
              >
                <td>
                  <input
                    type="checkbox"
                    :aria-label="`选择${row.title}`"
                    :checked="selectedIds.includes(row.id)"
                    @change="toggleRow(row.id)"
                  />
                </td>
                <td>
                  <span class="level-pill" :class="row.importantLevel">{{
                    importantLabel(row.importantLevel)
                  }}</span>
                </td>
                <td>
                  <button
                    class="title-link"
                    type="button"
                    @click="router.push(`/problem/${row.id}`)"
                  >
                    {{ row.title }}
                  </button>
                </td>
                <td>{{ row.regionName }}</td>
                <td>
                  <span :class="warningTime(row).tone">{{ warningTime(row).label }}</span>
                </td>
                <td>
                  <span class="warning-text" :class="row.warningLevel">{{
                    warningLabel(row.warningLevel)
                  }}</span>
                </td>
                <td>{{ row.responsibleUnit || '-' }}</td>
                <td>
                  <button class="action-link orange" type="button" @click="urge(row)">催办</button
                  ><button class="action-link red" type="button" @click="supervise(row)">
                    督办</button
                  ><button
                    class="action-link green"
                    type="button"
                    @click="router.push(`/problem/${row.id}`)"
                  >
                    解除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="loadError" class="table-feedback">
            <span>{{ loadError }}</span>
            <button type="button" @click="loadAll">重新加载</button>
          </div>
          <div v-else-if="!loading && !visibleList.length" class="table-feedback">
            当前筛选条件下暂无预警数据
          </div>
        </div>

        <PaginationBar
          :page="query.page"
          :page-size="query.pageSize"
          :total="total"
          @update:page="
            (p) => {
              query.page = p
            }
          "
          @update:page-size="
            (s) => {
              query.pageSize = s
              query.page = 1
            }
          "
        />
      </div>
      <div class="btn-toolbar">
        <span>已选择 {{ selectedIds.length }} 项</span>
        <button class="danger" type="button" :disabled="batchLoading" @click="batchAction('催办')">
          批量催办</button
        ><button class="danger" type="button" :disabled="batchLoading" @click="batchAction('督办')">
          批量督办</button
        ><button type="button" :disabled="batchLoading" @click="exportWarnings">
          导出预警清单
        </button>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { warningApi } from '@/api'
import AppShell from '@/layouts/AppShell.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatPanel from '@/components/common/StatPanel.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'

interface WarningItem {
  id: string
  problemNo: string
  title: string
  warningLevel: 'red' | 'orange' | 'yellow' | 'green'
  importantLevel: 'red' | 'orange' | 'green'
  regionName: string
  overdueDays: number
  responsibleUnit?: string
  responsiblePerson?: string
  deadline: string
  createdAt: string
  status: string
}

const router = useRouter()
const loading = ref(false)
const batchLoading = ref(false)
const loadError = ref('')
const list = ref<WarningItem[]>([])
const selectedIds = ref<string[]>([])
const sourceTotal = ref(0)
const stats = ref<Record<string, number>>({ red: 0, orange: 0, yellow: 0, green: 0 })

const query = reactive({ page: 1, pageSize: 15 })
const keyword = ref('')
const region = ref('')
const importantLevel = ref('')
const activeLevel = ref('all')
const regions = computed(() => [...new Set(list.value.map((item) => item.regionName))])
const warningTabs = computed(() => [
  { label: '全部', value: 'all', count: sourceTotal.value },
  { label: '红色预警', value: 'red', count: stats.value.red },
  { label: '橙色预警', value: 'orange', count: stats.value.orange },
  { label: '黄色预警', value: 'yellow', count: stats.value.yellow },
  { label: '正常', value: 'green', count: stats.value.green },
])
const filteredList = computed(() =>
  list.value
    .filter((item) => {
      if (activeLevel.value !== 'all' && item.warningLevel !== activeLevel.value) return false
      if (region.value && item.regionName !== region.value) return false
      if (importantLevel.value && item.importantLevel !== importantLevel.value) return false
      const text = `${item.title} ${item.regionName} ${item.responsibleUnit || ''}`.toLowerCase()
      return !keyword.value || text.includes(keyword.value.toLowerCase())
    })
    .sort((a, b) => urgencyScore(b) - urgencyScore(a)),
)
const total = computed(() => filteredList.value.length)
const visibleList = computed(() => {
  const start = (query.page - 1) * query.pageSize
  return filteredList.value.slice(start, start + query.pageSize)
})
const allVisibleSelected = computed(
  () =>
    visibleList.value.length > 0 &&
    visibleList.value.every((item) => selectedIds.value.includes(item.id)),
)
function importantLabel(level: WarningItem['importantLevel']): string {
  return level === 'red' ? '红色重大' : level === 'orange' ? '橙色较大' : '绿色常规'
}
function warningLabel(level: WarningItem['warningLevel']): string {
  return { red: '红色预警', orange: '橙色预警', yellow: '黄色预警', green: '正常' }[level]
}
function urgencyScore(item: WarningItem): number {
  if (item.status !== 'pending') return item.overdueDays ?? -999
  const created = new Date(item.createdAt)
  return Number.isNaN(created.getTime())
    ? 0
    : Math.max(0, Math.floor((Date.now() - created.getTime()) / 86_400_000))
}
function warningTime(item: WarningItem): { label: string; tone: string } {
  if (item.status === 'pending') {
    const days = urgencyScore(item)
    return { label: days ? `录入${days}天` : '当日录入', tone: days > 30 ? 'overdue' : 'normal' }
  }
  return item.overdueDays > 0
    ? { label: `超期${item.overdueDays}天`, tone: 'overdue' }
    : { label: '未超期', tone: 'normal' }
}
function toggleRow(id: string): void {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id]
}

function toggleAllVisible(): void {
  const visibleIds = visibleList.value.map((item) => item.id)
  selectedIds.value = allVisibleSelected.value
    ? selectedIds.value.filter((id) => !visibleIds.includes(id))
    : [...new Set([...selectedIds.value, ...visibleIds])]
}

const topWarning = computed(() => list.value.find((w) => w.warningLevel === 'red'))

watch([keyword, region, importantLevel, activeLevel], () => {
  query.page = 1
})

watch(total, (value) => {
  const lastPage = Math.max(1, Math.ceil(value / query.pageSize))
  if (query.page > lastPage) query.page = lastPage
})

async function loadList(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    // HTML 原页先对完整数据筛选再分页；一次读取完整预警集合，避免只筛选当前页。
    const result = await warningApi.getList({ page: 1, pageSize: 1000 })
    const data = result as unknown as { list: WarningItem[]; total: number }
    list.value = data.list
    sourceTotal.value = data.total
    const validIds = new Set(data.list.map((item) => item.id))
    selectedIds.value = selectedIds.value.filter((id) => validIds.has(id))
  } catch (error) {
    list.value = []
    sourceTotal.value = 0
    loadError.value = error instanceof Error ? error.message : '预警清单加载失败，请稍后重试'
    ElMessage.error(loadError.value)
  } finally {
    loading.value = false
  }
}

async function loadStats(): Promise<void> {
  try {
    stats.value = (await warningApi.getStats()) as Record<string, number>
  } catch {
    stats.value = { red: 0, orange: 0, yellow: 0, green: 0 }
    throw new Error('预警统计加载失败')
  }
}

async function urge(row: unknown): Promise<void> {
  const r = row as WarningItem
  try {
    await warningApi.urge(r.id)
    ElMessage.success(`已对「${r.problemNo}」发出催办`)
  } catch {
    ElMessage.error('催办失败')
  }
}

async function supervise(row: unknown): Promise<void> {
  const r = row as WarningItem
  try {
    await warningApi.supervise(r.id)
    ElMessage.success(`已对「${r.problemNo}」下发督办单`)
  } catch {
    ElMessage.error('督办失败')
  }
}

function loadAll(): void {
  loadList()
  loadStats().catch((error) => ElMessage.error(error.message))
}

async function batchAction(name: '催办' | '督办'): Promise<void> {
  const rows = list.value.filter((item) => selectedIds.value.includes(item.id))
  if (!rows.length) {
    ElMessage.warning(`请先选择需要${name}的预警`)
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认对选中的 ${rows.length} 个问题进行批量${name}？`,
      `批量${name}确认`,
      {
        type: 'warning',
        confirmButtonText: `确认${name}`,
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }
  batchLoading.value = true
  const action = name === '催办' ? warningApi.urge : warningApi.supervise
  try {
    const results = await Promise.allSettled(rows.map((row) => action(row.id)))
    const success = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.length - success
    if (success) ElMessage.success(`已完成 ${success} 项${name}`)
    if (failed) ElMessage.error(`${failed} 项${name}失败，请稍后重试`)
  } finally {
    batchLoading.value = false
  }
}

function csvCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function exportWarnings(): void {
  const selected = list.value.filter((item) => selectedIds.value.includes(item.id))
  const rows = selected.length ? selected : filteredList.value
  if (!rows.length) {
    ElMessage.warning('当前没有可导出的预警数据')
    return
  }
  const csv =
    '\uFEFF' +
    [
      ['问题编号', '问题标题', '区域', '重要等级', '预警等级', '超期天数', '责任单位'],
      ...rows.map((item) => [
        item.problemNo,
        item.title,
        item.regionName,
        importantLabel(item.importantLevel),
        warningLabel(item.warningLevel),
        item.overdueDays,
        item.responsibleUnit || '',
      ]),
    ]
      .map((row) => row.map(csvCell).join(','))
      .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `预警清单_${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${rows.length} 条预警数据`)
}

onMounted(loadAll)
</script>

<style scoped lang="scss">
.warning-content {
  min-width: 0;
}

:deep(.page-header),
.broadcast,
.panel-grid {
  display: none !important;
}

.warning-tabs {
  display: flex;
  gap: 0;
  height: 42px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.warning-tabs button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  margin-bottom: -1px;
  color: #6b7280;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 500;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.warning-tabs button:hover {
  color: #1a1a2e;
}

.warning-tabs button.active {
  color: #1a5f2a;
  font-weight: 600;
  border-bottom-color: #1a5f2a;
}

.warning-tabs b {
  padding: 2px 8px;
  color: #6b7280;
  font-family: 'Arial', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.warning-tabs .active b {
  color: #fff;
  background: #1a5f2a;
}

.warning-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-input,
.filter-select {
  padding: 8px 12px;
  color: #1a1a2e;
  font: inherit;
  font-size: 0.82rem;
  background: #fafbf8;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.filter-input {
  flex: 1;
  min-width: 200px;
}

.filter-input:focus,
.filter-select:focus {
  border-color: #1a5f2a;
  box-shadow: 0 0 0 3px rgba(26, 95, 42, 0.1);
  outline: none;
}

.filter-select {
  min-width: 120px;
}

.level-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  color: #fff;
  font-family: 'Arial', monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 6px;
}

.level-pill.red {
  background: #e53935;
  box-shadow: 0 1px 4px rgba(229, 57, 53, 0.25);
}

.level-pill.orange {
  background: #fb8c00;
  box-shadow: 0 1px 4px rgba(251, 140, 0, 0.25);
}

.level-pill.green {
  background: #43a047;
  box-shadow: 0 1px 4px rgba(67, 160, 71, 0.25);
}

.table-scroll {
  overflow-x: auto;
}

.warning-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.warning-table th,
.warning-table td {
  padding: 14px 16px;
  font-size: 13.6px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.warning-table th {
  color: #0d3b1a;
  font-size: 13px;
  background: #f0f4f0;
}

.check-col {
  width: 30px;
}

.level-col,
.region-col {
  width: 80px;
}

.title-col {
  min-width: 220px;
}

.overdue-col {
  width: 100px;
}

.warning-col {
  width: 90px;
}

.unit-col {
  min-width: 120px;
}

.action-col {
  width: 120px;
}

.warning-row--red td {
  background: #fff5f5;
}

.warning-row--orange td {
  background: #fff8f0;
}

.warning-panel.is-loading {
  opacity: 0.72;
}

.overdue {
  color: #e53935;
  font-weight: 600;
}

.normal {
  color: #43a047;
}

.warning-text {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-family: 'Arial', monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 6px;
}

.warning-text.red {
  color: #fff;
  background: #e53935;
  box-shadow: 0 1px 4px rgba(229, 57, 53, 0.25);
}

.warning-text.orange {
  color: #fff;
  background: #fb8c00;
  box-shadow: 0 1px 4px rgba(251, 140, 0, 0.25);
}

.warning-text.yellow {
  color: #333;
  background: #fdd835;
  box-shadow: 0 1px 4px rgba(253, 216, 53, 0.25);
}

.warning-text.green {
  color: #fff;
  background: #43a047;
  box-shadow: 0 1px 4px rgba(67, 160, 71, 0.25);
}

.title-link {
  padding: 0;
  color: #0788d6;
  font: inherit;
  cursor: pointer;
  background: none;
  border: 0;
}

.action-link {
  padding: 0;
  margin-right: 8px;
  color: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: 0;
  transition: opacity 0.2s;
}

.action-link:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.action-link.red {
  color: #e53935;
}

.action-link.orange {
  color: #fb8c00;
}

.action-link.green {
  color: #43a047;
}

.btn-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.btn-toolbar span {
  margin-right: auto;
  color: #64748b;
  font-size: 12px;
}

.btn-toolbar button {
  padding: 8px 16px;
  color: #374151;
  font: inherit;
  font-size: 13px;
  background: #fff;
  border: 1px solid #dfe5df;
  border-radius: 6px;
}

.btn-toolbar .danger {
  color: #fff;
  background: #e53935;
  border-color: #e53935;
}

.btn-toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.table-feedback {
  display: grid;
  min-height: 180px;
  color: #7b8493;
  font-size: 13px;
  text-align: center;
  place-content: center;
}

.table-feedback button {
  width: fit-content;
  padding: 7px 14px;
  margin: 10px auto 0;
  color: #fff;
  background: #166534;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.broadcast {
  margin-bottom: 16px;
  border-radius: 8px;
}

.broadcast-text {
  font-weight: 600;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.warning-panel {
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.panel-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-muted);
}

@media (width <= 1439px) {
  .panel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 900px) {
  .warning-tabs {
    gap: 18px;
    overflow-x: auto;
  }

  .warning-tabs button {
    flex: 0 0 auto;
  }

  .warning-filters {
    flex-wrap: wrap;
  }

  .filter-input {
    flex-basis: 100%;
  }
}
</style>
