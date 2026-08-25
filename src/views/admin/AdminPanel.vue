<template>
  <div class="admin-page">
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
          <el-menu-item index="/admin"
            ><el-icon><Setting /></el-icon><span>系统管理</span></el-menu-item
          >
          <el-menu-item index="/screen" @click.prevent="openScreen"
            ><el-icon><Monitor /></el-icon><span>指挥大屏</span></el-menu-item
          >
        </el-menu>
      </aside>

      <main class="layout-main">
        <PageHeader title="系统管理" :crumbs="['系统管理']" />

        <el-tabs v-model="activeTab">
          <!-- 用户与角色 -->
          <el-tab-pane label="用户与角色" name="users">
            <el-card shadow="never">
              <el-table :data="users" stripe>
                <el-table-column prop="username" label="账号" width="120" />
                <el-table-column prop="realName" label="姓名" width="120" />
                <el-table-column label="角色" width="130">
                  <template #default="{ row }">
                    <el-tag :type="roleTagType(row.role as Role)">{{
                      ROLE_LABELS[row.role as Role]
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="dept" label="单位" min-width="180" />
                <el-table-column prop="regionName" label="管辖区域" width="120">
                  <template #default="{ row }">{{ row.regionName || '全市' }}</template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-tab-pane>

          <!-- 权限矩阵 -->
          <el-tab-pane label="权限矩阵" name="perms">
            <el-card shadow="never">
              <el-table :data="permRows" stripe border>
                <el-table-column prop="role" label="角色" width="140" />
                <el-table-column label="查看" width="80" align="center">
                  <template #default="{ row }"
                    ><el-icon v-if="row.perms.includes('view')" color="#43A047"><Check /></el-icon
                  ></template>
                </el-table-column>
                <el-table-column label="录入" width="80" align="center">
                  <template #default="{ row }"
                    ><el-icon v-if="row.perms.includes('add')" color="#43A047"><Check /></el-icon
                  ></template>
                </el-table-column>
                <el-table-column label="编辑" width="80" align="center">
                  <template #default="{ row }"
                    ><el-icon v-if="row.perms.includes('edit')" color="#43A047"><Check /></el-icon
                  ></template>
                </el-table-column>
                <el-table-column label="验收" width="80" align="center">
                  <template #default="{ row }"
                    ><el-icon v-if="row.perms.includes('verify')" color="#43A047"><Check /></el-icon
                  ></template>
                </el-table-column>
                <el-table-column label="导出" width="80" align="center">
                  <template #default="{ row }"
                    ><el-icon v-if="row.perms.includes('export')" color="#43A047"><Check /></el-icon
                  ></template>
                </el-table-column>
                <el-table-column label="系统管理" width="100" align="center">
                  <template #default="{ row }"
                    ><el-icon v-if="row.perms.includes('system')" color="#43A047"><Check /></el-icon
                  ></template>
                </el-table-column>
                <el-table-column prop="desc" label="职责说明" />
              </el-table>
            </el-card>
          </el-tab-pane>

          <!-- 定级矩阵 -->
          <el-tab-pane label="3×3 定级矩阵" name="matrix">
            <el-card shadow="never">
              <template #header>
                <span class="card-title">重要等级判定矩阵（来源等级 × 风险等级 → 红/橙/绿）</span>
              </template>
              <el-table :data="matrixRows" stripe border>
                <el-table-column prop="source" label="来源 \\ 风险" width="140" align="center" />
                <el-table-column label="高" align="center">
                  <template #default="{ row }"><LevelTag :level="row.levels[0]" /></template>
                </el-table-column>
                <el-table-column label="中" align="center">
                  <template #default="{ row }"><LevelTag :level="row.levels[1]" /></template>
                </el-table-column>
                <el-table-column label="低" align="center">
                  <template #default="{ row }"><LevelTag :level="row.levels[2]" /></template>
                </el-table-column>
              </el-table>
              <el-alert
                class="matrix-alert"
                type="info"
                :closable="false"
                title="依据：《广西涉重金属…8个风险等级判定方案（试行）》"
                description="来源等级按来源层级映射（中央/省级→高、市级→中、县级→低）；风险等级按问题类别/污染类型/风险标签推断。矩阵判定为静态三色，无分数无权重，支持人工上调（仅上调，留痕）。"
              />
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ROLES, ROLE_LABELS, OPERATION_PERMISSIONS } from '@/constants/permissions'
import { LEVEL_MATRIX } from '@/utils/level'
import type { Role } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import LevelTag from '@/components/common/LevelTag.vue'
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
const activeTab = ref('users')

/** Mock 用户列表（与 mock/problemData 对齐） */
const users = [
  {
    username: 'admin',
    realName: '系统管理员',
    role: ROLES.ADMIN,
    dept: '百色市生态环境局',
    regionName: '',
  },
  {
    username: 'operator',
    realName: '李运维',
    role: ROLES.OPERATOR,
    dept: '右江区生态环境局',
    regionName: '右江区',
  },
  {
    username: 'resp',
    realName: '张责任',
    role: ROLES.RESPONSIBLE,
    dept: '田阳区综合执法大队',
    regionName: '田阳区',
  },
]

const roleDesc: Record<Role, string> = {
  admin: '系统管理、数据统计、全部操作',
  operator: '问题录入 + 审核下发 + 验收销号 + 导出',
  responsible: '接收任务 + 填报进度 + 上传佐证（仅本县区数据）',
}

const permRows = (Object.keys(OPERATION_PERMISSIONS) as Role[]).map((role) => ({
  role: ROLE_LABELS[role],
  perms: OPERATION_PERMISSIONS[role],
  desc: roleDesc[role],
}))

/** 3×3 矩阵展示（行=来源等级） */
const matrixRows = (['高', '中', '低'] as const).map((source) => ({
  source: `来源 ${source}`,
  levels: ['高', '中', '低'].map((risk) => LEVEL_MATRIX[source][risk as '高' | '中' | '低']),
}))

function roleTagType(role: Role): 'danger' | 'warning' | 'success' {
  return role === ROLES.ADMIN ? 'danger' : role === ROLES.OPERATOR ? 'warning' : 'success'
}

function openScreen(): void {
  window.open('/screen', '_blank')
}
</script>

<style scoped lang="scss">
.admin-page {
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

.card-title {
  font-size: 15px;
  font-weight: 600;
}
.matrix-alert {
  margin-top: 16px;
}
</style>
