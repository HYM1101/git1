<template>
  <AppShell>
    <section class="admin-content">
      <PageHeader title="系统管理" :crumbs="[]"
        ><template #actions
          ><el-button :loading="exporting" @click="exportUsers">导出用户</el-button></template
        ></PageHeader
      >

      <el-tabs v-model="activeTab" class="admin-tabs">
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
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { ROLES, ROLE_LABELS, OPERATION_PERMISSIONS } from '@/constants/permissions'
import { LEVEL_MATRIX } from '@/utils/level'
import type { Role } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import LevelTag from '@/components/common/LevelTag.vue'
import AppShell from '@/layouts/AppShell.vue'

const activeTab = ref('users')
const exporting = ref(false)

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
    username: 'kehu',
    realName: '科室人员',
    role: ROLES.OPERATOR,
    dept: '右江区生态环境局',
    regionName: '右江区',
  },
  {
    username: 'handler',
    realName: '整改责任人',
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

function exportUsers(): void {
  if (exporting.value) return
  exporting.value = true
  try {
    const csv =
      '\uFEFF' +
      [
        ['账号', '姓名', '角色', '单位', '管辖区域'],
        ...users.map((user) => [
          user.username,
          user.realName,
          ROLE_LABELS[user.role],
          user.dept,
          user.regionName || '全市',
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = '系统用户.csv'
    anchor.click()
    URL.revokeObjectURL(url)
    ElMessage.success('用户数据已导出')
  } catch {
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped lang="scss">
.admin-content {
  min-width: 0;
}

.admin-tabs {
  padding: 0 20px 20px;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.matrix-alert {
  margin-top: 16px;
}
</style>
