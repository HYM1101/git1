<template>
  <div class="app-shell">
    <aside class="layout-sidebar app-shell__sidebar">
      <div class="app-shell__brand">
        <img src="/logo.svg" alt="生态环境问题闭环管理系统" class="app-shell__logo" />
        <span class="title">生态闭环管理</span>
      </div>
      <el-menu :default-active="activeMenu" router>
        <el-menu-item index="/workbench"
          ><el-icon><HomeFilled /></el-icon><span>工作台</span></el-menu-item
        >
        <el-menu-item v-if="userStore.isAdmin || userStore.isOperator" index="/problem/input"
          ><el-icon><EditPen /></el-icon><span>问题录入</span></el-menu-item
        >
        <el-menu-item index="/ledger"
          ><el-icon><Document /></el-icon><span>问题台账</span></el-menu-item
        >
        <el-menu-item index="/files"
          ><el-icon><FolderOpened /></el-icon><span>文件管理</span></el-menu-item
        >
        <el-menu-item index="/schedule"
          ><el-icon><Calendar /></el-icon><span>进度调度</span></el-menu-item
        >
        <el-menu-item v-if="userStore.isAdmin || userStore.isOperator" index="/warning"
          ><el-icon><Warning /></el-icon><span>预警清单</span></el-menu-item
        >
        <el-menu-item index="/gis"
          ><el-icon><MapLocation /></el-icon><span>GIS一张图</span></el-menu-item
        >
        <el-menu-item v-if="userStore.isAdmin || userStore.isOperator" index="/analysis"
          ><el-icon><DataAnalysis /></el-icon><span>统计分析</span></el-menu-item
        >
        <el-menu-item v-if="userStore.isAdmin" index="/admin"
          ><el-icon><Setting /></el-icon><span>系统管理</span></el-menu-item
        >
      </el-menu>
      <div class="app-shell__version">生态环境问题闭环管理系统 v3.0</div>
    </aside>

    <div class="app-shell__body">
      <header class="layout-header app-shell__header">
        <div class="app-shell__breadcrumb">
          首页 / <span>{{ currentPageName }}</span>
        </div>
        <div class="app-shell__actions">
          <button class="screen-entry" type="button" @click="openScreen">
            <el-icon><Monitor /></el-icon>指挥大屏
          </button>
          <button class="app-shell__notice" type="button" aria-label="查看通知">
            <el-icon><Bell /></el-icon><span>3条未读</span><i />
          </button>
          <span class="app-shell__avatar">{{ roleName.slice(0, 1) }}</span>
          <span class="app-shell__identity"
            >{{ roleName }}<small>{{ roleName }}</small></span
          >
          <button class="logout-entry" type="button" @click="handleCommand('logout')">
            <el-icon><SwitchButton /></el-icon>退出
          </button>
        </div>
      </header>
      <main class="layout-main app-shell__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Bell,
  Calendar,
  DataAnalysis,
  Document,
  EditPen,
  FolderOpened,
  HomeFilled,
  MapLocation,
  Monitor,
  Setting,
  SwitchButton,
  Warning,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const activeMenu = computed(() => route.path)
const pageNames: Record<string, string> = {
  '/workbench': '工作台',
  '/ledger': '问题台账管理',
  '/files': '文件管理',
  '/problem/input': '问题录入',
  '/schedule': '进度调度',
  '/warning': '预警清单处置',
  '/gis': 'GIS一张图',
  '/analysis': '统计分析报表',
  '/admin': '系统管理',
}
const currentPageName = computed(() =>
  route.path.startsWith('/problem/') && route.path !== '/problem/input'
    ? '问题详情'
    : (pageNames[route.path] ?? '生态环境管理'),
)
const roleName = computed(() => {
  if (userStore.isAdmin) return '管理员'
  if (userStore.isOperator) return '科室人员'
  return '整改责任人'
})

function openScreen(): void {
  const screenUrl = import.meta.env.VITE_SCREEN_URL || '/screen/'
  window.open(screenUrl, '_blank', 'noopener,noreferrer')
}

async function handleCommand(command: string): Promise<void> {
  if (command !== 'logout') return
  await userStore.logout()
  await router.push('/login')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.app-shell {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-shell__header {
  display: flex;
  flex: 0 0 $layout-header-h;
  align-items: center;
  justify-content: space-between;
  height: $layout-header-h;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid $border-base;
}

.app-shell__actions,
.app-shell__brand {
  display: flex;
  align-items: center;
}

.app-shell__brand {
  height: $layout-header-h;
  padding: 0 20px;
  gap: 10px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}

.app-shell__logo {
  width: 32px;
  height: 32px;
  border-radius: 0;
  flex-shrink: 0;
}

.title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.app-shell__actions {
  gap: 16px;
}

.app-shell__breadcrumb {
  color: $color-text-secondary;
  font-size: 13px;

  span {
    color: $color-text-primary;
  }
}

.screen-entry,
.logout-entry,
.app-shell__notice {
  display: flex;
  gap: 5px;
  align-items: center;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
}

.screen-entry {
  padding: 7px 12px;
  color: $color-primary;
  border: 1px solid #c8ddcc;
  border-radius: 8px;
}

.app-shell__notice {
  position: relative;
  padding: 0;
  color: $color-text-secondary;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: $radius-sm;

  i {
    width: 6px;
    height: 6px;
    background: #e53935;
    border-radius: 50%;
  }
}

.app-shell__notice:hover,
.app-shell__notice:focus-visible {
  color: $color-primary;
  background: $bg-hover;
  outline: 2px solid rgb(26 95 42 / 20%);
  outline-offset: 1px;
}

.app-shell__avatar {
  display: grid;
  width: 30px;
  height: 30px;
  color: #fff;
  font-size: 12px;
  background: $color-primary;
  border-radius: 50%;
  place-items: center;
}

.app-shell__identity {
  display: grid;
  color: $color-text-primary;
  font-size: 12px;

  small {
    color: $color-text-secondary;
    font-size: 11px;
  }
}

.logout-entry {
  padding: 0 0 0 16px;
  color: $color-text-secondary;
  border: 0;
  border-left: 1px solid $border-base;
}

.app-shell__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.app-shell__sidebar {
  flex: 0 0 $layout-sidebar-w;
  width: $layout-sidebar-w;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow-y: auto;
}

.app-shell__sidebar :deep(.el-menu-item) {
  height: 46px;
  padding: 0 20px !important;
}

.app-shell__sidebar :deep(.el-menu) {
  flex: 1;
  padding-top: 12px;
}

.app-shell__version {
  padding: 14px 20px;
  color: rgb(255 255 255 / 45%);
  font-size: 10px;
}

.app-shell__main {
  flex: 1;
  min-width: 0;
  padding: 20px 24px 24px;
  overflow: auto;
  background: $bg-page;
}

@media (width <= 1439px) {
  .app-shell__main {
    padding: 20px;
  }
}
</style>
