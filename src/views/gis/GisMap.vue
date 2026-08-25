<template>
  <div class="gis-page">
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
        <PageHeader title="空间分析" :crumbs="['空间分析']">
          <template #actions>
            <el-radio-group v-model="levelFilter" size="small" @change="onFilterChange">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="red">红色</el-radio-button>
              <el-radio-button value="orange">橙色</el-radio-button>
              <el-radio-button value="green">绿色</el-radio-button>
            </el-radio-group>
          </template>
        </PageHeader>

        <el-row :gutter="16">
          <el-col :span="16">
            <el-card shadow="never" class="chart-card">
              <template #header
                ><span class="card-title">问题点位分布（经度/纬度散点，红色=重大）</span></template
              >
              <div ref="chartRef" class="chart-box" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="chart-card">
              <template #header><span class="card-title">区域聚合统计</span></template>
              <el-table :data="regionStats" size="small" max-height="420">
                <el-table-column prop="name" label="区县" />
                <el-table-column prop="count" label="问题数" width="80" />
                <el-table-column #default="{ row }" label="红色" width="70">
                  <span class="red-count">{{ row.red }}</span>
                </el-table-column>
                <el-table-column prop="overdue" label="超期" width="70">
                  <template #default="{ row }"
                    ><span :class="row.overdue > 0 ? 'red-count' : ''">{{
                      row.overdue
                    }}</span></template
                  >
                </el-table-column>
              </el-table>
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
import { useUserStore } from '@/stores/user'
import { gisApi } from '@/api'
import { REGIONS } from '@/constants'
import { useECharts } from '@/composables/useECharts'
import PageHeader from '@/components/common/PageHeader.vue'
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

interface GisPoint {
  id: string
  lng: number
  lat: number
  level: 'red' | 'orange' | 'green'
  title: string
}

const route = useRoute()
const userStore = useUserStore()
const activeMenu = computed(() => route.path)

const { chartRef, setOption } = useECharts()
const points = ref<GisPoint[]>([])
const levelFilter = ref('')

const filtered = computed(() =>
  levelFilter.value ? points.value.filter((p) => p.level === levelFilter.value) : points.value,
)

const regionStats = computed(() => {
  const map: Record<string, { name: string; count: number; red: number; overdue: number }> = {}
  REGIONS.forEach((r) => {
    map[r.code] = { name: r.name, count: 0, red: 0, overdue: 0 }
  })
  points.value.forEach((p) => {
    const region = REGIONS.find((r) => p.title.includes(r.name) || p.title.startsWith(r.name))
    const code = region?.code || '451000'
    const entry =
      map[code] || (map[code] = { name: region?.name || '未知', count: 0, red: 0, overdue: 0 })
    entry.count++
    if (p.level === 'red') entry.red++
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
})

function onFilterChange(): void {
  renderChart()
}

function renderChart(): void {
  const list = filtered.value
  setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: { data: GisPoint }) => {
        const d = params.data
        return `${d.title}<br/>坐标：${d.lng.toFixed(4)}, ${d.lat.toFixed(4)}<br/>等级：${d.level === 'red' ? '红色重大' : d.level === 'orange' ? '橙色较大' : '绿色常规'}`
      },
    },
    grid: { left: 60, right: 40, top: 30, bottom: 40 },
    xAxis: { type: 'value', name: '经度', min: 104.5, max: 107.5 },
    yAxis: { type: 'value', name: '纬度', min: 22.8, max: 25.2 },
    series: [
      {
        type: 'scatter',
        symbolSize: 10,
        data: list.map((p) => ({ value: [p.lng, p.lat], ...p })),
        itemStyle: {
          color: (params: { data: GisPoint }) =>
            params.data.level === 'red'
              ? '#E53935'
              : params.data.level === 'orange'
                ? '#FB8C00'
                : '#2B7A4B',
        },
      },
    ],
  })
}

async function loadData(): Promise<void> {
  const data = (await gisApi.getPoints({})) as GisPoint[]
  points.value = data
  renderChart()
}

function openScreen(): void {
  window.open('/screen', '_blank')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.gis-page {
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

.chart-card {
  margin-bottom: 16px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
}
.chart-box {
  width: 100%;
  height: 480px;
}
.red-count {
  color: #e53935;
  font-weight: 600;
}
</style>
