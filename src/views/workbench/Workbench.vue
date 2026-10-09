<template>
  <AppShell>
    <div class="stat-row">
      <article v-for="card in statCards" :key="card.label" class="stat-card">
        <span class="stat-icon" :class="card.tone"><component :is="card.icon" /></span>
        <div class="stat-info">
          <strong class="stat-value" :class="card.tone">{{ card.value }}</strong
          ><span class="stat-label">{{ card.label }}</span
          ><span class="stat-sub"
            ><b>{{ card.subValue }}</b> {{ card.subLabel }}</span
          ><span class="stat-trend" :class="card.tone">{{ card.trend }}</span>
        </div>
      </article>
    </div>
    <div class="workbench-grid">
      <section class="panel">
        <header class="panel-header">
          <b>我的待办预警</b
          ><button type="button" @click="router.push(todoRoute)">查看全部 →</button>
        </header>
        <div v-loading="loading" class="todo-list">
          <button
            v-for="item in todoList.slice(0, 6)"
            :key="item.id"
            type="button"
            class="todo-item"
            @click="router.push(`/problem/${item.id}`)"
          >
            <span>{{ item.title }}</span
            ><b :class="warningTone(item)">{{ todoMeta(item) }}</b>
          </button>
          <div v-if="loadError" class="todo-feedback">
            <span>{{ loadError }}</span
            ><button type="button" @click="loadData">重新加载</button>
          </div>
          <div v-else-if="!loading && !todoList.length" class="todo-feedback">当前暂无待办问题</div>
        </div>
      </section>
      <aside class="side-panels">
        <section class="flat-panel">
          <h2>快捷操作</h2>
          <div class="quick-grid">
            <button
              v-for="item in quickActions"
              :key="item.label"
              type="button"
              @click="router.push(item.route)"
            >
              <component :is="item.icon" /><span>{{ item.label }}</span>
            </button>
          </div>
        </section>
        <section class="flat-panel notices">
          <h2>通知公告</h2>
          <p v-for="notice in notices" :key="notice">{{ notice }}</p>
        </section>
      </aside>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bell,
  Checked,
  Clock,
  DataLine,
  DocumentAdd,
  Download,
  List,
  WarningFilled,
} from '@element-plus/icons-vue'
import AppShell from '@/layouts/AppShell.vue'
import { problemApi } from '@/api/problem'
import { useUserStore } from '@/stores/user'
import { canAccessMenu } from '@/constants/permissions'
import type { Problem } from '@/types'
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loadError = ref('')
const todoList = ref<Problem[]>([])
const problems = ref<Problem[]>([])
const currentYear = String(new Date().getFullYear())
const overview = computed(() => ({
  total: problems.value.length,
  thisYearTotal: problems.value.filter((item) => item.createdAt.startsWith(currentYear)).length,
  previousTotal: problems.value.filter((item) => !item.createdAt.startsWith(currentYear)).length,
  pending: problems.value.filter((item) => item.status === 'pending').length,
  inProgress: problems.value.filter((item) => item.status === 'inProgress').length,
  verify: problems.value.filter((item) => item.status === 'verify').length,
  closed: problems.value.filter((item) => item.status === 'closed').length,
  thisYearClosed: problems.value.filter(
    (item) => item.status === 'closed' && item.createdAt.startsWith(currentYear),
  ).length,
  previousClosed: problems.value.filter(
    (item) => item.status === 'closed' && !item.createdAt.startsWith(currentYear),
  ).length,
  overdue: problems.value.filter(
    (item) => item.warningLevel === 'red' || item.warningLevel === 'orange',
  ).length,
  red: problems.value.filter((item) => item.warningLevel === 'red').length,
}))
const statCards = computed(() => [
  {
    label: userStore.isResponsible ? '分配给我（今年）' : '问题累计（今年）',
    value: userStore.isResponsible ? overview.value.total : overview.value.thisYearTotal,
    subValue: userStore.isResponsible ? overview.value.pending : overview.value.previousTotal,
    subLabel: userStore.isResponsible ? '当前任务' : '往年累计',
    trend: '↑ 较上年 +12%',
    tone: 'ink',
    icon: List,
  },
  {
    label: userStore.isResponsible ? '我已完成（今年）' : '已销号（今年）',
    value: userStore.isResponsible ? overview.value.closed : overview.value.thisYearClosed,
    subValue: userStore.isResponsible ? completionRate.value : overview.value.previousClosed,
    subLabel: userStore.isResponsible ? '完成率%' : '往年累计',
    trend: '↑ 较上年 +8%',
    tone: 'green',
    icon: Checked,
  },
  {
    label: userStore.isResponsible ? '整改中' : '待核查',
    value: userStore.isResponsible ? overview.value.inProgress : overview.value.verify,
    subValue: userStore.isResponsible ? overview.value.verify : overview.value.inProgress,
    subLabel: userStore.isResponsible ? '待核查' : '整改中',
    trend: '→ 较上年持平',
    tone: 'blue',
    icon: Clock,
  },
  {
    label: userStore.isResponsible ? '我超期预警' : '超期预警',
    value: overview.value.overdue ?? 0,
    subValue: overview.value.red,
    subLabel: '红色预警',
    trend: '↑ 较上年 +3',
    tone: 'red',
    icon: WarningFilled,
  },
])
const completionRate = computed(() =>
  Math.round(((overview.value.closed ?? 0) / (overview.value.total || 1)) * 100),
)
const allQuickActions = [
  { label: '问题录入', route: '/problem/input', icon: DocumentAdd },
  { label: '进度填报', route: '/schedule', icon: DataLine },
  { label: '预警处置', route: '/warning', icon: Bell },
  { label: '报表导出', route: '/analysis', icon: Download },
]
const quickActions = computed(() =>
  allQuickActions.filter((item) => {
    const menuKey =
      item.route === '/problem/input'
        ? 'input'
        : item.route === '/warning'
          ? 'warning'
          : item.route === '/analysis'
            ? 'analysis'
            : 'schedule'
    return canAccessMenu(menuKey, userStore.role)
  }),
)
const todoRoute = computed(() => (userStore.isResponsible ? '/schedule' : '/warning'))
const notices = [
  '关于开展2026年第三季度生态环境专项检查的通知',
  '预警规则调整通知（7月15日起正式生效）',
  '关于升级问题重要等级人工上调审批流程的通知',
]
function warningTone(item: Problem): string {
  return item.warningLevel === 'red' ? 'red' : item.warningLevel === 'orange' ? 'orange' : 'green'
}
function todoMeta(item: Problem): string {
  const status =
    item.status === 'inProgress'
      ? '整改中'
      : item.status === 'verify'
        ? '待核查'
        : item.status === 'rejected'
          ? '已驳回'
          : '待下发'
  return `${status} · ${item.overdueDays > 0 ? `超期${item.overdueDays}天` : `录入${Math.abs(item.overdueDays || 0)}天`}`
}
async function loadData(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const result = await problemApi.getList({ page: 1, pageSize: 1000 })
    problems.value = result.list
    const warningOrder = { red: 0, orange: 1, yellow: 2, green: 3 }
    todoList.value = result.list
      .filter((item) => item.status !== 'closed')
      .sort(
        (a, b) =>
          warningOrder[a.warningLevel] - warningOrder[b.warningLevel] ||
          b.overdueDays - a.overdueDays,
      )
  } catch (error) {
    problems.value = []
    todoList.value = []
    loadError.value = error instanceof Error ? error.message : '工作台数据加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>

<style scoped lang="scss">
/* stylelint-disable scss/operator-no-unspaced */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 138px;
  padding: 20px 22px;
  background: #fff;
  border: 1px solid rgb(0 0 0/4%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0/5%);
}

.stat-icon {
  display: grid;
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  place-items: center;
}

.stat-icon svg {
  width: 21px;
}

.stat-icon.ink,
.stat-icon.green {
  background: #e8f5e9;
}

.stat-icon.blue {
  background: #e3f2fd;
}

.stat-icon.red {
  background: #ffebee;
}

.stat-info {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.stat-value {
  color: #1a1a2e;
  font:
    700 27px/1.2 Arial,
    sans-serif;
}

.stat-value.green {
  color: #43a047;
}

.stat-value.red {
  color: #e53935;
}

.stat-label {
  margin-top: 3px;
  color: #64748b;
  font-size: 13px;
}

.stat-sub {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.stat-sub b {
  color: #1a1a2e;
}

.stat-trend {
  margin-top: 7px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.ink,
.stat-trend.red {
  color: #e53935;
}

.stat-trend.green {
  color: #43a047;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(330px, 1fr);
  gap: 16px;
}

.panel {
  min-height: 406px;
  background: #fff;
  border: 1px solid rgb(0 0 0/4%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0/5%);
}

.panel-header,
.flat-panel h2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 51px;
  padding: 0 18px;
  margin: 0;
  border-bottom: 1px solid #edf0ed;
  font-size: 14px;
}

.panel-header button {
  color: #166534;
  font: inherit;
  font-size: 12px;
  background: none;
  border: 0;
  cursor: pointer;
}

.todo-list {
  padding: 14px 18px;
}

.todo-feedback {
  display: grid;
  min-height: 260px;
  color: #7b8493;
  font-size: 13px;
  text-align: center;
  place-content: center;
}

.todo-feedback button {
  padding: 7px 14px;
  margin: 10px auto 0;
  color: #fff;
  background: #166534;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 47px;
  padding: 10px 14px;
  color: #1a1a2e;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgb(0 0 0/4%);
  cursor: pointer;
}

.todo-item b {
  margin-left: 16px;
  font-size: 12px;
  white-space: nowrap;
}

.todo-item b.red {
  color: #e53935;
}

.todo-item b.orange {
  color: #fb8c00;
}

.todo-item b.green {
  color: #2e7d32;
}

.side-panels {
  display: grid;
  gap: 16px;
  align-content: start;
}

.flat-panel {
  min-width: 0;
}

.flat-panel h2 {
  position: relative;
  height: 42px;
  padding: 0 0 0 13px;
  color: #164e2a;
  background: transparent;
  border-bottom: 1px dashed #dce6dd;
  font-weight: 700;
}

.flat-panel h2::before {
  position: absolute;
  left: 0;
  width: 3px;
  height: 14px;
  background: #2e7d32;
  border-radius: 2px;
  content: '';
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding-top: 12px;
}

.quick-grid button {
  display: grid;
  height: 86px;
  color: #166534;
  background: linear-gradient(145deg, #fbfdfb, #f1f7f2);
  border: 1px solid #dce8de;
  border-radius: 10px;
  cursor: pointer;
  place-content: center;
  gap: 7px;
  box-shadow: 0 1px 2px rgb(22 101 52 / 3%);
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.quick-grid button:hover {
  color: #fff;
  background: linear-gradient(145deg, #2b7a4b, #166534);
  border-color: #166534;
  box-shadow: 0 7px 16px rgb(22 101 52 / 18%);
  transform: translateY(-2px);
}

.quick-grid button:active {
  box-shadow: 0 3px 8px rgb(22 101 52 / 15%);
  transform: translateY(0);
}

.quick-grid button:focus-visible {
  outline: 3px solid rgb(67 160 71 / 24%);
  outline-offset: 2px;
}

.quick-grid svg {
  width: 38px;
  height: 38px;
  padding: 9px;
  margin: auto;
  background: #e8f5e9;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.quick-grid button:hover svg {
  background: rgb(255 255 255 / 16%);
}

.quick-grid span {
  color: #526b59;
  font-size: 12px;
  font-weight: 600;
  transition: color 0.2s ease;
}

.quick-grid button:hover span {
  color: #fff;
}

.notices p {
  position: relative;
  padding: 12px 10px 12px 18px;
  margin: 0;
  color: #526b59;
  border-bottom: 1px dashed #dce6dd;
  font-size: 12px;
  line-height: 1.55;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    padding-left 0.2s ease;
}

.notices p:last-child {
  border-bottom: 0;
}

.notices p:hover {
  padding-left: 22px;
  color: #166534;
  background: #f3f8f4;
}

.notices p::before {
  position: absolute;
  top: 19px;
  left: 5px;
  width: 5px;
  height: 5px;
  background: #2e7d32;
  border-radius: 50%;
  content: '';
}

@media (width <= 1200px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .workbench-grid {
    grid-template-columns: 1fr;
  }
}
/* stylelint-enable scss/operator-no-unspaced */
</style>
