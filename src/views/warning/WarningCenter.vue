<template>
  <div class="warning-page">
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
        <PageHeader title="预警中心" :crumbs="['预警中心']">
          <template #actions>
            <el-button :icon="Refresh" @click="loadAll">刷新</el-button>
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

        <!-- 预警清单 -->
        <el-table v-loading="loading" :data="list" stripe>
          <el-table-column prop="problemNo" label="编号" width="130" />
          <el-table-column prop="title" label="问题标题" min-width="220" show-overflow-tooltip />
          <el-table-column #default="{ row }" label="预警等级" width="140">
            <WarningTag :level="row.warningLevel" />
          </el-table-column>
          <el-table-column #default="{ row }" label="超期情况" width="110">
            <OverdueTag :days="row.overdueDays" />
          </el-table-column>
          <el-table-column
            prop="responsibleUnit"
            label="责任单位"
            width="170"
            show-overflow-tooltip
          />
          <el-table-column prop="responsiblePerson" label="责任人" width="90" />
          <el-table-column prop="deadline" label="整改时限" width="120" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" @click="router.push(`/problem/${row.id}`)"
                >详情</el-button
              >
              <el-button v-if="row.warningLevel !== 'yellow'" text type="warning" @click="urge(row)"
                >催办</el-button
              >
              <el-button
                v-if="row.warningLevel === 'red'"
                text
                type="danger"
                @click="supervise(row)"
                >督办</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <PaginationBar
          :page="query.page"
          :page-size="query.pageSize"
          :total="total"
          @update:page="
            (p) => {
              query.page = p
              loadList()
            }
          "
          @update:page-size="
            (s) => {
              query.pageSize = s
              query.page = 1
              loadList()
            }
          "
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { warningApi } from '@/api'
import PageHeader from '@/components/common/PageHeader.vue'
import StatPanel from '@/components/common/StatPanel.vue'
import WarningTag from '@/components/common/WarningTag.vue'
import OverdueTag from '@/components/common/OverdueTag.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
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

interface WarningItem {
  id: string
  problemNo: string
  title: string
  warningLevel: 'red' | 'orange' | 'yellow'
  overdueDays: number
  responsibleUnit?: string
  responsiblePerson?: string
  deadline: string
  status: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const loading = ref(false)
const list = ref<WarningItem[]>([])
const total = ref(0)
const stats = ref<Record<string, number>>({ red: 0, orange: 0, yellow: 0, green: 0 })

const query = reactive({ page: 1, pageSize: 20 })

const topWarning = computed(() => list.value.find((w) => w.warningLevel === 'red'))

async function loadList(): Promise<void> {
  loading.value = true
  try {
    const result = await warningApi.getList({ ...query })
    const data = result as unknown as { list: WarningItem[]; total: number }
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function loadStats(): Promise<void> {
  stats.value = (await warningApi.getStats()) as Record<string, number>
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
  loadStats()
}

function openScreen(): void {
  window.open('/screen', '_blank')
}

onMounted(loadAll)
</script>

<style scoped lang="scss">
.warning-page {
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

.broadcast {
  margin-bottom: 16px;
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
.panel-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #909399;
}
</style>
