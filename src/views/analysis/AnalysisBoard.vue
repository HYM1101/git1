<template>
  <AppShell>
    <section class="analysis-content">
      <PageHeader title="统计分析报表" :crumbs="[]">
        <template #actions>
          <el-button :icon="Refresh" :loading="loading" @click="loadData">刷新</el-button>
          <el-button type="primary" plain :icon="Download" @click="exportReport"
            >导出 CSV</el-button
          >
        </template>
      </PageHeader>

      <div class="page-intro">
        <span>基于问题台账实时汇总，筛选条件会同步作用于指标、图表和区域明细。</span>
        <span>共 {{ overview.total ?? 0 }} 条有效数据</span>
      </div>

      <el-alert
        v-if="loadError"
        class="load-alert"
        type="error"
        :closable="false"
        :title="loadError"
        show-icon
      />
      <DashboardPanel compact class="filter-panel">
        <div class="filter-grid">
          <label
            ><span>开始日期</span
            ><el-date-picker
              v-model="filters.start"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></label>
          <label
            ><span>结束日期</span
            ><el-date-picker
              v-model="filters.end"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></label>
          <label
            ><span>区域</span
            ><el-select v-model="filters.region" placeholder="全市"
              ><el-option label="全市" value="" /><el-option
                v-for="name in regionOptions"
                :key="name"
                :label="name"
                :value="name" /></el-select
          ></label>
          <label
            ><span>污染类型</span
            ><el-select v-model="filters.pollution" placeholder="全部"
              ><el-option label="全部" value="" /><el-option
                v-for="name in pollutionTypes"
                :key="name"
                :label="name"
                :value="name" /></el-select
          ></label>
          <div class="filter-actions">
            <el-button type="primary" :loading="loading" @click="applyFilters">查询</el-button
            ><el-button @click="resetFilters">重置</el-button>
          </div>
        </div>
        <div class="quick-reports">
          <span>快速报表</span
          ><el-segmented
            v-model="quickReport"
            :options="['月报', '季报', '年报']"
            @change="setQuickReport"
          />
        </div>
      </DashboardPanel>

      <!-- 概览指标 -->
      <div id="overview-section" v-loading="loading" class="stat-row">
        <MetricCard
          label="问题总数"
          :value="overview.total ?? 0"
          :helper="`共 ${overview.total ?? 0} 条记录`"
          :icon="DataAnalysis"
        />
        <MetricCard
          label="已整改完成"
          :value="overview.closed ?? 0"
          :helper="`${completionRate}% 完成率`"
          :icon="CircleCheck"
          color="#2f9e5b"
        />
        <MetricCard
          label="整改中"
          :value="overview.inProgress ?? 0"
          :helper="`进行中 ${overview.inProgress ?? 0} 条`"
          :icon="Loading"
          color="#3b82c4"
        />
        <MetricCard
          label="超期预警"
          :value="overview.overdue ?? 0"
          :helper="`${overview.overdue ?? 0} 条需关注`"
          :icon="Warning"
          color="#d94848"
        />
      </div>

      <div class="analysis-scope">
        <div class="scope-copy">
          <strong>{{ currentScopeTitle }}</strong>
          <span>{{ currentScopeDescription }}</span>
        </div>
        <div class="scope-tags">
          <el-tag v-for="tag in activeFilterTags" :key="tag" type="success" effect="plain" round>{{
            tag
          }}</el-tag>
          <span v-if="!activeFilterTags.length">当前展示全部台账数据</span>
        </div>
      </div>

      <DashboardPanel
        class="trend-panel"
        :title="trendTitle"
        description="按问题录入月份统计，筛选条件变化后同步更新"
      >
        <div v-show="overview.total" ref="trendChartRef" class="trend-chart" />
        <EmptyState v-if="!overview.total" description="当前条件下暂无趋势数据" />
      </DashboardPanel>

      <div class="report-charts">
        <DashboardPanel
          id="level-section"
          title="重要等级分布"
          description="不同重要等级的问题数量与占比"
        >
          <div v-show="overview.total" ref="levelChartRef" class="chart-box" />
          <EmptyState v-if="!overview.total" description="当前条件下暂无等级数据" />
        </DashboardPanel>
        <DashboardPanel
          id="pollution-section"
          :title="pollutionChartTitle"
          :description="pollutionChartDescription"
        >
          <div v-show="overview.total" ref="pollutionChartRef" class="chart-box" />
          <EmptyState v-if="!overview.total" description="当前条件下暂无污染类型数据" />
        </DashboardPanel>
      </div>

      <DashboardPanel
        id="region-section"
        class="region-panel"
        title="区域问题统计"
        description="各区域问题构成、完成率与预警数量"
      >
        <template #actions
          ><span class="table-count">共 {{ regionRows.length }} 个区域</span></template
        >
        <el-table
          :data="pagedRegionRows"
          stripe
          table-layout="fixed"
          empty-text="当前条件下暂无区域数据"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="name" label="区域" min-width="100" fixed="left" />
          <el-table-column prop="air" label="大气" min-width="76" align="center" />
          <el-table-column prop="water" label="水" min-width="76" align="center" />
          <el-table-column prop="soil" label="土壤" min-width="76" align="center" />
          <el-table-column prop="waste" label="固废" min-width="76" align="center" />
          <el-table-column prop="noise" label="噪声" min-width="76" align="center" />
          <el-table-column prop="total" label="合计" min-width="88" align="center" sortable="custom"
            ><template #default="scope"
              ><strong>{{ scope.row.total }}</strong></template
            ></el-table-column
          >
          <el-table-column prop="rateValue" label="完成率" min-width="150" sortable="custom"
            ><template #default="scope"
              ><div class="rate-cell">
                <el-progress
                  :percentage="scope.row.rateValue"
                  :stroke-width="6"
                  :show-text="false"
                /><span>{{ scope.row.rateValue }}%</span>
              </div></template
            ></el-table-column
          >
          <el-table-column
            prop="warning"
            label="预警数"
            min-width="94"
            align="center"
            sortable="custom"
            ><template #default="scope"
              ><el-tag :type="scope.row.warning ? 'danger' : 'info'" effect="light" round>{{
                scope.row.warning
              }}</el-tag></template
            ></el-table-column
          >
        </el-table>
        <template #footer
          ><PaginationBar
            v-model:page="tablePage"
            v-model:page-size="tablePageSize"
            :total="sortedRegionRows.length"
            :page-sizes="[5, 10, 20]"
        /></template>
      </DashboardPanel>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CircleCheck,
  DataAnalysis,
  Download,
  Loading,
  Refresh,
  Warning,
} from '@element-plus/icons-vue'
import { problemApi } from '@/api/problem'
import DashboardPanel from '@/components/common/DashboardPanel.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import MetricCard from '@/components/common/MetricCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import AppShell from '@/layouts/AppShell.vue'
import type { Problem } from '@/types'
import { useECharts } from '@/composables/useECharts'

const overview = ref<Record<string, number>>({})
const loading = ref(false)
const loadError = ref('')
const filters = reactive({ start: '', end: '', region: '', pollution: '' })
const appliedFilters = ref({ start: '', end: '', region: '', pollution: '' })
const quickReport = ref('月报')
const reportProblems = ref<Problem[]>([])
const allProblems = ref<Problem[]>([])
const tablePage = ref(1)
const tablePageSize = ref(5)
const sortState = reactive<{ prop: string; order: 'ascending' | 'descending' | null }>({
  prop: '',
  order: null,
})
const pollutionTypes = ['大气', '水', '土壤', '固废', '噪声', '生态']
const regionOptions = computed(() => [
  ...new Set(allProblems.value.map((item) => item.regionName).filter(Boolean)),
])
const completionRate = computed(() =>
  Math.round(((overview.value.closed ?? 0) / (overview.value.total || 1)) * 100),
)
const activeFilterTags = computed(() => {
  const tags: string[] = []
  if (appliedFilters.value.start || appliedFilters.value.end) {
    tags.push(`${appliedFilters.value.start || '不限'} 至 ${appliedFilters.value.end || '不限'}`)
  }
  if (appliedFilters.value.region) tags.push(appliedFilters.value.region)
  if (appliedFilters.value.pollution) tags.push(`${appliedFilters.value.pollution}类问题`)
  return tags
})
const currentScopeTitle = computed(() =>
  appliedFilters.value.pollution ? `${appliedFilters.value.pollution}问题分析` : '综合问题分析',
)
const currentScopeDescription = computed(() =>
  appliedFilters.value.pollution
    ? `当前所有指标与图表均已限定为${appliedFilters.value.pollution}类问题`
    : '核心指标用于总体概览，详细变化与构成在下方图表中展示',
)
const trendTitle = computed(() =>
  appliedFilters.value.pollution
    ? `${appliedFilters.value.pollution}问题月度趋势`
    : '问题录入月度趋势',
)
const pollutionChartTitle = computed(() =>
  appliedFilters.value.pollution ? `${appliedFilters.value.pollution}问题区域分布` : '污染类型分布',
)
const pollutionChartDescription = computed(() =>
  appliedFilters.value.pollution
    ? `比较各区域${appliedFilters.value.pollution}类问题数量`
    : '按污染类型统计问题数量（单位：条）',
)
const regionRows = computed(() => {
  const names = [...new Set(reportProblems.value.map((item) => item.regionName))]
  return names.map((name) => {
    const rows = reportProblems.value.filter((item) => item.regionName === name)
    const count = (type: string) => rows.filter((item) => item.pollutionType === type).length
    const closed = rows.filter((item) => item.status === 'closed').length
    return {
      name,
      air: count('大气'),
      water: count('水'),
      soil: count('土壤'),
      waste: count('固废'),
      noise: count('噪声'),
      total: rows.length,
      rateValue: Math.round((closed / (rows.length || 1)) * 100),
      warning: rows.filter((item) => item.warningLevel !== 'green').length,
    }
  })
})
const sortedRegionRows = computed(() => {
  const rows = [...regionRows.value]
  if (!sortState.prop || !sortState.order) return rows
  const direction = sortState.order === 'ascending' ? 1 : -1
  return rows.sort((a, b) => {
    const left = a[sortState.prop as keyof typeof a]
    const right = b[sortState.prop as keyof typeof b]
    return (Number(left) - Number(right)) * direction
  })
})
const pagedRegionRows = computed(() => {
  const start = (tablePage.value - 1) * tablePageSize.value
  return sortedRegionRows.value.slice(start, start + tablePageSize.value)
})
const { chartRef: levelChartRef, setOption: setLevelOption } = useECharts()
const { chartRef: pollutionChartRef, setOption: setPollutionOption } = useECharts()
const { chartRef: trendChartRef, setOption: setTrendOption } = useECharts()

async function loadData(): Promise<void> {
  loading.value = true
  loadError.value = ''
  const params = {
    startDate: filters.start || undefined,
    endDate: filters.end || undefined,
    region: filters.region || undefined,
    pollutionType: filters.pollution || undefined,
    reportType: quickReport.value,
  }
  try {
    const result = await problemApi.getList({ page: 1, pageSize: 1000 })
    allProblems.value = result.list
    reportProblems.value = result.list.filter((item) => {
      if (params.startDate && item.createdAt < params.startDate) return false
      if (params.endDate && item.createdAt > params.endDate) return false
      if (params.region && item.regionName !== params.region) return false
      if (params.pollutionType && item.pollutionType !== params.pollutionType) return false
      return true
    })
    const rows = reportProblems.value
    overview.value = {
      total: rows.length,
      pending: rows.filter((item) => item.status === 'pending').length,
      inProgress: rows.filter((item) => item.status === 'inProgress').length,
      verify: rows.filter((item) => item.status === 'verify').length,
      closed: rows.filter((item) => item.status === 'closed').length,
      overdue: rows.filter((item) => item.warningLevel === 'red' || item.warningLevel === 'orange')
        .length,
    }
    appliedFilters.value = {
      start: params.startDate ?? '',
      end: params.endDate ?? '',
      region: params.region ?? '',
      pollution: params.pollutionType ?? '',
    }
    tablePage.value = 1

    const monthlyCounts = new Map<string, number>()
    rows.forEach((item) => {
      const month = item.createdAt.slice(0, 7)
      if (month) monthlyCounts.set(month, (monthlyCounts.get(month) ?? 0) + 1)
    })
    const trendMonths = [...monthlyCounts.keys()].sort()
    setTrendOption({
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>问题数量：{c} 条',
        backgroundColor: 'rgba(13, 59, 26, 0.92)',
        borderWidth: 0,
        textStyle: { color: '#fff' },
      },
      grid: { left: 48, right: 24, top: 30, bottom: 38 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendMonths,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#dfe5df' } },
        axisLabel: { color: '#66736a', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: '问题数量（条）',
        minInterval: 1,
        nameTextStyle: { color: '#8a938d', fontSize: 10 },
        axisLabel: { color: '#8a938d', fontSize: 10 },
        splitLine: { lineStyle: { color: '#edf1ed', type: 'dashed' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { color: '#176b3a', width: 3 },
          itemStyle: { color: '#176b3a', borderColor: '#fff', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(23, 107, 58, 0.24)' },
                { offset: 1, color: 'rgba(23, 107, 58, 0.02)' },
              ],
            },
          },
          data: trendMonths.map((month) => monthlyCounts.get(month) ?? 0),
        },
      ],
    })

    const levelDefinitions = [
      { key: 'red', name: '红色重大', color: '#e53935' },
      { key: 'orange', name: '橙色重点', color: '#fb8c00' },
      { key: 'green', name: '绿色轻微', color: '#43a047' },
    ] as const
    setLevelOption({
      color: levelDefinitions.map((item) => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c} 条（{d}%）',
        backgroundColor: 'rgba(13, 59, 26, 0.92)',
        borderWidth: 0,
        textStyle: { color: '#fff' },
      },
      legend: {
        orient: 'vertical',
        right: '8%',
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 14,
        textStyle: { color: '#647067', fontSize: 12 },
      },
      graphic: [
        {
          type: 'text',
          left: '27%',
          top: '42%',
          style: {
            text: `${rows.length}\n总问题数`,
            textAlign: 'center',
            fill: '#1a1a2e',
            font: '700 20px Arial',
            lineHeight: 26,
          },
        },
      ],
      series: [
        {
          type: 'pie',
          radius: ['48%', '70%'],
          center: ['30%', '52%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 5 },
          label: { show: false },
          emphasis: { scaleSize: 8 },
          data: levelDefinitions.map((item) => ({
            name: item.name,
            value: rows.filter((row) => row.importantLevel === item.key).length,
          })),
        },
      ],
    })

    const pollutionAxis = params.pollutionType
      ? [...new Set(rows.map((row) => row.regionName))]
      : ['大气', '水污染', '土壤', '固废', '噪声', '生态']
    const pollutionValues = params.pollutionType
      ? pollutionAxis.map((region) => rows.filter((row) => row.regionName === region).length)
      : pollutionTypes.map((type) => rows.filter((row) => row.pollutionType === type).length)
    setPollutionOption({
      color: ['#1a5f2a'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}<br/>问题数量：{c} 条',
        backgroundColor: 'rgba(13, 59, 26, 0.92)',
        borderWidth: 0,
        textStyle: { color: '#fff' },
      },
      grid: { left: 28, right: 18, top: 24, bottom: 32 },
      xAxis: {
        type: 'category',
        data: pollutionAxis,
        axisLine: { lineStyle: { color: '#dfe5df' } },
        axisTick: { show: false },
        axisLabel: { color: '#647067', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: '问题数量（条）',
        nameTextStyle: { color: '#8a938d', fontSize: 10, padding: [0, 0, 4, 0] },
        minInterval: 1,
        splitLine: { lineStyle: { color: '#edf1ed', type: 'dashed' } },
        axisLabel: { color: '#8a938d', fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 34,
          showBackground: true,
          backgroundStyle: { color: '#f0f4f0', borderRadius: [5, 5, 0, 0] },
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 1,
              x2: 0,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#1a5f2a' },
                { offset: 1, color: '#43a047' },
              ],
            },
          },
          label: { show: true, position: 'top', color: '#1a5f2a', fontWeight: 600 },
          data: pollutionValues,
        },
      ],
    })
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '统计数据加载失败，请稍后重试'
    ElMessage.error(loadError.value)
  } finally {
    loading.value = false
  }
}

/** 导出报表（CSV 简化导出） */
function exportReport(): void {
  const rows = [
    ['指标', '数量'],
    ['问题总数', overview.value.total ?? 0],
    ['待交办', overview.value.pending ?? 0],
    ['整改中', overview.value.inProgress ?? 0],
    ['待验收', overview.value.verify ?? 0],
    ['已销号', overview.value.closed ?? 0],
    ['超期问题', overview.value.overdue ?? 0],
  ]
  const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `生态环境问题统计_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('报表已导出')
}

async function applyFilters(): Promise<void> {
  if (filters.start && filters.end && filters.start > filters.end) {
    ElMessage.warning('开始日期不能晚于结束日期')
    return
  }
  await loadData()
  if (!loadError.value) ElMessage.success('统计条件已应用')
}

function resetFilters(): void {
  filters.start = ''
  filters.end = ''
  filters.region = ''
  filters.pollution = ''
  quickReport.value = '月报'
  loadData()
}

function setQuickReport(type: string | number | boolean): void {
  if (typeof type !== 'string') return
  quickReport.value = type
  const end = new Date()
  const start = new Date(end)
  if (type === '月报') start.setMonth(start.getMonth() - 1)
  else if (type === '季报') start.setMonth(start.getMonth() - 3)
  else start.setFullYear(start.getFullYear() - 1)
  filters.start = start.toISOString().slice(0, 10)
  filters.end = end.toISOString().slice(0, 10)
  loadData()
}

function handleSortChange({
  prop,
  order,
}: {
  prop: string | null
  order: 'ascending' | 'descending' | null
}): void {
  sortState.prop = prop ?? ''
  sortState.order = order
  tablePage.value = 1
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.analysis-content {
  min-width: 0;
  padding-bottom: 24px;
}

.page-intro {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: -8px 0 16px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.load-alert,
.filter-panel,
.stat-row,
.analysis-scope,
.trend-panel,
.report-charts {
  margin-bottom: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr)) auto;
  gap: 12px;
  align-items: end;
}

.filter-grid label {
  display: grid;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.filter-grid :deep(.el-date-editor),
.filter-grid :deep(.el-select) {
  width: 100%;
}

.filter-actions {
  display: flex;
}

.quick-reports {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--color-border-light);
  color: var(--color-text-muted);
  font-size: 12px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.analysis-scope {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 13px 16px;
  background: linear-gradient(90deg, #f4f8f5 0%, #fbfdfb 100%);
  border: 1px solid #dfe9e1;
  border-left: 3px solid var(--color-primary);
  border-radius: 8px;
}

.scope-copy {
  display: grid;
  gap: 3px;
}

.scope-copy strong {
  color: var(--color-text);
  font-size: 14px;
}

.scope-copy span,
.scope-tags > span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.scope-tags {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.trend-chart {
  height: 280px;
}

.report-charts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.chart-box {
  height: 300px;
}

.region-panel {
  scroll-margin-top: 72px;
}

.table-count {
  color: var(--color-text-muted);
  font-size: 12px;
}

.region-panel :deep(.panel-content) {
  padding: 0;
}

.region-panel :deep(.el-table th.el-table__cell) {
  color: #315c3c;
  background: #f3f7f3;
}

.rate-cell {
  display: grid;
  grid-template-columns: minmax(64px, 1fr) 38px;
  gap: 8px;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 12px;
}

#overview-section,
#level-section,
#pollution-section {
  scroll-margin-top: 72px;
}

@media (width <= 1200px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }

  .filter-actions {
    grid-column: 1 / -1;
  }

  .stat-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .report-charts {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .page-intro {
    display: grid;
  }

  .analysis-scope {
    align-items: flex-start;
    flex-direction: column;
  }

  .scope-tags {
    justify-content: flex-start;
  }

  .filter-grid,
  .stat-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    display: grid;
    grid-column: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
  }

  .filter-actions :deep(.el-button) {
    width: 100%;
    min-width: 0;
    margin-left: 0;
  }

  .quick-reports {
    align-items: stretch;
    flex-direction: column;
  }

  .quick-reports :deep(.el-segmented) {
    width: 100%;
  }

  .quick-reports :deep(.el-segmented__item) {
    min-width: 0;
    flex: 1;
  }

  .chart-box {
    height: 260px;
  }
}
</style>
