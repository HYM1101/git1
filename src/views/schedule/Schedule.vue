<template>
  <AppShell>
    <section class="page-heading">
      <div>
        <h1>进度管理</h1>
        <p>跟踪整改阶段、填报整改材料并提交验收</p>
      </div>
      <el-button :icon="Refresh" @click="loadList">刷新</el-button>
    </section>

    <!-- 统计行 -->
    <div v-if="userStore.isResponsible" class="stat-row responsible-stats">
      <StatCard
        label="分配给我"
        :value="statCount.assignedToMe"
        color="#0288D1"
        :icon="UserFilled"
        :on-click="() => selectStatus('')"
      />
      <StatCard
        label="整改中"
        :value="statCount.inProgress"
        color="#00897B"
        :icon="Loading"
        :on-click="() => selectStatus('inProgress')"
      />
      <StatCard
        label="我已完成"
        :value="statCount.closed"
        color="#43A047"
        :icon="CircleCheck"
        :on-click="() => selectStatus('closed')"
      />
      <StatCard
        label="我超期预警"
        :value="statCount.overdue"
        color="#E53935"
        :icon="Warning"
        :on-click="() => selectStatus('')"
      />
    </div>
    <div v-else class="stat-row">
      <StatCard
        label="待交办"
        :value="statCount.pending"
        color="#FB8C00"
        :icon="Clock"
        :on-click="() => selectStatus('pending')"
      />
      <StatCard
        label="整改中"
        :value="statCount.inProgress"
        color="#00897B"
        :icon="Loading"
        :on-click="() => selectStatus('inProgress')"
      />
      <StatCard
        label="待验收"
        :value="statCount.verify"
        color="#7B1FA2"
        :icon="DocumentChecked"
        :on-click="() => selectStatus('verify')"
      />
      <StatCard
        label="已驳回"
        :value="statCount.rejected"
        color="#E53935"
        :icon="CircleClose"
        :on-click="() => selectStatus('rejected')"
      />
      <StatCard
        label="已销号"
        :value="statCount.closed"
        color="#43A047"
        :icon="CircleCheck"
        :on-click="() => selectStatus('closed')"
      />
    </div>

    <div class="schedule-layout">
      <section class="schedule-panel">
        <header class="schedule-title">
          <b>问题列表</b><span>共 {{ total }} 条</span>
        </header>
        <nav class="status-tabs">
          <button
            v-for="tab in scheduleTabs"
            :key="tab.value"
            type="button"
            :class="{ active: statusFilter === tab.value }"
            @click="selectStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </nav>
        <div v-loading="loading" class="issue-list">
          <div v-if="loadError" class="list-feedback">
            <p>{{ loadError }}</p>
            <el-button size="small" type="primary" @click="loadList">重新加载</el-button>
          </div>
          <div v-else-if="!loading && !list.length" class="list-feedback">当前状态下暂无问题</div>
          <article
            v-for="row in list"
            :key="row.id"
            class="issue-item"
            :class="{ active: currentRow?.id === row.id }"
            tabindex="0"
            @click="selectProblem(row)"
            @keydown.enter="selectProblem(row)"
          >
            <div class="issue-tags">
              <span class="level-tag" :class="row.importantLevel"
                >重：{{ importantLabel(row.importantLevel) }}</span
              >
              <span class="status-tag" :class="row.status">{{ statusLabel(row.status) }}</span>
            </div>
            <div class="issue-title-row">
              <strong class="issue-title">{{ row.title || '未命名问题' }}</strong>
              <button
                class="detail-link"
                type="button"
                @click.stop="router.push(`/problem/${row.id}`)"
              >
                ◉ 详情
              </button>
            </div>
            <div class="issue-meta">
              <span>{{ row.regionName || '-' }} · {{ row.pollutionType || '-' }}</span>
              <b :class="deadlineClass(row)">{{ deadlineText(row) }}</b>
            </div>
          </article>
        </div>

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
      </section>
      <aside class="progress-side">
        <h2>
          <span>进度填报</span
          ><span v-if="currentRow" class="level-tag" :class="currentRow.importantLevel"
            >重：{{ importantLabel(currentRow.importantLevel) }}</span
          >
        </h2>
        <div v-if="!currentRow" class="progress-empty">
          <span>▣</span>
          <p>请从左侧选择一个问题进行进度填报</p>
        </div>
        <div v-else :key="currentRow.id" class="progress-content">
          <div class="section-tabs">
            <button
              :class="{ active: activeSection === 'progress' }"
              type="button"
              @click="activeSection = 'progress'"
            >
              ▣ 进度填报</button
            ><button
              :class="{ active: activeSection === 'materials' }"
              type="button"
              @click="activeSection = 'materials'"
            >
              ▤ 调度资料
            </button>
          </div>
          <template v-if="activeSection === 'progress'">
            <template v-if="currentRow.status === 'pending'">
              <section class="assign-summary">
                <div>
                  <span>问题编号</span><b>{{ currentRow.problemNo || currentRow.id }}</b>
                </div>
                <div>
                  <span>问题标题</span><b>{{ currentRow.title }}</b>
                </div>
                <div>
                  <span>问题来源</span><b>{{ currentRow.source || '-' }}</b>
                </div>
                <div>
                  <span>所属区域</span><b>{{ currentRow.regionName || '-' }}</b>
                </div>
                <div>
                  <span>污染类型</span><b>{{ currentRow.pollutionType || '-' }}</b>
                </div>
                <div>
                  <span>责任单位</span><b>{{ currentRow.responsibleUnit || '-' }}</b>
                </div>
                <div>
                  <span>责任人</span><b>{{ currentRow.responsiblePerson || '-' }}</b>
                </div>
                <div>
                  <span>整改期限</span><b>{{ currentRow.deadline || '-' }}</b>
                </div>
                <div><span>当前状态</span><b class="pending-text">待交办</b></div>
              </section>
              <section class="assign-notice">
                <b>● 审核下发提示</b>
                <ul>
                  <li>请确认问题信息准确无误后再进行下发操作</li>
                  <li>下发后责任单位将收到整改任务通知</li>
                  <li>如需修改问题信息，请返回问题详情进行编辑</li>
                </ul>
              </section>
              <div class="progress-actions">
                <el-button
                  v-if="canAssign(currentRow)"
                  :loading="transitionLoading === 'assign'"
                  :disabled="Boolean(transitionLoading)"
                  @click="assignProblem(currentRow)"
                  >审核下发</el-button
                >
                <el-button v-else disabled>等待审核下发</el-button>
              </div>
            </template>
            <template v-else>
              <div class="problem-info-line">
                <span
                  >问题编号 <b>{{ currentRow.problemNo || currentRow.id }}</b></span
                >
                <span
                  >责任单位 <b>{{ currentRow.responsibleUnit || '-' }}</b></span
                >
                <span
                  >当前状态
                  <b :class="`status-${currentRow.status}`">{{
                    statusLabel(currentRow.status)
                  }}</b></span
                >
                <span
                  >当前进度 <b class="brand-text">{{ currentRow.progress }}%</b></span
                >
              </div>
              <section v-if="currentRow.status === 'rejected'" class="reject-summary">
                <b>● 验收未通过，请补充整改后重新提交</b>
                <div v-if="latestRejectRecord">
                  <span>驳回意见：</span>{{ latestRejectRecord.desc || '-' }}
                  <small
                    >{{ latestRejectRecord.time }} ·
                    {{ latestRejectRecord.user || '核查组' }}</small
                  >
                </div>
              </section>
              <div class="progress-overview">
                <div class="overview-top">
                  <div class="overview-cells">
                    <div class="overview-cell">
                      <i :class="{ done: hasMeasures }" />
                      <div>
                        <small>整改措施 · 30%</small><b>{{ hasMeasures ? '已填写' : '未填写' }}</b>
                      </div>
                    </div>
                    <div class="overview-cell">
                      <i :class="{ done: hasEffect }" />
                      <div>
                        <small>整改成效 · 30%</small><b>{{ hasEffect ? '已填写' : '未填写' }}</b>
                      </div>
                    </div>
                    <div class="overview-cell">
                      <i :class="{ done: hasAttachments }" />
                      <div>
                        <small>佐证附件 · 40%</small
                        ><b>{{ hasAttachments ? `${attachments.length} 个文件` : '无附件' }}</b>
                      </div>
                    </div>
                  </div>
                  <div class="total-progress">
                    <small>总进度</small><b>{{ liveProgress }}<em>%</em></b>
                  </div>
                </div>
                <div class="overview-track"><span :style="{ width: `${liveProgress}%` }" /></div>
                <p>
                  <span v-if="latestProgressRecord"
                    >最近填报 {{ latestProgressRecord.time }} ·
                    {{ latestProgressRecord.user }}</span
                  >
                  <span v-else>三要素全部齐备方可提交验收申请</span>
                  <button
                    v-if="progressRecords.length"
                    type="button"
                    @click="historyVisible = true"
                  >
                    历史记录→
                  </button>
                </p>
              </div>
              <el-form :model="progressForm" label-position="top">
                <el-form-item label="整改措施 *"
                  ><div v-if="isReadOnlyProgress" class="readonly-field">
                    {{ progressForm.measures || '暂未填写' }}
                  </div>
                  <el-input
                    v-else
                    v-model="progressForm.measures"
                    type="textarea"
                    :rows="3"
                    :disabled="!canFill(currentRow)"
                    maxlength="500"
                    show-word-limit
                    placeholder="请详细描述已采取的整改措施及下一步计划"
                /></el-form-item>
                <el-form-item label="整改成效说明"
                  ><div v-if="isReadOnlyProgress" class="readonly-field compact">
                    {{ progressForm.effect || '暂未填写' }}
                  </div>
                  <el-input
                    v-else
                    v-model="progressForm.effect"
                    type="textarea"
                    :rows="2"
                    :disabled="!canFill(currentRow)"
                    maxlength="500"
                    show-word-limit
                    placeholder="请描述整改后的效果，可附监测数据"
                /></el-form-item>
                <el-form-item>
                  <template #label
                    ><span>佐证附件</span
                    ><button
                      class="upload-rule-link"
                      type="button"
                      @click="watermarkVisible = true"
                    >
                      上传规范
                    </button></template
                  >
                  <FileUpload
                    v-if="!isReadOnlyProgress"
                    v-model:file-list="attachments"
                    :max-size="20 * 1024 * 1024"
                    :limit="5"
                    :disabled="!canFill(currentRow)"
                  />
                  <div v-else class="readonly-files">
                    <span v-if="!attachments.length">暂无佐证附件</span>
                    <span v-for="file in attachments" v-else :key="file.name">{{ file.name }}</span>
                  </div></el-form-item
                >
              </el-form>
              <div class="progress-actions">
                <el-button
                  v-if="canFill(currentRow)"
                  type="primary"
                  :loading="savingProgress"
                  :disabled="!canFill(currentRow) || Boolean(transitionLoading)"
                  @click="saveProgress"
                  >保存草稿</el-button
                >
                <el-button
                  v-if="canFill(currentRow)"
                  type="success"
                  :loading="transitionLoading === 'submit'"
                  :disabled="liveProgress < 100 || savingProgress || Boolean(transitionLoading)"
                  @click="submitVerify(currentRow)"
                  >{{
                    currentRow.status === 'rejected'
                      ? liveProgress >= 100
                        ? '重新提交验收'
                        : '重新提交验收（需完善）'
                      : liveProgress >= 100
                        ? '提交验收'
                        : '提交验收（需完善）'
                  }}</el-button
                >
                <el-button
                  v-if="currentRow.status === 'rejected' && canVerify"
                  :loading="transitionLoading === 'rework'"
                  :disabled="Boolean(transitionLoading)"
                  @click="reassignRejected(currentRow)"
                  >重新下发整改</el-button
                >
                <el-button
                  v-if="canAccept(currentRow)"
                  type="success"
                  :loading="transitionLoading === 'accept'"
                  :disabled="Boolean(transitionLoading)"
                  @click="transition(currentRow, 'accept')"
                  >验收销号</el-button
                >
                <el-button
                  v-if="canReject(currentRow)"
                  type="danger"
                  :loading="transitionLoading === 'reject'"
                  :disabled="Boolean(transitionLoading)"
                  @click="transition(currentRow, 'reject')"
                  >驳回</el-button
                >
                <el-button
                  v-if="!canFill(currentRow) && !canAccept(currentRow) && !canReject(currentRow)"
                  disabled
                  >{{ inactiveActionLabel(currentRow) }}</el-button
                >
              </div>
            </template>
          </template>
          <DispatchMaterialsPanel v-else />
        </div>
      </aside>
    </div>
  </AppShell>
  <VerificationDialog
    v-model="acceptVisible"
    mode="accept"
    :problem="verificationTarget"
    :loading="verificationLoading"
    @submit="submitAccept"
  />
  <VerificationDialog
    v-model="rejectVisible"
    mode="reject"
    :problem="verificationTarget"
    :loading="verificationLoading"
    @submit="submitReject"
  />
  <el-dialog
    v-model="assignVisible"
    title="审核下发确认"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
  >
    <div v-if="assignTarget" class="assign-dialog-info">
      <small>问题编号</small><b>{{ assignTarget.problemNo }}</b> <small>问题标题</small
      ><span>{{ assignTarget.title }}</span> <small>责任单位</small
      ><strong>{{ assignTarget.responsibleUnit || '-' }}</strong>
    </div>
    <label class="assign-opinion">
      <span>审核意见 <i>*</i></span>
      <textarea
        v-model.trim="assignOpinion"
        rows="3"
        placeholder="请填写审核意见，如：经审核，情况属实，同意下发…"
      />
    </label>
    <p class="assign-dialog-tip">
      <b>提示：</b>下发后问题将进入“整改中”状态，责任单位将收到整改任务通知。
    </p>
    <template #footer>
      <el-button @click="assignVisible = false">取消</el-button>
      <el-button type="primary" :loading="transitionLoading === 'assign'" @click="confirmAssign"
        >确认下发</el-button
      >
    </template>
  </el-dialog>
  <el-dialog v-model="watermarkVisible" title="附件上传规范" width="540px" append-to-body>
    <p>上传的整改佐证材料需符合以下要求，确保材料真实、可追溯：</p>
    <ul class="watermark-rules">
      <li><b>时间水印：</b>照片需包含拍摄时间（精确到分钟），不得使用后期编辑图片。</li>
      <li><b>地点水印：</b>需显示问题点位名称或 GPS 定位地址。</li>
      <li><b>人员水印：</b>需包含拍摄人员姓名或工号。</li>
      <li><b>前后对比：</b>建议上传整改前、整改中、整改后照片。</li>
      <li><b>文件格式：</b>支持 JPG、PNG、PDF、DOC、DOCX，单文件不超过 20MB。</li>
    </ul>
    <template #footer
      ><el-button type="primary" @click="watermarkVisible = false"
        >我知道了，继续上传</el-button
      ></template
    >
  </el-dialog>
  <el-dialog v-model="historyVisible" title="整改进度历史记录" width="640px" append-to-body>
    <div v-if="progressRecords.length" class="history-records">
      <article v-for="record in progressRecords" :key="`${record.time}-${record.desc}`">
        <b>{{ record.desc }}</b
        ><span>{{ record.time }} · {{ record.user }}</span>
      </article>
    </div>
    <div v-else class="history-empty">暂无进度填报记录</div>
    <template #footer><el-button @click="historyVisible = false">关闭</el-button></template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheck,
  CircleClose,
  Clock,
  DocumentChecked,
  Loading,
  Refresh,
  UserFilled,
  Warning,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import AppShell from '@/layouts/AppShell.vue'
import { problemApi, type ProblemQuery } from '@/api/problem'
import { hasPermission } from '@/constants/permissions'
import { canTransition, type ProblemAction } from '@/utils/status'
import { calcProgress } from '@/utils/progress'
import type { Problem } from '@/types'
import StatCard from '@/components/common/StatCard.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import VerificationDialog from '@/components/workflow/VerificationDialog.vue'
import DispatchMaterialsPanel from '@/components/workflow/DispatchMaterialsPanel.vue'
import { serializeWorkflowPayload, type WorkflowPayload } from '@/types/workflow'
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loadError = ref('')
const list = ref<Problem[]>([])
const total = ref(0)
const statusFilter = ref<Problem['status'] | ''>('')
const scheduleTabs = computed<{ label: string; value: Problem['status'] | '' }[]>(() => [
  { label: '全部', value: '' },
  ...(userStore.isResponsible ? [] : [{ label: '待交办', value: 'pending' as const }]),
  { label: '整改中', value: 'inProgress' },
  { label: '待验收', value: 'verify' },
  { label: '已驳回', value: 'rejected' },
  { label: '已销号', value: 'closed' },
])

const query = reactive<ProblemQuery>({ page: 1, pageSize: 42 })

const savingProgress = ref(false)
const transitionLoading = ref<ProblemAction | ''>('')
const currentRow = ref<Problem | null>(null)
const progressForm = reactive<{ measures: string; effect: string }>({ measures: '', effect: '' })
const attachments = ref<{ name: string; size: number; raw?: File }[]>([])
const completedPhases = ref<number[]>([])
const activeSection = ref<'progress' | 'materials'>('progress')
const acceptVisible = ref(false)
const rejectVisible = ref(false)
const verificationTarget = ref<Problem | null>(null)
const verificationLoading = ref(false)
const assignVisible = ref(false)
const assignTarget = ref<Problem | null>(null)
const assignOpinion = ref('')
const watermarkVisible = ref(false)
const historyVisible = ref(false)

/** 统计（按状态计数，从列表接口拉 50 条粗略统计） */
const statCount = ref<Record<string, number>>({
  pending: 0,
  inProgress: 0,
  verify: 0,
  rejected: 0,
  closed: 0,
  assignedToMe: 0,
  overdue: 0,
})
let listRequestId = 0

/** 实时进度：三扇区（措施 30 + 成效 30 + 附件 40），与详情页填报口径一致 */
const liveProgress = computed(() =>
  calcProgress({
    measures: progressForm.measures,
    effect: progressForm.effect,
    attachments: attachments.value,
  }),
)

const hasMeasures = computed(() => Boolean(progressForm.measures.trim()))
const hasEffect = computed(() => Boolean(progressForm.effect.trim()))
const hasAttachments = computed(() => attachments.value.length > 0)
const latestRejectRecord = computed(() =>
  [...(currentRow.value?.timeline || [])].reverse().find((item) => item.action === 'REJECT'),
)
const progressRecords = computed(() =>
  (currentRow.value?.timeline || []).filter((item) => item.action === 'PROGRESS'),
)
const latestProgressRecord = computed(() => progressRecords.value.at(-1))
const isReadOnlyProgress = computed(() => Boolean(currentRow.value) && !canFill(currentRow.value))

async function loadList(): Promise<void> {
  const requestId = ++listRequestId
  loading.value = true
  loadError.value = ''
  try {
    if (userStore.isResponsible && statusFilter.value === 'pending') statusFilter.value = ''
    query.status = statusFilter.value || undefined
    const result = await problemApi.getList({ ...query })
    if (requestId !== listRequestId) return
    list.value = Array.isArray(result.list) ? result.list : []
    total.value = result.total
    if (currentRow.value) {
      const updated = list.value.find((item) => item.id === currentRow.value?.id)
      currentRow.value = updated || null
    }
  } catch (error) {
    if (requestId !== listRequestId) return
    list.value = []
    total.value = 0
    currentRow.value = null
    loadError.value = error instanceof Error ? error.message : '问题列表加载失败，请稍后重试'
    ElMessage.error(loadError.value)
  } finally {
    if (requestId === listRequestId) loading.value = false
  }
}

async function loadStats(): Promise<void> {
  try {
    if (userStore.isResponsible) {
      const assigned = await problemApi.getList({ page: 1, pageSize: 100 })
      statCount.value = {
        ...statCount.value,
        assignedToMe: assigned.total,
        inProgress: assigned.list.filter((item) => item.status === 'inProgress').length,
        closed: assigned.list.filter((item) => item.status === 'closed').length,
        overdue: assigned.list.filter((item) => item.status !== 'closed' && item.overdueDays > 0)
          .length,
        pending: 0,
      }
      return
    }
    const [pending, inProgress, verify, rejected, closed] = await Promise.all([
      problemApi.getList({ page: 1, pageSize: 1, status: 'pending' }),
      problemApi.getList({ page: 1, pageSize: 1, status: 'inProgress' }),
      problemApi.getList({ page: 1, pageSize: 1, status: 'verify' }),
      problemApi.getList({ page: 1, pageSize: 1, status: 'rejected' }),
      problemApi.getList({ page: 1, pageSize: 1, status: 'closed' }),
    ])
    statCount.value = {
      pending: pending.total,
      inProgress: inProgress.total,
      verify: verify.total,
      rejected: rejected.total,
      closed: closed.total,
    }
  } catch {
    ElMessage.warning('状态统计加载失败，问题列表仍可正常使用')
  }
}

function selectStatus(status: Problem['status'] | ''): void {
  if (userStore.isResponsible && status === 'pending') return
  statusFilter.value = status
  query.page = 1
  loadList()
}
function statusLabel(status: Problem['status']): string {
  return {
    pending: '待交办',
    inProgress: '整改中',
    verify: '待验收',
    rejected: '已驳回',
    closed: '已销号',
  }[status]
}

function importantLabel(level: Problem['importantLevel']): string {
  return level === 'red' ? '重大' : level === 'orange' ? '较大' : '常规'
}

function deadlineText(row: Problem): string {
  if (row.status === 'closed') return '已闭环'
  if (row.overdueDays > 0) return `超期${row.overdueDays}天`
  return `剩余${Math.abs(row.overdueDays)}天`
}

function deadlineClass(row: Problem): string {
  if (row.status === 'closed' || row.overdueDays <= 0) return 'is-normal'
  return 'is-overdue'
}

/** 表格行子集类型（兼容 el-table DefaultRow） */
/** 表格行取值辅助（模板 slot row 类型为 DefaultRow，此处统一收窄） */
function rowOf(row: unknown): Problem {
  return row as Problem
}

/** 角色权限辅助 */
const canVerify = computed(() => hasPermission(userStore.role, 'verify'))
const canAssign = (row: unknown) => {
  const r = rowOf(row)
  return canVerify.value && Boolean(r.responsibleUnit?.trim()) && canTransition(r.status, 'assign')
}
const canFill = (row: unknown) => {
  const r = rowOf(row)
  return (
    (userStore.isResponsible || userStore.isAdmin) && ['inProgress', 'rejected'].includes(r.status)
  )
}
const canSubmit = (row: unknown) => {
  const r = rowOf(row)
  return (
    (userStore.isResponsible || userStore.isAdmin) &&
    (canTransition(r.status, 'submit') || r.status === 'rejected') &&
    liveProgress.value >= 100
  )
}
const canAccept = (row: unknown) => canVerify.value && canTransition(rowOf(row).status, 'accept')
const canReject = (row: unknown) => canVerify.value && canTransition(rowOf(row).status, 'reject')

/** 根据当前生命周期给出准确的只读操作提示，避免“待验收”误显示为等待整改。 */
const inactiveActionLabel = (row: unknown): string => {
  const status = rowOf(row).status
  if (status === 'closed') return '问题已闭环'
  if (status === 'verify') return userStore.isResponsible ? '已提交，等待验收' : '等待验收处理'
  if (status === 'pending') return '等待科室人员审核下发'
  if (status === 'rejected') return '已退回整改'
  return '等待责任单位整改'
}

function resetProgressForm(): void {
  progressForm.measures = currentRow.value?.measures || ''
  progressForm.effect = currentRow.value?.effect || ''
  attachments.value = (currentRow.value?.progressAttachments || []).map((file) => ({ ...file }))
  completedPhases.value = currentRow.value?.completedPhases
    ? [...currentRow.value.completedPhases]
    : []
}

function selectProblem(row: unknown): void {
  const r = rowOf(row)
  if (currentRow.value?.id === r.id) return
  currentRow.value = r
  activeSection.value = 'progress'
  resetProgressForm()
}

async function saveProgress(): Promise<void> {
  if (!currentRow.value || savingProgress.value) return
  if (!canFill(currentRow.value)) {
    ElMessage.warning('当前生命周期状态不允许填报进度')
    return
  }
  if (!progressForm.measures.trim() && !progressForm.effect.trim() && !attachments.value.length) {
    ElMessage.warning('请至少填写整改措施、整改成效或上传佐证材料')
    return
  }
  savingProgress.value = true
  try {
    const updated = await problemApi.submitProgress(currentRow.value.id, {
      measures: progressForm.measures,
      effect: progressForm.effect,
      attachments: attachments.value,
      completedPhases: completedPhases.value,
    })
    currentRow.value = updated
    ElMessage.success('进度已保存')
    await loadList()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    savingProgress.value = false
  }
}

async function submitVerify(row: unknown): Promise<void> {
  const r = rowOf(row)
  if (!canSubmit(r) || transitionLoading.value) return
  try {
    await ElMessageBox.confirm(
      '提交后问题将进入待验收状态，整改内容暂不可继续编辑，是否继续？',
      '提交验收确认',
      { type: 'warning', confirmButtonText: '确认提交', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  if (r.status === 'rejected') {
    transitionLoading.value = 'submit'
    try {
      await problemApi.transition(r.id, 'rework')
      await problemApi.transition(r.id, 'submit')
      ElMessage.success('已重新提交验收')
      await Promise.all([loadList(), loadStats()])
    } catch {
      ElMessage.error('重新提交失败，状态可能已变化，请刷新后重试')
    } finally {
      transitionLoading.value = ''
    }
    return
  }
  await transition(row, 'submit')
}

async function assignProblem(row: unknown): Promise<void> {
  const r = rowOf(row)
  if (!r.responsibleUnit?.trim()) {
    ElMessage.warning('请先配置责任单位后再下发整改任务')
    return
  }
  if (!canAssign(r) || transitionLoading.value) return
  assignTarget.value = r
  assignOpinion.value = ''
  assignVisible.value = true
}

async function confirmAssign(): Promise<void> {
  if (!assignTarget.value || transitionLoading.value) return
  if (!assignOpinion.value) {
    ElMessage.warning('请填写审核意见')
    return
  }
  const target = assignTarget.value
  await transition(target, 'assign')
  if (!transitionLoading.value) {
    assignVisible.value = false
    assignTarget.value = null
  }
}

async function reassignRejected(row: unknown): Promise<void> {
  const r = rowOf(row)
  if (r.status !== 'rejected' || transitionLoading.value) return
  try {
    await ElMessageBox.confirm(
      `确认将该历史驳回问题重新下发至“${r.responsibleUnit || '原责任单位'}”？`,
      '重新下发确认',
      { type: 'warning', confirmButtonText: '确认下发', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  await transition(r, 'rework')
}

async function transition(row: unknown, action: ProblemAction): Promise<void> {
  const r = rowOf(row)
  if (transitionLoading.value) return
  if (!canTransition(r.status, action)) {
    ElMessage.warning('当前生命周期状态已变化，请刷新后重试')
    await loadList()
    return
  }
  if (action === 'accept' || action === 'reject') {
    verificationTarget.value = r
    if (action === 'accept') acceptVisible.value = true
    else rejectVisible.value = true
    return
  }
  transitionLoading.value = action
  try {
    await problemApi.transition(r.id, action)
    ElMessage.success('操作成功')
    await Promise.all([loadList(), loadStats()])
  } catch {
    ElMessage.error('操作失败，状态可能已变化，请刷新后重试')
  } finally {
    transitionLoading.value = ''
  }
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
  const target = verificationTarget.value
  if (!target || verificationLoading.value) return
  verificationLoading.value = true
  transitionLoading.value = action
  try {
    await problemApi.transition(target.id, action, serializeWorkflowPayload(payload))
    acceptVisible.value = false
    rejectVisible.value = false
    verificationTarget.value = null
    ElMessage.success(
      action === 'accept' ? '验收通过，问题已闭环销号' : '验收已驳回，问题已退回整改',
    )
    await Promise.all([loadList(), loadStats()])
  } catch {
    ElMessage.error(action === 'accept' ? '验收销号失败，请重试' : '验收驳回失败，请重试')
  } finally {
    verificationLoading.value = false
    transitionLoading.value = ''
  }
}

onMounted(() => {
  loadList()
  loadStats()
})
</script>

<style scoped lang="scss">
.page-heading {
  display: none;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-heading h1 {
  margin: 0;
  color: #1a1a2e;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
}

.page-heading p {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-row.responsible-stats {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.status-tabs {
  display: flex;
  gap: 10px;
  padding: 14px 18px 8px;
}

.status-tabs button {
  padding: 7px 14px;
  color: #64748b;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dfe5df;
  border-radius: 7px;
}

.status-tabs button.active {
  color: #fff;
  background: #166534;
  border-color: #166534;
}

.issue-list {
  max-height: 620px;
  overflow-y: auto;
  padding: 12px 14px 14px;
}

.issue-item {
  position: relative;
  min-width: 0;
  padding: 12px 14px;
  margin-bottom: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #fafbf8;
  border: 1px solid transparent;
  border-radius: 8px;
  transition:
    transform 0.2s,
    background-color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.issue-item:last-child {
  margin-bottom: 0;
}

.issue-item:hover {
  background: #fff;
  border-color: rgb(0 0 0 / 4%);
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
  transform: translateX(4px);
}

.issue-item.active {
  background: rgb(26 95 42 / 4%);
  border-color: rgb(26 95 42 / 12%);
  box-shadow: 0 0 0 3px rgb(26 95 42 / 4%);
}

.issue-item.active::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  content: '';
  background: #1a5f2a;
  border-radius: 0 3px 3px 0;
}

.issue-item:focus-visible {
  outline: 2px solid #1a5f2a;
  outline-offset: -2px;
}

.list-feedback {
  display: grid;
  min-height: 300px;
  color: #7b8493;
  text-align: center;
  place-content: center;
}

.issue-title-row {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  margin-bottom: 4px;
}

.issue-title {
  flex: 1;
  min-width: 0;
  color: #1a1a2e;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  font-size: 12px;
}

.issue-meta b {
  flex-shrink: 0;
  font-weight: 600;
}

.issue-meta .is-overdue {
  color: #e53935;
}

.issue-meta .is-normal {
  color: #43a047;
}

.issue-tags {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.level-tag,
.status-tag {
  padding: 3px 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
}

.level-tag.red,
.status-tag.rejected {
  background: #e53935;
}

.level-tag.orange,
.status-tag.pending {
  background: #fb8c00;
}

.level-tag.green,
.status-tag.closed {
  background: #43a047;
}

.status-tag.inProgress {
  background: #00897b;
}

.status-tag.verify {
  background: #7b1fa2;
}

.detail-link {
  flex-shrink: 0;
  padding: 2px 0;
  color: #166534;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.schedule-panel {
  overflow: hidden;
  background: #fafbf8;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);
}

.schedule-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 51px;
  padding: 0 18px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

.schedule-title span {
  color: #64748b;
}

:deep(.schedule-panel .pagination-bar) {
  display: none;
}

.schedule-layout {
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 16px;
}

.progress-side {
  min-height: 640px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);
}

.progress-side h2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 16px 18px;
  margin: 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.progress-empty {
  display: grid;
  height: 500px;
  color: #7b8493;
  text-align: center;
  place-content: center;
}

.progress-empty span {
  font-size: 42px;
}

.progress-empty p {
  font-size: 13px;
}

.progress-content {
  padding: 18px;
  animation: panel-in 180ms ease-out;
}

.section-tabs {
  display: flex;
  gap: 3px;
  padding: 3px;
  margin-bottom: 14px;
  border: 1px solid #dfe5df;
  border-radius: 7px;
}

.section-tabs button {
  flex: 1;
  padding: 7px 14px;
  color: #687383;
  font-size: 13px;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.section-tabs button.active {
  color: #fff;
  font-weight: 700;
  background: #1a5f2a;
  box-shadow: 0 1px 3px rgb(26 95 42 / 18%);
}

.assign-summary {
  padding: 12px 14px;
  margin-bottom: 16px;
  background: #f7f8f5;
  border-radius: 6px;
}

.assign-summary > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 6px 0;
  color: #7b8493;
  font-size: 13px;
}

.assign-summary b {
  max-width: 65%;
  color: #1a1a2e;
  overflow: hidden;
  font-weight: 600;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assign-summary .pending-text {
  color: #fb8c00;
}

.assign-notice {
  padding: 16px;
  margin-bottom: 16px;
  color: #7b8493;
  background: rgb(251 140 0 / 6%);
  border: 1px dashed rgb(251 140 0 / 20%);
  border-radius: 6px;
  font-size: 13px;
}

.assign-notice b {
  color: #fb8c00;
}

.assign-notice ul {
  padding-left: 20px;
  margin: 8px 0 0;
  line-height: 1.8;
}

.problem-info-line {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 2px;
  color: #89919e;
  font-size: 11px;
}

.problem-info-line span,
.problem-info-line b {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.problem-info-line b {
  margin-top: 4px;
  color: #374151;
  font-size: 12px;
}

.problem-info-line .brand-text {
  color: #1a5f2a;
}

.reject-summary {
  padding: 12px 16px;
  margin-bottom: 14px;
  color: #5a2d2d;
  background: #ffebee;
  border-left: 4px solid #e53935;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
}

.reject-summary b {
  display: block;
  margin-bottom: 8px;
  color: #e53935;
  font-size: 14px;
}

.reject-summary span,
.reject-summary small {
  color: #7b8493;
}

.reject-summary small {
  float: right;
  font-size: 12px;
}

.progress-overview {
  padding: 14px 16px;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.overview-top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.overview-cells {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 0;
}

.overview-cell i {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  background: #cbd3cd;
  border-radius: 50%;
}

.overview-cell i.done {
  background: #43a047;
  box-shadow: 0 0 0 3px rgb(67 160 71 / 12%);
}

.overview-cell small,
.overview-cell b,
.total-progress small {
  display: block;
}

.overview-cell small {
  overflow: hidden;
  color: #7b8493;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-cell b {
  margin-top: 3px;
  color: #38443b;
  font-size: 11px;
}

.total-progress {
  width: 130px;
  text-align: right;
}

.total-progress small {
  color: #7b8493;
  font-size: 10px;
}

.total-progress b {
  color: #1a5f2a;
  font-size: 26px;
  line-height: 1.1;
}

.total-progress em {
  font-size: 12px;
  font-style: normal;
}

.overview-track {
  height: 8px;
  margin-top: 12px;
  overflow: hidden;
  background: #dce5dd;
  border-radius: 99px;
}

.overview-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #2b7a4b, #43a047);
  border-radius: inherit;
  transition: width 180ms ease;
}

.progress-overview p {
  display: flex;
  justify-content: space-between;
  margin: 6px 0 0;
  color: #89919e;
  font-size: 10px;
  text-align: left;
}

.progress-overview p button,
.upload-rule-link {
  padding: 0;
  color: #1a5f2a;
  background: none;
  border: 0;
  cursor: pointer;
  font-size: 12px;
}

.readonly-field {
  width: 100%;
  min-height: 48px;
  padding: 8px 10px;
  color: #1a1a2e;
  background: #f7f8f5;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
}

.readonly-field.compact {
  min-height: 36px;
}

.readonly-files {
  display: grid;
  width: 100%;
  gap: 6px;
  color: #7b8493;
  font-size: 13px;
}

.readonly-files span {
  padding: 8px 10px;
  background: #f7f8f5;
  border-radius: 4px;
}

.upload-rule-link {
  margin-left: 8px;
}

:global(.assign-dialog-info) {
  display: grid;
  gap: 5px;
  padding: 14px;
  margin-bottom: 16px;
  background: #f7f8f5;
  border-radius: 6px;
}

:global(.assign-dialog-info small) {
  margin-top: 5px;
  color: #7b8493;
}

:global(.assign-dialog-info strong) {
  color: #1a5f2a;
}

:global(.assign-opinion) {
  display: grid;
  gap: 7px;
  color: #7b8493;
  font-size: 13px;
}

:global(.assign-opinion i) {
  color: #e53935;
  font-style: normal;
}

:global(.assign-opinion textarea) {
  padding: 9px 12px;
  font: inherit;
  background: #f7f8f5;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

:global(.assign-dialog-tip) {
  padding: 12px;
  color: #1a5f2a;
  background: #e8f5e9;
  border-radius: 6px;
  font-size: 13px;
}

:global(.watermark-rules) {
  display: grid;
  gap: 10px;
  padding-left: 22px;
  color: #5f6978;
  line-height: 1.6;
}

:global(.history-records) {
  display: grid;
  gap: 10px;
}

:global(.history-records article) {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  background: #f7f8f5;
  border-radius: 6px;
}

:global(.history-records span),
:global(.history-empty) {
  color: #7b8493;
  font-size: 12px;
}

.progress-content :deep(.el-form-item) {
  margin-bottom: 12px;
}

.progress-content :deep(.el-form-item__label) {
  padding-bottom: 4px;
  color: #7b8493;
  font-size: 13px;
  font-weight: 500;
}

.progress-content :deep(.el-textarea__inner) {
  padding: 9px 12px;
  background: #f7f8f5;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}

.progress-content :deep(.file-upload .el-upload-dragger) {
  padding: 14px;
  background: #f5f7f3;
  border-width: 1px;
  border-radius: 6px;
}

.progress-content :deep(.file-upload .el-icon--upload) {
  margin: 0 0 4px;
  color: #1a5f2a;
  font-size: 18px;
}

.progress-content :deep(.file-upload .el-upload__text) {
  font-size: 13px;
}

.progress-content :deep(.file-upload .el-upload__tip) {
  display: none;
}

.progress-content :deep(.el-progress) {
  width: 100%;
}

.progress-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

@media (width <= 1180px) and (width > 960px) {
  .schedule-layout {
    grid-template-columns: minmax(360px, 0.9fr) minmax(0, 1.1fr);
  }

  .overview-cell {
    padding-inline: 6px;
  }
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (width <= 960px) {
  .schedule-layout {
    grid-template-columns: 1fr;
  }

  .progress-side {
    min-height: auto;
  }

  .issue-list {
    max-height: 460px;
  }

  .stat-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
