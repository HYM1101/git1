<template>
  <div class="schedule-page">
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
        <PageHeader title="进度调度" :crumbs="['进度管理']">
          <template #actions>
            <el-button :icon="Refresh" @click="loadList">刷新</el-button>
          </template>
        </PageHeader>

        <!-- 统计行 -->
        <div class="stat-row">
          <StatCard label="整改中" :value="statCount.inProgress" color="#00897B" icon="Loading" />
          <StatCard
            label="待验收"
            :value="statCount.verify"
            color="#7B1FA2"
            icon="DocumentChecked"
          />
          <StatCard label="已驳回" :value="statCount.rejected" color="#E53935" icon="CircleClose" />
          <StatCard label="已销号" :value="statCount.closed" color="#43A047" icon="CircleCheck" />
        </div>

        <!-- 状态筛选 -->
        <el-radio-group v-model="statusFilter" class="status-tabs" @change="loadList">
          <el-radio-button value="inProgress">整改中</el-radio-button>
          <el-radio-button value="verify">待验收</el-radio-button>
          <el-radio-button value="rejected">已驳回</el-radio-button>
        </el-radio-group>

        <el-table v-loading="loading" :data="list" stripe>
          <el-table-column prop="problemNo" label="编号" width="130" />
          <el-table-column prop="title" label="问题标题" min-width="220" show-overflow-tooltip />
          <el-table-column
            prop="responsibleUnit"
            label="责任单位"
            width="160"
            show-overflow-tooltip
          />
          <el-table-column #default="{ row }" label="预警" width="120">
            <WarningTag :level="row.warningLevel" />
          </el-table-column>
          <el-table-column #default="{ row }" label="整改进度" min-width="220">
            <PhaseProgress
              :phases="getPhases(row.pollutionType)"
              :completed-indexes="row.completedPhases || []"
            />
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" @click="router.push(`/problem/${row.id}`)"
                >详情</el-button
              >
              <el-button v-if="canFill(row)" text type="primary" @click="openProgress(row)"
                >填报进度</el-button
              >
              <el-button v-if="canSubmit(row)" text type="success" @click="submitVerify(row)"
                >提交验收</el-button
              >
              <el-button
                v-if="canAccept(row)"
                text
                type="success"
                @click="transition(row, 'accept')"
                >验收销号</el-button
              >
              <el-button v-if="canReject(row)" text type="danger" @click="transition(row, 'reject')"
                >驳回</el-button
              >
              <el-button
                v-if="canRework(row)"
                text
                type="warning"
                @click="transition(row, 'rework')"
                >退回整改</el-button
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

    <!-- 进度填报对话框 -->
    <el-dialog
      v-model="progressVisible"
      :title="`填报进度：${currentRow?.problemNo || ''}`"
      width="600px"
    >
      <el-form :model="progressForm" label-width="80px">
        <el-form-item label="整改措施">
          <el-input
            v-model="progressForm.measures"
            type="textarea"
            :rows="3"
            placeholder="整改措施（如：已完成设施改造）"
          />
        </el-form-item>
        <el-form-item label="整改成效">
          <el-input
            v-model="progressForm.effect"
            type="textarea"
            :rows="3"
            placeholder="整改成效（如：排放达标）"
          />
        </el-form-item>
        <el-form-item label="佐证材料">
          <FileUpload v-model:file-list="attachments" :max-size="10 * 1024 * 1024" :limit="5" />
        </el-form-item>
        <el-form-item label="阶段完成">
          <div class="phase-check">
            <el-checkbox
              v-for="(phase, idx) in phasesOfCurrent"
              :key="phase.name"
              :model-value="completedPhases.includes(idx)"
              @update:model-value="togglePhase(idx)"
            >
              {{ phase.name }}（{{ phase.weight }}%）
            </el-checkbox>
          </div>
        </el-form-item>
        <el-form-item label="实时进度">
          <el-progress
            :percentage="liveProgress"
            :color="liveProgress >= 100 ? '#43A047' : liveProgress >= 60 ? '#2B7A4B' : '#FB8C00'"
          />
          <div class="phase-progress-hint">
            阶段完成度（模板权重）：{{ phaseProgress }}%（已勾选 {{ completedPhases.length }}/{{
              phasesOfCurrent.length
            }}
            个阶段）
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProgress">保存进度</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { problemApi, type ProblemQuery } from '@/api/problem'
import { getPhases } from '@/constants/phases'
import { hasPermission } from '@/constants/permissions'
import { canTransition } from '@/utils/status'
import { calcProgress, calcPhaseProgress } from '@/utils/progress'
import type { Problem } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import WarningTag from '@/components/common/WarningTag.vue'
import PhaseProgress from '@/components/common/PhaseProgress.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import FileUpload from '@/components/common/FileUpload.vue'
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
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const loading = ref(false)
const list = ref<Problem[]>([])
const total = ref(0)
const statusFilter = ref<'inProgress' | 'verify' | 'rejected'>('inProgress')

const query = reactive<ProblemQuery>({ page: 1, pageSize: 20, status: 'inProgress' })

const progressVisible = ref(false)
const currentRow = ref<RowLike | null>(null)
const progressForm = reactive<{ measures: string; effect: string }>({ measures: '', effect: '' })
const attachments = ref<{ name: string; size: number; raw?: File }[]>([])
const completedPhases = ref<number[]>([])

/** 统计（按状态计数，从列表接口拉 50 条粗略统计） */
const statCount = ref<Record<string, number>>({ inProgress: 0, verify: 0, rejected: 0, closed: 0 })

const phasesOfCurrent = computed(() =>
  currentRow.value ? getPhases(currentRow.value.pollutionType || '大气') : [],
)

/** 实时进度：三扇区（措施 30 + 成效 30 + 附件 40），与详情页填报口径一致 */
const liveProgress = computed(() =>
  calcProgress({
    measures: progressForm.measures,
    effect: progressForm.effect,
    attachments: attachments.value,
  }),
)

/** 阶段勾选进度（模板权重，仅展示"阶段完成度"辅助信息） */
const phaseProgress = computed(() =>
  calcPhaseProgress(phasesOfCurrent.value, completedPhases.value),
)

/** 切换阶段勾选（数组手动管理，规避 el-checkbox group 类型泛型限制） */
function togglePhase(idx: number): void {
  if (completedPhases.value.includes(idx)) {
    completedPhases.value = completedPhases.value.filter((i) => i !== idx)
  } else {
    completedPhases.value = [...completedPhases.value, idx]
  }
}

async function loadList(): Promise<void> {
  loading.value = true
  try {
    query.status = statusFilter.value
    const result = await problemApi.getList({ ...query })
    list.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

async function loadStats(): Promise<void> {
  const [a, b, c, d] = await Promise.all([
    problemApi.getList({ page: 1, pageSize: 1, status: 'inProgress' }),
    problemApi.getList({ page: 1, pageSize: 1, status: 'verify' }),
    problemApi.getList({ page: 1, pageSize: 1, status: 'rejected' }),
    problemApi.getList({ page: 1, pageSize: 1, status: 'closed' }),
  ])
  statCount.value = { inProgress: a.total, verify: b.total, rejected: c.total, closed: d.total }
}

/** 表格行子集类型（兼容 el-table DefaultRow） */
type RowLike = {
  id: string
  problemNo?: string
  title?: string
  status: Problem['status']
  progress: number
  pollutionType?: string
  completedPhases?: number[]
}

/** 表格行取值辅助（模板 slot row 类型为 DefaultRow，此处统一收窄） */
function rowOf(row: unknown): RowLike {
  return row as RowLike
}

/** 角色权限辅助 */
const canVerify = computed(() => hasPermission(userStore.role, 'verify'))
const canFill = (row: unknown) => {
  const r = rowOf(row)
  return userStore.isResponsible && ['inProgress', 'rejected'].includes(r.status)
}
const canSubmit = (row: unknown) => {
  const r = rowOf(row)
  return userStore.isResponsible && canTransition(r.status, 'submit') && r.progress >= 100
}
const canAccept = (row: unknown) => canVerify.value && canTransition(rowOf(row).status, 'accept')
const canReject = (row: unknown) => canVerify.value && canTransition(rowOf(row).status, 'reject')
const canRework = (row: unknown) => canVerify.value && canTransition(rowOf(row).status, 'rework')

function openProgress(row: unknown): void {
  const r = rowOf(row)
  currentRow.value = rowOf(row)
  progressForm.measures = ''
  progressForm.effect = ''
  attachments.value = []
  completedPhases.value = r.completedPhases ? [...r.completedPhases] : []
  progressVisible.value = true
}

async function saveProgress(): Promise<void> {
  if (!currentRow.value) return
  try {
    await problemApi.submitProgress(currentRow.value.id, {
      measures: progressForm.measures,
      effect: progressForm.effect,
      attachments: attachments.value,
      completedPhases: completedPhases.value,
    })
    progressVisible.value = false
    ElMessage.success('进度已保存')
    loadList()
  } catch {
    ElMessage.error('保存失败')
  }
}

async function submitVerify(row: unknown): Promise<void> {
  await transition(row, 'submit')
}

async function transition(row: unknown, action: string): Promise<void> {
  const r = rowOf(row)
  if (['accept', 'reject', 'rework'].includes(action)) {
    try {
      await ElMessageBox.confirm(`确认执行该操作？`, '操作确认', { type: 'warning' })
    } catch {
      return
    }
  }
  try {
    await problemApi.transition(r.id, action)
    ElMessage.success('操作成功')
    loadList()
  } catch {
    ElMessage.error('操作失败')
  }
}

function openScreen(): void {
  window.open('/screen', '_blank')
}

onMounted(() => {
  loadList()
  loadStats()
})
</script>

<style scoped lang="scss">
.schedule-page {
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.status-tabs {
  margin-bottom: 16px;
}
.phase-check {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.phase-progress-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
