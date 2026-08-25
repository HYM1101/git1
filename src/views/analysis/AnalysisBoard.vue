<template>
  <div class="analysis-page">
    <header class="layout-header">
      <div class="header-left">
        <img src="/favicon.svg" alt="logo" class="logo" /><span class="title"
          >生态环境问题闭环管理系统</span
        >
      </div>
      <div class="header-right">
        <span class="user-info"
          ><el-icon><UserFilled /></el-icon>{{ userStore.displayName }}</span
        >
      </div>
    </header>
    <div class="layout-body">
      <aside class="layout-sidebar">
        <el-menu :default-active="activeMenu" router>
          <el-menu-item index="/workbench"
            ><el-icon><HomeFilled /></el-icon><span>工作台</span></el-menu-item
          >
          <el-menu-item index="/ledger"
            ><el-icon><Document /></el-icon><span>问题台账</span></el-menu-item
          >
          <el-menu-item v-if="userStore.isAdmin || userStore.isOperator" index="/problem/input"
            ><el-icon><EditPen /></el-icon><span>问题录入</span></el-menu-item
          >
          <el-menu-item index="/schedule"
            ><el-icon><Calendar /></el-icon><span>进度管理</span></el-menu-item
          >
          <el-menu-item index="/warning"
            ><el-icon><Warning /></el-icon><span>预警中心</span></el-menu-item
          >
          <el-menu-item index="/gis"
            ><el-icon><MapLocation /></el-icon><span>空间分析</span></el-menu-item
          >
          <el-menu-item index="/analysis"
            ><el-icon><DataAnalysis /></el-icon><span>统计分析</span></el-menu-item
          >
          <el-menu-item v-if="userStore.isAdmin" index="/admin"
            ><el-icon><Setting /></el-icon><span>系统管理</span></el-menu-item
          >
          <el-menu-item index="/screen" @click.prevent="openScreen"
            ><el-icon><Monitor /></el-icon><span>指挥大屏</span></el-menu-item
          >
        </el-menu>
      </aside>

      <main class="layout-main">
        <PageHeader title="统计分析" :crumbs="['统计分析']">
          <template #actions>
            <el-button :icon="Download" @click="exportReport">导出报表</el-button>
          </template>
        </PageHeader>

        <!-- 概览指标 -->
        <div class="stat-row">
          <StatCard label="问题总数" :value="overview.total ?? 0" color="#303133" icon="Files" />
          <StatCard label="待交办" :value="overview.pending ?? 0" color="#FB8C00" icon="Clock" />
          <StatCard
            label="整改中"
            :value="overview.inProgress ?? 0"
            color="#00897B"
            icon="Loading"
          />
          <StatCard
            label="待验收"
            :value="overview.verify ?? 0"
            color="#7B1FA2"
            icon="DocumentChecked"
          />
          <StatCard
            label="已销号"
            :value="overview.closed ?? 0"
            color="#43A047"
            icon="CircleCheck"
          />
          <StatCard
            label="超期"
            :value="overview.overdue ?? 0"
            color="#E53935"
            icon="WarningFilled"
          />
        </div>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-card shadow="never" class="chart-card">
              <template #header><span class="card-title">重要等级分布</span></template>
              <div ref="levelChartRef" class="chart-box" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="chart-card">
              <template #header><span class="card-title">预警等级分布</span></template>
              <div ref="warningChartRef" class="chart-box" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="chart-card">
              <template #header><span class="card-title">区域问题排名</span></template>
              <div ref="rankChartRef" class="chart-box" />
            </el-card>
          </el-col>
        </el-row>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { analysisApi } from '@/api'
import { useECharts } from '@/composables/useECharts'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import {
  HomeFilled,
  Document,
  EditPen,
  Calendar,
  Warning,
  MapLocation,
  DataAnalysis,
  Setting,
  Monitor,
  UserFilled,
} from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()
const activeMenu = computed(() => route.path)

const overview = ref<Record<string, number>>({})

const { chartRef: levelChartRef, setOption: setLevelOption } = useECharts()
const { chartRef: warningChartRef, setOption: setWarningOption } = useECharts()
const { chartRef: rankChartRef, setOption: setRankOption } = useECharts()

async function loadData(): Promise<void> {
  const [ov, level, warning, rank] = await Promise.all([
    analysisApi.getOverview(),
    analysisApi.getLevelDistribution(),
    analysisApi.getWarningDistribution(),
    analysisApi.getRank(),
  ])
  overview.value = ov as Record<string, number>

  // 重要等级分布（饼图）
  const levelData = level as Record<string, number>
  setLevelOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        label: { formatter: '{b}: {c} 项' },
        data: [
          { name: '红色重大', value: levelData.red ?? 0, itemStyle: { color: '#E53935' } },
          { name: '橙色较大', value: levelData.orange ?? 0, itemStyle: { color: '#FB8C00' } },
          { name: '绿色常规', value: levelData.green ?? 0, itemStyle: { color: '#43A047' } },
        ],
      },
    ],
  })

  // 预警等级分布（柱状图）
  const warningData = warning as Record<string, number>
  setWarningOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['红色三级', '橙色二级', '黄色一级', '正常'] },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        barWidth: 36,
        data: [
          { value: warningData.red ?? 0, itemStyle: { color: '#E53935' } },
          { value: warningData.orange ?? 0, itemStyle: { color: '#FB8C00' } },
          { value: warningData.yellow ?? 0, itemStyle: { color: '#FDD835' } },
          { value: warningData.green ?? 0, itemStyle: { color: '#43A047' } },
        ],
      },
    ],
  })

  // 区域排名（横向条形图）
  const rankData = rank as unknown as { name: string; value: number }[]
  const sorted = [...rankData].sort((a, b) => b.value - a.value).slice(0, 10)
  setRankOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 70, right: 30, top: 10, bottom: 30 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: sorted.map((r) => r.name) },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        itemStyle: { color: '#2B7A4B', borderRadius: [0, 4, 4, 0] },
        data: sorted.map((r) => r.value),
      },
    ],
  })
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

function openScreen(): void {
  window.open('/screen', '_blank')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.analysis-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  .logo {
    width: 28px;
    height: 28px;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
  }
}
.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
}
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.layout-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
  overflow-y: auto;
}
.layout-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.chart-card {
  margin-bottom: 16px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
}
.chart-box {
  width: 100%;
  height: 340px;
}
</style>
