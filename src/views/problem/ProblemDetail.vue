<template>
  <div class="problem-detail-page">
    <header class="layout-header">
      <div class="header-left">
        <img src="/favicon.svg" alt="logo" class="logo" />
        <span class="title">生态环境问题闭环管理系统</span>
      </div>
      <div class="header-right">
        <span class="user-info">
          <el-icon><UserFilled /></el-icon>
          {{ userStore.displayName }}（{{ ROLE_LABELS[userStore.role || 'admin'] }}）
        </span>
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

      <main v-loading="loading" class="layout-main">
        <template v-if="detail">
          <!-- 页头 -->
          <PageHeader :title="detail.title" :crumbs="['问题台账', '问题详情']">
            <template #actions>
              <el-button :icon="ArrowLeft" @click="router.push('/ledger')">返回台账</el-button>
            </template>
          </PageHeader>

          <!-- 标签区 -->
          <el-card class="section-card" shadow="never">
            <div class="tag-row">
              <span class="problem-no">{{ detail.problemNo }}</span>
              <LevelBadge :level="detail.importantLevel" sub-label="重要等级（矩阵判定）" />
              <WarningTag :level="detail.warningLevel" />
              <StatusTag :status="detail.status" />
              <OverdueTag :days="detail.overdueDays" />
            </div>
            <div class="tag-row">
              <RiskTagList :tags="detail.riskTags" />
            </div>
          </el-card>

          <!-- 操作区（按角色 + 状态机） -->
          <el-card v-if="actionButtons.length" class="section-card" shadow="never">
            <div class="action-row">
              <span class="action-label">操作：</span>
              <el-button
                v-for="btn in actionButtons"
                :key="btn.action"
                :type="btn.type"
                :disabled="btn.disabled"
                @click="handleAction(btn.action)"
              >
                {{ btn.label }}
              </el-button>
            </div>
          </el-card>

          <!-- 双标签 + 详情 -->
          <el-card class="section-card" shadow="never">
            <template #header><span class="card-title">基本信息</span></template>
            <DetailItem :items="detailItems">
              <template #category>{{ detail.category || '—' }}</template>
              <template #lnglat>{{
                detail.lng ? `${detail.lng.toFixed(4)}, ${detail.lat?.toFixed(4)}` : '—'
              }}</template>
              <template #deadline>{{ detail.deadline }}</template>
            </DetailItem>
          </el-card>

          <!-- 阶段进度 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="flex-between">
                <span class="card-title">整改进度</span>
                <span class="progress-percent">{{ detail.progress }}%</span>
              </div>
            </template>
            <PhaseProgress
              :phases="getPhases(detail.pollutionType)"
              :completed-indexes="detail.completedPhases || []"
            />
            <div class="phase-hint">
              阶段模板按污染类型（{{ detail.pollutionType }}）自动匹配，权重合计 100
            </div>
          </el-card>

          <!-- 时间线 -->
          <el-card class="section-card" shadow="never">
            <template #header><span class="card-title">生命周期</span></template>
            <TimelineList :items="detail.timeline || []" />
          </el-card>
        </template>
      </main>
    </div>

    <!-- 进度填报对话框 -->
    <el-dialog v-model="progressVisible" title="填报整改进度" width="560px">
      <el-form :model="progressForm" label-width="80px">
        <el-form-item label="整改措施">
          <el-input
            v-model="progressForm.measures"
            type="textarea"
            :rows="3"
            placeholder="描述已采取的整改措施"
          />
        </el-form-item>
        <el-form-item label="整改成效">
          <el-input
            v-model="progressForm.effect"
            type="textarea"
            :rows="3"
            placeholder="描述当前整改成效（监测数据/现场照片说明）"
          />
        </el-form-item>
        <el-form-item label="佐证材料">
          <FileUpload v-model:file-list="attachments" :max-size="10 * 1024 * 1024" :limit="5" />
        </el-form-item>
        <el-form-item label="当前进度">
          <el-progress
            :percentage="liveProgress"
            :color="liveProgress >= 100 ? '#43A047' : liveProgress >= 60 ? '#2B7A4B' : '#FB8C00'"
          />
          <div class="progress-hint">按 30（措施）/ 30（成效）/ 40（佐证）三扇区自动计算</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button type="primary" :disabled="liveProgress < 100" @click="submitProgress"
          >提交验收申请</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { problemApi } from '@/api/problem'
import { getPhases } from '@/constants/phases'
import { ROLE_LABELS, hasPermission } from '@/constants/permissions'
import { canTransition } from '@/utils/status'
import { calcProgress } from '@/utils/progress'
import type { Problem } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import LevelBadge from '@/components/common/LevelBadge.vue'
import WarningTag from '@/components/common/WarningTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import OverdueTag from '@/components/common/OverdueTag.vue'
import RiskTagList from '@/components/common/RiskTagList.vue'
import DetailItem from '@/components/common/DetailItem.vue'
import PhaseProgress from '@/components/common/PhaseProgress.vue'
import TimelineList from '@/components/common/TimelineList.vue'
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

const loading = ref(false)
const detail = ref<Problem | null>(null)
const progressVisible = ref(false)
const progressForm = reactive<{ measures: string; effect: string }>({ measures: '', effect: '' })
const attachments = ref<{ name: string; size: number; raw?: File }[]>([])

const activeMenu = computed(() => route.path)

/** 实时进度（三扇区） */
const liveProgress = computed(() =>
  calcProgress({
    measures: progressForm.measures,
    effect: progressForm.effect,
    attachments: attachments.value,
  }),
)

const detailItems = computed(() => {
  const d = detail.value
  if (!d) return []
  return [
    { key: 'category', label: '问题类别', value: d.category },
    { key: 'source', label: '问题来源', value: d.source },
    { key: 'regionName', label: '所属区域', value: d.regionName },
    { key: 'pollutionType', label: '污染类型', value: d.pollutionType },
    { key: 'responsibleUnit', label: '责任单位', value: d.responsibleUnit || '—' },
    { key: 'responsiblePerson', label: '责任人', value: d.responsiblePerson || '—' },
    { key: 'deadline', label: '整改时限', value: d.deadline },
    { key: 'lnglat', label: '坐标', value: '' },
    { key: 'createdAt', label: '录入时间', value: d.createdAt },
    { key: 'sourceGrade', label: '来源等级', value: d.sourceGrade || '—' },
    { key: 'riskGrade', label: '风险等级', value: d.riskGrade || '—' },
    { key: 'importantLevel', label: '重要等级', value: '' },
  ]
})

/** 可用操作按钮（按角色权限 + 状态机可流转性） */
const actionButtons = computed(() => {
  if (!detail.value) return []
  const d = detail.value
  const role = userStore.role
  const btns: {
    action: string
    label: string
    type: 'primary' | 'success' | 'danger' | 'warning'
    disabled: boolean
  }[] = []

  const can = (action: string) => canTransition(d.status, action as never)

  if (hasPermission(role, 'verify')) {
    if (can('assign'))
      btns.push({ action: 'assign', label: '下发整改', type: 'primary', disabled: false })
    if (can('accept'))
      btns.push({ action: 'accept', label: '验收销号', type: 'success', disabled: false })
    if (can('reject'))
      btns.push({ action: 'reject', label: '验收驳回', type: 'danger', disabled: false })
    if (can('rework'))
      btns.push({ action: 'rework', label: '退回整改', type: 'warning', disabled: false })
  }
  if (hasPermission(role, 'edit') && role === 'responsible') {
    if (can('submit') || d.status === 'inProgress') {
      btns.push({ action: 'progress', label: '填报进度', type: 'primary', disabled: false })
    }
    if (can('submit')) {
      btns.push({
        action: 'submit',
        label: '提交验收',
        type: 'success',
        disabled: d.progress < 100,
      })
    }
  }
  return btns
})

async function handleAction(action: string): Promise<void> {
  if (action === 'progress') {
    progressVisible.value = true
    return
  }
  if (action === 'accept' || action === 'reject' || action === 'assign') {
    try {
      await ElMessageBox.confirm(
        `确认执行「${actionButtons.value.find((b) => b.action === action)?.label || action}」操作？`,
        '操作确认',
        { type: 'warning' },
      )
    } catch {
      return
    }
  }
  await doTransition(action)
}

async function doTransition(action: string): Promise<void> {
  try {
    detail.value = await problemApi.transition(detail.value!.id, action)
    ElMessage.success('操作成功')
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

async function submitProgress(): Promise<void> {
  try {
    detail.value = await problemApi.submitProgress(detail.value!.id, {
      measures: progressForm.measures,
      effect: progressForm.effect,
      attachments: attachments.value,
    })
    // 提交验收申请
    detail.value = await problemApi.transition(detail.value.id, 'submit')
    progressVisible.value = false
    progressForm.measures = ''
    progressForm.effect = ''
    attachments.value = []
    ElMessage.success('已提交验收申请')
  } catch {
    ElMessage.error('提交失败，请重试')
  }
}

function openScreen(): void {
  window.open('/screen', '_blank')
}

async function loadDetail(): Promise<void> {
  loading.value = true
  try {
    const id = route.params.id as string
    detail.value = await problemApi.getDetail(id)
  } catch {
    ElMessage.error('问题不存在或加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>

<style scoped lang="scss">
.problem-detail-page {
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

.section-card {
  margin-bottom: 16px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .problem-no {
    font-size: 13px;
    color: #909399;
    margin-right: 4px;
  }

  & + .tag-row {
    margin-top: 10px;
  }
}

.action-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .action-label {
    font-size: 13px;
    color: #909399;
  }
}

.progress-percent {
  font-size: 18px;
  font-weight: 700;
  color: #2b7a4b;
}

.phase-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #c0c4cc;
}

.progress-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
