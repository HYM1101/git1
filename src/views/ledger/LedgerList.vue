<template>
  <AppShell>
    <div class="ledger-filter" aria-label="问题筛选">
      <label class="filter-group"
        ><span class="filter-label">状态：</span
        ><select v-model="problemStore.query.status" class="filter-select" @change="handleSearch">
          <option :value="undefined">全部</option>
          <option value="pending">待交办</option>
          <option value="inProgress">整改中</option>
          <option value="verify">待验收</option>
          <option value="rejected">已驳回</option>
          <option value="closed">已销号</option>
        </select></label
      >
      <label class="filter-group"
        ><span class="filter-label">重要等级：</span
        ><select
          v-model="problemStore.query.importantLevel"
          class="filter-select"
          @change="handleSearch"
        >
          <option :value="undefined">全部</option>
          <option value="red">红色</option>
          <option value="orange">橙色</option>
          <option value="green">绿色</option>
        </select></label
      >
      <label class="filter-group"
        ><span class="filter-label">预警等级：</span
        ><select
          v-model="problemStore.query.warningLevel"
          class="filter-select"
          @change="handleSearch"
        >
          <option :value="undefined">全部</option>
          <option value="red">红色</option>
          <option value="orange">橙色</option>
          <option value="yellow">黄色</option>
          <option value="green">正常</option>
        </select></label
      >
      <select
        v-model="problemStore.query.regionCode"
        class="filter-select"
        aria-label="区域"
        @change="handleSearch"
      >
        <option :value="undefined">区域：全部</option>
        <option v-for="region in regions" :key="region.value" :value="region.value">
          {{ region.label }}
        </option>
      </select>
      <select
        v-model="problemStore.query.pollutionType"
        class="filter-select filter-select--wide"
        aria-label="污染类型"
        @change="handleSearch"
      >
        <option :value="undefined">污染类型：全部</option>
        <option v-for="type in pollutionTypes" :key="type" :value="type">{{ type }}</option>
      </select>
      <select
        v-model="localFilters.category"
        class="filter-select filter-select--wide"
        aria-label="问题分类"
      >
        <option value="">问题分类：全部</option>
        <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
      </select>
      <select
        v-model="localFilters.industry"
        class="filter-select filter-select--wide"
        aria-label="行业类别"
      >
        <option value="">行业类别：全部</option>
        <option v-for="item in industries" :key="item" :value="item">{{ item }}</option>
      </select>
      <label class="filter-group"
        ><span class="filter-label">时间范围：</span
        ><input
          v-model="localFilters.startDate"
          class="filter-input ledger-date"
          type="date"
          aria-label="开始日期" /><span class="date-separator">至</span
        ><input
          v-model="localFilters.endDate"
          class="filter-input ledger-date"
          type="date"
          aria-label="结束日期"
      /></label>
      <input
        v-model="problemStore.query.keyword"
        class="filter-input"
        placeholder="搜索问题标题、编号…"
        aria-label="关键词"
        @keyup.enter="handleSearch"
      />
      <button class="filter-button filter-button--primary" type="button" @click="handleSearch">
        查询
      </button>
      <button class="filter-button" type="button" @click="handleReset">重置</button>
    </div>

    <section class="ledger-toolbar">
      <el-button
        v-if="userStore.isAdmin || userStore.isOperator"
        type="primary"
        @click="router.push('/problem/input')"
        >新增问题</el-button
      >
      <el-button v-if="userStore.isAdmin || userStore.isOperator" @click="importInput?.click()"
        >批量导入</el-button
      >
      <input ref="importInput" class="sr-only" type="file" accept=".csv" @change="handleImport" />
      <el-button v-if="userStore.isAdmin || userStore.isOperator" @click="exportSelected"
        >批量导出</el-button
      >
      <el-button v-if="userStore.isAdmin" :loading="deleting" @click="deleteSelected"
        >批量删除</el-button
      >
      <span>共 {{ problemStore.total }} 条</span>
    </section>

    <section class="table-panel" :class="{ 'is-loading': problemStore.loading }">
      <div class="table-scroll">
        <table class="ledger-table">
          <thead>
            <tr>
              <th class="col-check">
                <input
                  type="checkbox"
                  aria-label="全选"
                  :checked="allSelected"
                  @change="toggleAll"
                />
              </th>
              <th class="col-level">重要等级</th>
              <th class="col-title">问题标题</th>
              <th class="col-region">区域</th>
              <th class="col-type">污染类型</th>
              <th class="col-category">问题分类</th>
              <th class="col-industry">行业类别</th>
              <th class="col-status">状态</th>
              <th class="col-warning">预警等级</th>
              <th class="col-overdue">超期/剩余</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in displayedList"
              :key="row.id"
              :class="`ledger-row--${row.importantLevel}`"
              @click="router.push(`/problem/${row.id}`)"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  :aria-label="`选择${row.title}`"
                  :checked="selectedIds.includes(row.id)"
                  @change="toggleRow(row.id)"
                />
              </td>
              <td>
                <span class="ledger-level" :class="`ledger-level--${row.importantLevel}`">{{
                  getImportantLabel(row.importantLevel)
                }}</span>
              </td>
              <td>{{ row.title }}</td>
              <td>{{ row.regionName || '-' }}</td>
              <td>{{ row.pollutionType === '水' ? '水污染' : row.pollutionType }}</td>
              <td>{{ row.category || '-' }}</td>
              <td>{{ row.industry || '-' }}</td>
              <td>
                <span class="ledger-status" :class="`ledger-status--${row.status}`">{{
                  getStatusLabel(row.status)
                }}</span>
              </td>
              <td>
                <span class="ledger-warning" :class="`ledger-warning--${row.warningLevel}`">{{
                  getWarningLabel(row.warningLevel)
                }}</span>
              </td>
              <td>
                <span :class="row.overdueDays > 0 ? 'is-overdue' : 'is-remaining'">{{
                  row.overdueDays > 0
                    ? `超期${row.overdueDays}天`
                    : `剩余${Math.abs(row.overdueDays)}天`
                }}</span>
              </td>
              <td @click.stop>
                <button class="row-link" type="button" @click="router.push(`/problem/${row.id}`)">
                  查看</button
                ><span class="row-progress"> | {{ row.progress }}%</span>
              </td>
            </tr>
            <tr v-if="!problemStore.loading && !displayedList.length" class="ledger-empty-row">
              <td colspan="11">
                <div class="ledger-empty">暂无符合当前筛选条件的问题数据</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :page="problemStore.query.page"
        :page-size="problemStore.query.pageSize"
        :total="problemStore.total"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import { useUserStore } from '@/stores/user'
import { useProblemStore } from '@/stores/problem'
import { problemApi } from '@/api/problem'
import PaginationBar from '@/components/common/PaginationBar.vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import { ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { STATUS_LABELS } from '@/utils/status'
import type { ProblemStatus } from '@/utils/status'
import type { Problem } from '@/types'
import { IMPORTANT_LEVEL_LABELS, WARNING_LEVEL_LABELS } from '@/constants'
import type { ImportantLevel } from '@/utils/level'
import type { WarningLevel } from '@/utils/warning'

const router = useRouter()
const userStore = useUserStore()
const problemStore = useProblemStore()
const selectedIds = ref<string[]>([])
const importInput = ref<HTMLInputElement | null>(null)
const deleting = ref(false)
const regions = [
  { label: 'A县', value: '451000' },
  { label: 'B县', value: '451100' },
  { label: 'C县', value: '451200' },
  { label: 'D县', value: '451300' },
  { label: 'E县', value: '451400' },
]
const pollutionTypes = ['大气', '水', '固废', '土壤', '噪声', '生态']
const categories = [
  '涉重企业',
  '尾矿库',
  '矿山',
  '散乱污',
  '供水厂',
  '垃圾填埋场',
  '水源地',
  '其他',
]
const industries = ['金矿采选', '电解锰', '环境卫生管理', '采矿', '化工', '建筑', '其他']
const localFilters = reactive({
  category: '',
  industry: '',
  startDate: '',
  endDate: '',
})
const displayedList = computed(() =>
  problemStore.list.filter((problem: Problem) => {
    if (localFilters.category && problem.category !== localFilters.category) return false
    if (localFilters.industry && problem.industry !== localFilters.industry) return false
    if (localFilters.startDate && problem.createdAt < localFilters.startDate) return false
    if (localFilters.endDate && problem.createdAt > localFilters.endDate) return false
    return true
  }),
)
const allSelected = computed(
  () =>
    displayedList.value.length > 0 &&
    displayedList.value.every((item) => selectedIds.value.includes(item.id)),
)

function toggleRow(id: string): void {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id]
}
function toggleAll(): void {
  const visibleIds = displayedList.value.map((item) => item.id)
  selectedIds.value = allSelected.value
    ? selectedIds.value.filter((id) => !visibleIds.includes(id))
    : [...new Set([...selectedIds.value, ...visibleIds])]
}
function exportSelected(): void {
  const rows = selectedIds.value.length
    ? displayedList.value.filter((item) => selectedIds.value.includes(item.id))
    : displayedList.value
  if (!rows.length) {
    ElMessage.warning('当前没有可导出的数据')
    return
  }
  const csv =
    '\uFEFF' +
    [
      ['编号', '问题标题', '区域', '状态'],
      ...rows.map((item) => [
        item.problemNo,
        item.title,
        item.regionName,
        getStatusLabel(item.status),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = '问题台账.csv'
  anchor.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${rows.length} 条数据`)
}
async function handleImport(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.csv')) {
    ElMessage.error('仅支持 CSV 文件')
    input.value = ''
    return
  }
  try {
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) throw new Error('CSV 中没有可导入的数据')
    const headers = lines[0].split(',').map((item) => item.trim())
    const titleIndex = headers.findIndex((item) => ['问题标题', '标题', 'title'].includes(item))
    if (titleIndex < 0) throw new Error('CSV 缺少“问题标题”列')
    let success = 0
    for (const line of lines.slice(1)) {
      const cells = line.split(',').map((item) => item.trim())
      if (!cells[titleIndex]) continue
      const created = await problemApi.create({
        title: cells[titleIndex],
        regionName: cells[headers.indexOf('区域')] || 'A县',
        pollutionType: cells[headers.indexOf('污染类型')] || '大气',
        source: '批量导入',
      })
      problemStore.addCreatedProblem(created)
      success += 1
    }
    if (!success) throw new Error('CSV 中没有有效的问题记录')
    ElMessage.success(`成功导入 ${success} 条问题`)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导入失败，请检查文件格式')
  } finally {
    input.value = ''
  }
}
async function deleteSelected(): Promise<void> {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先选择需要删除的问题')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认删除已选中的 ${selectedIds.value.length} 条记录？`,
      '批量删除',
      {
        type: 'warning',
      },
    )
  } catch {
    return
  }
  deleting.value = true
  try {
    problemStore.removeProblems(selectedIds.value)
    selectedIds.value = []
    ElMessage.success('删除成功')
  } catch {
    ElMessage.error('删除失败，请重试')
  } finally {
    deleting.value = false
  }
}

function getStatusLabel(status: ProblemStatus): string {
  return STATUS_LABELS[status]
}

function getImportantLabel(level: ImportantLevel): string {
  return `重:${IMPORTANT_LEVEL_LABELS[level].replace(/^[红橙绿]色/, '')}`
}

function getWarningLabel(level: WarningLevel): string {
  return WARNING_LEVEL_LABELS[level]
}

function handleSearch(): void {
  problemStore.setPage(1)
  problemStore.fetchList()
}
function handleReset(): void {
  problemStore.resetQuery()
  localFilters.category = ''
  localFilters.industry = ''
  localFilters.startDate = ''
  localFilters.endDate = ''
  problemStore.fetchList()
}

function handlePageChange(page: number): void {
  problemStore.setPage(page)
  problemStore.fetchList()
}

function handlePageSizeChange(pageSize: number): void {
  problemStore.query.pageSize = pageSize
  problemStore.setPage(1)
  problemStore.fetchList()
}
onMounted(() => problemStore.fetchList())
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.ledger-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  span:last-child {
    margin-left: auto;
    color: $color-text-secondary;
    font-size: 13px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.table-panel {
  overflow: hidden;
  background: $bg-card;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.filter-label {
  color: $color-text-secondary;
  font-size: 12px;
  white-space: nowrap;
}

.ledger-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: #fafbf8;
  border: 1px solid rgb(0 0 0 / 4%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.filter-group {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.filter-select,
.filter-input {
  min-width: 100px;
  padding: 7px 12px;
  color: $color-text-regular;
  font: inherit;
  font-size: 12.8px;
  line-height: 18px;
  background: $bg-page;
  border: 1px solid $border-base;
  border-radius: 6px;
  outline: none;
}

.filter-select--wide {
  min-width: 120px;
}

.filter-input {
  min-width: 200px;
}

.filter-button {
  padding: 7px 16px;
  color: $color-text-regular;
  font: inherit;
  font-size: 12.8px;
  line-height: 18px;
  cursor: pointer;
  background: #fafbf8;
  border: 1px solid $border-base;
  border-radius: 6px;
}

.filter-button--primary {
  color: #fff;
  background: $color-primary;
  border-color: $color-primary;
}

.date-separator {
  color: $color-text-secondary;
  font-size: 12px;
}

.ledger-date {
  width: 120px;
  min-width: 120px;
}

.table-scroll {
  overflow-x: auto;
}

.ledger-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;

  th {
    padding: 14px 16px;
    color: #0d3b1a;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-align: left;
    background: #f0f4f0;
  }

  th,
  td {
    white-space: nowrap;
  }

  .col-title,
  td:nth-child(3) {
    white-space: normal;
  }

  td {
    padding: 14px 16px;
    font-family: 'Arial', 'Roboto', monospace, monospace;
    font-size: 13.6px;
    border-bottom: 1px solid $border-base;
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover td {
    background: rgba(26, 95, 42, 0.02);
  }

  .col-check {
    width: 30px;
  }

  .col-level,
  .col-type,
  .col-category,
  .col-status,
  .col-overdue {
    width: 80px;
  }

  .col-title {
    min-width: 220px;
  }

  .col-region,
  .col-warning {
    width: 90px;
  }

  .col-industry,
  .col-action {
    width: 100px;
  }
}

.table-panel.is-loading {
  opacity: 0.72;
}

.ledger-empty-row td {
  padding: 0 !important;
  background: #fff !important;
}

.ledger-empty {
  display: grid;
  min-height: 220px;
  color: #8a938d;
  font-size: 13px;
  text-align: center;
  place-content: center;
}

.ledger-table .ledger-row--red td {
  background: #ffebee;
}

.ledger-table .ledger-row--orange td {
  background: #fff3e0;
}

.ledger-table .ledger-row--green td {
  background: #e8f5e9;
}

.is-overdue {
  color: #e53935;
  font-weight: 600;
}

.is-remaining {
  color: #43a047;
  font-weight: 600;
}

.row-progress {
  color: $color-text-secondary;
  font-size: 11px;
}

:deep(.el-table__fixed-right .el-table__cell .cell) {
  padding: 0 4px;
  white-space: nowrap;
}

.row-link {
  padding: 0;
  color: $color-primary;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ledger-level,
.ledger-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  color: #fff;
  font-family: 'Arial', 'Roboto', monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.4;
  border-radius: 4px;
  white-space: nowrap;
}

.ledger-level--red,
.ledger-status--rejected {
  background: #e53935;
}

.ledger-level--orange,
.ledger-status--pending {
  background: #fb8c00;
}

.ledger-level--green,
.ledger-status--closed {
  background: #43a047;
}

.ledger-status--inProgress {
  background: #00897b;
}

.ledger-status--verify {
  background: #7b1fa2;
}

.ledger-warning {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.ledger-warning--green {
  color: #43a047;
}

.ledger-warning--yellow {
  color: #d4a800;
}

.ledger-warning--orange {
  color: #fb8c00;
}

.ledger-warning--red {
  color: #e53935;
}
</style>
