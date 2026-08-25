<template>
  <div class="ledger-page">
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
      <aside class="layout-sidebar">
        <el-menu :default-active="activeMenu" router>
          <el-menu-item index="/workbench">
            <el-icon><HomeFilled /></el-icon><span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/ledger">
            <el-icon><Document /></el-icon><span>问题台账</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin || userStore.isOperator" index="/problem/input">
            <el-icon><EditPen /></el-icon><span>问题录入</span>
          </el-menu-item>
          <el-menu-item index="/schedule">
            <el-icon><Calendar /></el-icon><span>进度管理</span>
          </el-menu-item>
          <el-menu-item index="/warning">
            <el-icon><Warning /></el-icon><span>预警中心</span>
          </el-menu-item>
          <el-menu-item index="/gis">
            <el-icon><MapLocation /></el-icon><span>空间分析</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><DataAnalysis /></el-icon><span>统计分析</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin">
            <el-icon><Setting /></el-icon><span>系统管理</span>
          </el-menu-item>
          <el-menu-item index="/screen" @click.prevent="openScreen">
            <el-icon><Monitor /></el-icon><span>指挥大屏</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <main class="layout-main">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-input
            v-model="problemStore.query.keyword"
            placeholder="搜索问题标题/编号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="problemStore.query.importantLevel"
            placeholder="重要等级"
            clearable
            style="width: 130px"
            @change="handleSearch"
          >
            <el-option label="红色重大" value="red" />
            <el-option label="橙色较大" value="orange" />
            <el-option label="绿色常规" value="green" />
          </el-select>
          <el-select
            v-model="problemStore.query.warningLevel"
            placeholder="预警等级"
            clearable
            style="width: 130px"
            @change="handleSearch"
          >
            <el-option label="红色三级" value="red" />
            <el-option label="橙色二级" value="orange" />
            <el-option label="黄色一级" value="yellow" />
            <el-option label="正常" value="green" />
          </el-select>
          <el-select
            v-model="problemStore.query.status"
            placeholder="状态"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="待交办" value="pending" />
            <el-option label="整改中" value="inProgress" />
            <el-option label="待验收" value="verify" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已销号" value="closed" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 表格 -->
        <el-table
          v-loading="problemStore.loading"
          :data="problemStore.list"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="problemNo" label="编号" width="130" fixed />
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="regionName" label="区域" width="100" />
          <el-table-column prop="pollutionType" label="类型" width="80" />
          <el-table-column prop="source" label="来源" width="120" show-overflow-tooltip />
          <el-table-column #default="{ row }" label="重要等级" width="110">
            <LevelTag :level="row.importantLevel" />
          </el-table-column>
          <el-table-column #default="{ row }" label="预警等级" width="130">
            <WarningTag :level="row.warningLevel" />
          </el-table-column>
          <el-table-column prop="overdueDays" label="超期(天)" width="90" />
          <el-table-column prop="progress" label="进度" width="80">
            <template #default="{ row }">{{ row.progress }}%</template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" @click="router.push(`/problem/${row.id}`)"
                >详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="problemStore.query.page"
            v-model:page-size="problemStore.query.pageSize"
            :total="problemStore.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="problemStore.fetchList()"
            @current-change="problemStore.fetchList()"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProblemStore } from '@/stores/problem'
import LevelTag from '@/components/common/LevelTag.vue'
import WarningTag from '@/components/common/WarningTag.vue'
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

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const problemStore = useProblemStore()

const activeMenu = computed(() => route.path)

function handleSearch(): void {
  problemStore.setPage(1)
  problemStore.fetchList()
}

function handleReset(): void {
  problemStore.resetQuery()
  problemStore.fetchList()
}

function openScreen(): void {
  window.open('/screen', '_blank')
}

async function handleCommand(cmd: string): Promise<void> {
  if (cmd === 'logout') {
    await userStore.logout()
    router.push('/login')
  }
}

onMounted(() => problemStore.fetchList())
</script>

<style scoped lang="scss">
.ledger-page {
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
