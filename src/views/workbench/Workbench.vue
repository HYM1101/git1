<template>
  <div class="workbench">
    <!-- 顶部导航 -->
    <header class="layout-header">
      <div class="header-left">
        <img src="/favicon.svg" alt="logo" class="logo" />
        <span class="title">生态环境问题闭环管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><UserFilled /></el-icon>
            {{ userStore.displayName }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="layout-body">
      <!-- 侧边导航 -->
      <aside class="layout-sidebar">
        <el-menu :default-active="activeMenu" router>
          <el-menu-item index="/workbench">
            <el-icon><HomeFilled /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/ledger">
            <el-icon><Document /></el-icon>
            <span>问题台账</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin || userStore.isOperator" index="/problem/input">
            <el-icon><EditPen /></el-icon>
            <span>问题录入</span>
          </el-menu-item>
          <el-menu-item index="/schedule">
            <el-icon><Calendar /></el-icon>
            <span>进度管理</span>
          </el-menu-item>
          <el-menu-item index="/warning">
            <el-icon><Warning /></el-icon>
            <span>预警中心</span>
          </el-menu-item>
          <el-menu-item index="/gis">
            <el-icon><MapLocation /></el-icon>
            <span>空间分析</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><DataAnalysis /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin">
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </el-menu-item>
          <!-- 大屏跳转 -->
          <el-menu-item index="/screen" @click.prevent="openScreen">
            <el-icon><Monitor /></el-icon>
            <span>指挥大屏</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 主内容区 -->
      <main class="layout-main">
        <!-- 统计卡片 -->
        <div class="stat-row">
          <div v-for="card in statCards" :key="card.label" class="stat-card">
            <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>

        <!-- 待办列表 -->
        <div class="section">
          <div class="section-header">
            <h2>待办问题</h2>
            <el-button text type="primary" @click="router.push('/ledger')">查看全部</el-button>
          </div>
          <el-table v-loading="loading" :data="todoList" stripe style="width: 100%">
            <el-table-column prop="problemNo" label="编号" width="130" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="regionName" label="区域" width="100" />
            <el-table-column #default="{ row }" label="重要等级" width="110">
              <LevelTag :level="row.importantLevel" />
            </el-table-column>
            <el-table-column #default="{ row }" label="预警等级" width="130">
              <WarningTag :level="row.warningLevel" />
            </el-table-column>
            <el-table-column prop="overdueDays" label="超期(天)" width="90" />
            <el-table-column #default="{ row }" label="操作" width="100">
              <el-button text type="primary" @click="router.push(`/problem/${row.id}`)"
                >详情</el-button
              >
            </el-table-column>
          </el-table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { problemApi } from '@/api/problem'
import LevelTag from '@/components/common/LevelTag.vue'
import WarningTag from '@/components/common/WarningTag.vue'
import type { Problem } from '@/types'
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
  ArrowDown,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const todoList = ref<Problem[]>([])
const overview = ref<Record<string, number>>({})

const activeMenu = computed(() => route.path)

const statCards = computed(() => [
  { label: '问题总数', value: overview.value.total ?? 0, color: '#303133' },
  { label: '待交办', value: overview.value.pending ?? 0, color: '#fb8c00' },
  { label: '整改中', value: overview.value.inProgress ?? 0, color: '#00897b' },
  { label: '待验收', value: overview.value.verify ?? 0, color: '#7b1fa2' },
  { label: '已销号', value: overview.value.closed ?? 0, color: '#43a047' },
  { label: '超期问题', value: overview.value.overdue ?? 0, color: '#e53935' },
])

async function loadData(): Promise<void> {
  loading.value = true
  try {
    const [overviewRes, problemRes] = await Promise.all([
      import('@/api').then((m) => m.analysisApi.getOverview()),
      problemApi.getList({ page: 1, pageSize: 10, status: 'inProgress' }),
    ])
    overview.value = overviewRes
    todoList.value = problemRes.list
  } finally {
    loading.value = false
  }
}

function openScreen(): void {
  // 同域部署，跳转大屏（React 独立工程，部署在 /screen）
  window.open('/screen', '_blank')
}

async function handleCommand(cmd: string): Promise<void> {
  if (cmd === 'logout') {
    await userStore.logout()
    router.push('/login')
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.workbench {
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
      color: #303133;
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
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.08);

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-label {
    margin-top: 4px;
    font-size: 13px;
    color: #909399;
  }
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.08);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h2 {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
