<template>
  <AppShell>
    <div v-loading="loading" class="detail-content">
      <template v-if="detail">
        <!-- 页头 -->
        <PageHeader :title="detail.title" :crumbs="['问题台账', '问题详情']">
          <template #actions>
            <el-button :icon="ArrowLeft" @click="router.push('/ledger')">返回台账</el-button>
          </template>
        </PageHeader>

        <!-- 标签区 -->
        <el-card class="section-card detail-summary" shadow="never">
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
              :disabled="btn.disabled || Boolean(actionLoading)"
              :loading="actionLoading === btn.action"
              @click="handleAction(btn.action)"
            >
              {{ btn.label }}
            </el-button>
          </div>
        </el-card>

        <!-- 双标签 + 详情 -->
        <el-card class="section-card basic-card" shadow="never">
          <template #header
            ><div class="flex-between">
              <span class="card-title">基础信息区</span
              ><span class="header-level" :class="detail.importantLevel"
                >重要等级：{{
                  detail.importantLevel === 'red'
                    ? '红色重大'
                    : detail.importantLevel === 'orange'
                      ? '橙色较大'
                      : '绿色常规'
                }}</span
              >
            </div></template
          >
          <DetailItem :items="detailItems">
            <template #category>{{ detail.category || '—' }}</template>
            <template #lnglat>{{
              detail.lng ? `${detail.lng.toFixed(4)}, ${detail.lat?.toFixed(4)}` : '—'
            }}</template>
            <template #deadline>{{ detail.deadline }}</template>
          </DetailItem>
          <div class="problem-description">
            <span>问题描述</span>
            <p>{{ detail.content || '暂无详细描述' }}</p>
          </div>
        </el-card>

        <!-- 阶段进度 -->
        <el-card class="section-card progress-card" shadow="never">
          <template #header>
            <div class="flex-between">
              <span class="card-title">整改进度</span>
              <span class="progress-percent">{{ detailProgress }}%</span>
            </div>
          </template>
          <div class="progress-overview">
            <div>
              <i class="blue" /><span>整改措施 · 30%</span
              ><b>{{ detail.measures ? '已填写' : '未填写' }}</b>
            </div>
            <div>
              <i class="orange" /><span>整改成效 · 30%</span
              ><b>{{ detail.effect ? '已填写' : '未填写' }}</b>
            </div>
            <div>
              <i class="green" /><span>佐证附件 · 40%</span
              ><b>{{
                detail.progressAttachments?.length
                  ? `${detail.progressAttachments.length} 个文件`
                  : '无附件'
              }}</b>
            </div>
          </div>
          <PhaseProgress :percent="detailProgress" />
          <div class="progress-details">
            <div>
              <b><i class="blue" />整改措施</b>
              <p>{{ detail.measures || '暂未填写' }}</p>
            </div>
            <div>
              <b><i class="orange" />整改成效</b>
              <p>{{ detail.effect || '暂未填写' }}</p>
            </div>
            <div>
              <b
                ><i class="green" />佐证附件 · 共
                {{ detail.progressAttachments?.length || 0 }} 个文件</b
              >
              <p>
                {{
                  detail.progressAttachments?.length
                    ? detail.progressAttachments.map((item) => item.name).join('、')
                    : '暂无佐证附件'
                }}
              </p>
            </div>
          </div>
        </el-card>

        <!-- 时间线 -->
        <el-card class="section-card lifecycle-card" shadow="never">
          <template #header><span class="card-title">生命周期</span></template>
          <TimelineList :items="detail.timeline || []" />
        </el-card>
      </template>
    </div>
  </AppShell>

  <!-- 进度填报对话框 -->
  <el-dialog v-model="progressVisible" title="填报整改进度" width="560px" class="progress-dialog">
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
      <el-button
        :loading="submittingProgress"
        :disabled="liveProgress === 0 || submittingProgress"
        @click="saveProgress(false)"
        >保存草稿</el-button
      >
      <el-button
        type="primary"
        :loading="submittingProgress"
        :disabled="liveProgress < 100 || submittingProgress"
        @click="saveProgress(true)"
        >提交验收申请</el-button
      >
    </template>
  </el-dialog>
  <VerificationDialog
    v-model="acceptVisible"
    mode="accept"
    :problem="detail"
    :loading="verificationLoading"
    @submit="submitAccept"
  />
  <VerificationDialog
    v-model="rejectVisible"
    mode="reject"
    :problem="detail"
    :loading="verificationLoading"
    @submit="submitReject"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import AppShell from '@/layouts/AppShell.vue'
import { problemApi } from '@/api/problem'
import { hasPermission } from '@/constants/permissions'
import { canTransition, STATUS_LABELS } from '@/utils/status'
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
import VerificationDialog from '@/components/workflow/VerificationDialog.vue'
import { serializeWorkflowPayload, type WorkflowPayload } from '@/types/workflow'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const actionLoading = ref('')
const submittingProgress = ref(false)
const detail = ref<Problem | null>(null)
const progressVisible = ref(false)
const acceptVisible = ref(false)
const rejectVisible = ref(false)
const verificationLoading = ref(false)
const progressForm = reactive<{ measures: string; effect: string }>({ measures: '', effect: '' })
const attachments = ref<{ name: string; size: number; raw?: File }[]>([])

/** 实时进度（三扇区） */
const liveProgress = computed(() =>
  calcProgress({
    measures: progressForm.measures,
    effect: progressForm.effect,
    attachments: attachments.value,
  }),
)
const detailProgress = computed(() =>
  calcProgress({
    measures: detail.value?.measures || '',
    effect: detail.value?.effect || '',
    attachments: detail.value?.progressAttachments || [],
  }),
)

const detailItems = computed(() => {
  const d = detail.value
  if (!d) return []
  return [
    { key: 'problemNo', label: '问题编号', value: d.problemNo },
    { key: 'source', label: '问题来源', value: d.source },
    { key: 'regionName', label: '涉及区域', value: d.regionName },
    { key: 'pollutionType', label: '污染类型', value: d.pollutionType },
    { key: 'responsibleUnit', label: '责任单位', value: d.responsibleUnit || '—' },
    { key: 'responsiblePerson', label: '责任人', value: d.responsiblePerson || '—' },
    { key: 'deadline', label: '整改截止时限', value: d.deadline },
    { key: 'createdAt', label: '录入时间', value: d.createdAt },
    {
      key: 'status',
      label: '当前状态',
      value: STATUS_LABELS[d.status],
    },
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
      btns.push({
        action: 'assign',
        label: '下发整改',
        type: 'primary',
        disabled: !d.responsibleUnit?.trim(),
      })
    if (can('accept'))
      btns.push({ action: 'accept', label: '验收销号', type: 'success', disabled: false })
    if (can('reject'))
      btns.push({ action: 'reject', label: '验收驳回', type: 'danger', disabled: false })
  }
  if (hasPermission(role, 'edit') && role === 'responsible') {
    if (can('submit') || d.status === 'inProgress') {
      btns.push({ action: 'progress', label: '填报进度', type: 'primary', disabled: false })
    }
  }
  return btns
})

async function handleAction(action: string): Promise<void> {
  if (action === 'progress') {
    progressForm.measures = detail.value?.measures || ''
    progressForm.effect = detail.value?.effect || ''
    attachments.value = (detail.value?.progressAttachments || []).map((file) => ({ ...file }))
    progressVisible.value = true
    return
  }
  if (action === 'accept') {
    acceptVisible.value = true
    return
  }
  if (action === 'reject') {
    rejectVisible.value = true
    return
  }
  if (action === 'assign') {
    if (!detail.value?.responsibleUnit?.trim()) {
      ElMessage.warning('请先配置责任单位后再下发整改任务')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确认将问题下发至“${detail.value.responsibleUnit}”并进入整改阶段？`,
        '下发整改确认',
        { type: 'warning', confirmButtonText: '确认下发', cancelButtonText: '取消' },
      )
    } catch {
      return
    }
  }
  await doTransition(action)
}

function submitAccept(payload: WorkflowPayload): Promise<void> {
  return submitVerification('accept', payload)
}

function submitReject(payload: WorkflowPayload): Promise<void> {
  return submitVerification('reject', payload)
}

async function submitVerification(
  action: 'accept' | 'reject',
  payload: WorkflowPayload,
): Promise<void> {
  if (!detail.value || verificationLoading.value) return
  verificationLoading.value = true
  try {
    detail.value = await problemApi.transition(
      detail.value.id,
      action,
      serializeWorkflowPayload(payload),
    )
    acceptVisible.value = false
    rejectVisible.value = false
    ElMessage.success(
      action === 'accept' ? '验收通过，问题已闭环销号' : '验收已驳回，问题已退回整改',
    )
  } catch {
    ElMessage.error(action === 'accept' ? '验收销号失败，请重试' : '验收驳回失败，请重试')
  } finally {
    verificationLoading.value = false
  }
}

async function doTransition(action: string): Promise<void> {
  if (!detail.value || actionLoading.value) return
  actionLoading.value = action
  try {
    detail.value = await problemApi.transition(detail.value.id, action)
    ElMessage.success('操作成功')
  } catch {
    ElMessage.error('操作失败，请重试')
  } finally {
    actionLoading.value = ''
  }
}

async function saveProgress(submitAfterSave: boolean): Promise<void> {
  if (!detail.value || submittingProgress.value) return
  if (
    submitAfterSave &&
    (!progressForm.measures.trim() || !progressForm.effect.trim() || !attachments.value.length)
  ) {
    ElMessage.warning('请完整填写整改措施、整改成效并上传佐证材料')
    return
  }
  submittingProgress.value = true
  try {
    detail.value = await problemApi.submitProgress(detail.value.id, {
      measures: progressForm.measures.trim(),
      effect: progressForm.effect.trim(),
      attachments: attachments.value,
    })
    if (submitAfterSave) {
      detail.value = await problemApi.transition(detail.value.id, 'submit')
      progressVisible.value = false
      ElMessage.success('已提交验收申请')
    } else {
      ElMessage.success('整改进度草稿已保存')
    }
  } catch {
    ElMessage.error('提交失败，请重试')
  } finally {
    submittingProgress.value = false
  }
}

async function loadDetail(): Promise<void> {
  loading.value = true
  try {
    const id = route.params.id as string
    detail.value = await problemApi.getDetail(id)
  } catch {
    // 请求层已经展示后端返回的权限或加载错误，此处只负责安全返回列表，避免重复提示。
    await router.replace('/ledger')
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>

<style scoped lang="scss">
.detail-content {
  width: 100%;
}

:deep(.page-header) {
  display: none;
}

.detail-summary {
  display: none;
}

.section-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

:deep(.section-card .el-card__header) {
  padding: 16px 18px;
  background: #fafbfc;
  border-bottom: 1px solid #e1e6e1;
}

:deep(.section-card .el-card__body) {
  padding: 18px;
}

.basic-card {
  min-height: 438px;
}

:deep(.basic-card .detail-grid) {
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

:deep(.basic-card .detail-item) {
  display: block;
  min-height: 78px;
  padding: 14px;
  background: #fafbfc;
  border: 1px solid rgb(0 0 0 / 3%);
  border-radius: 8px;
}

:deep(.basic-card .detail-label) {
  display: block;
  margin-bottom: 7px;
}

:deep(.basic-card .detail-label::after) {
  content: '';
}

.problem-description {
  padding-top: 18px;
  color: #64748b;
  font-size: 12px;
}

.problem-description p {
  margin: 7px 0 0;
  color: #1a1a2e;
  font-size: 14px;
}

.header-level {
  padding: 5px 12px;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}

.header-level.red {
  background: #e53935;
}

.header-level.orange {
  background: #fb8c00;
}

.header-level.green {
  background: #43a047;
}

.progress-card {
  min-height: 210px;
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 14px;

  div {
    display: grid;
    grid-template-columns: 8px 1fr;
    align-items: center;
    font-size: 12px;
  }

  b {
    grid-column: 2;
    margin-top: 2px;
    font-size: 13px;
  }
}

.progress-overview i,
.progress-details i {
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;

  &.blue {
    background: #039be5;
  }

  &.orange {
    background: #fb8c00;
  }

  &.green {
    background: #43a047;
  }
}

.progress-details {
  display: grid;
  gap: 10px;
  margin-top: 14px;

  b {
    display: flex;
    align-items: center;
    color: #647067;
    font-size: 12px;
  }

  p {
    min-height: 40px;
    padding: 11px 14px;
    margin: 6px 0 0;
    color: #647067;
    font-size: 12px;
    background: #f2f5f1;
    border-radius: 7px;
  }
}

.lifecycle-card {
  min-height: 260px;
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
  color: #1a5f2a;
}

.progress-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

:global(.progress-dialog) {
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 18%);
}

:global(.progress-dialog .el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

:global(.progress-dialog .el-dialog__body) {
  padding: 20px;
}

:global(.progress-dialog .el-dialog__footer) {
  padding: 14px 20px;
  border-top: 1px solid #e5e7eb;
}

@media (width <= 1000px) {
  :deep(.basic-card .detail-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

@media (width <= 640px) {
  :deep(.basic-card .detail-grid) {
    grid-template-columns: 1fr;
  }

  :global(.progress-dialog) {
    width: calc(100vw - 32px) !important;
    margin-top: 5vh !important;
  }
}
</style>
