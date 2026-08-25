<template>
  <div class="problem-input-page">
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
          <el-menu-item index="/problem/input"
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
        <PageHeader title="问题录入" :crumbs="['问题录入']" />

        <el-card shadow="never" class="form-card">
          <el-steps :active="currentStep" align-center finish-status="success" class="steps">
            <el-step title="基础信息" />
            <el-step title="分类标注" />
            <el-step title="责任时限" />
            <el-step title="自动定级" />
          </el-steps>

          <div class="step-body">
            <!-- Step 1 基础信息 -->
            <el-form
              v-show="currentStep === 0"
              ref="step1Ref"
              :model="form"
              :rules="rules1"
              label-width="90px"
            >
              <el-form-item label="问题标题" prop="title">
                <el-input
                  v-model="form.title"
                  placeholder="简明描述问题（自动推断类别与风险标签）"
                />
              </el-form-item>
              <el-form-item label="问题来源" prop="source">
                <el-select v-model="form.source" placeholder="选择来源" style="width: 100%">
                  <el-option v-for="s in PROBLEM_SOURCES" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
              <el-form-item label="所属区域" prop="regionCode">
                <el-select
                  v-model="form.regionCode"
                  placeholder="选择区域"
                  style="width: 100%"
                  @change="onRegionChange"
                >
                  <el-option v-for="r in REGIONS" :key="r.code" :label="r.name" :value="r.code" />
                </el-select>
              </el-form-item>
              <el-form-item label="污染类型" prop="pollutionType">
                <el-select
                  v-model="form.pollutionType"
                  placeholder="选择污染类型"
                  style="width: 100%"
                  @change="onAutoTag"
                >
                  <el-option v-for="t in POLLUTION_TYPES" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
              <el-form-item label="坐标（可选）">
                <div class="lnglat-row">
                  <el-input
                    v-model="form.lngText"
                    placeholder="经度（如 106.62）"
                    style="width: 180px"
                  />
                  <el-input
                    v-model="form.latText"
                    placeholder="纬度（如 23.92）"
                    style="width: 180px"
                  />
                </div>
              </el-form-item>
            </el-form>

            <!-- Step 2 分类标注 -->
            <el-form v-show="currentStep === 1" label-width="90px">
              <el-form-item label="问题类别">
                <el-select
                  v-model="form.category"
                  placeholder="系统已按标题自动推断，可手动修正"
                  style="width: 100%"
                  clearable
                  @change="onAutoTag"
                >
                  <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
                </el-select>
                <div v-if="autoCategory && !form.category" class="auto-hint">
                  <el-tag size="small" type="success" effect="light"
                    >自动推断：{{ autoCategory }}</el-tag
                  >
                </div>
              </el-form-item>
              <el-form-item label="风险标签">
                <TagInput
                  v-model="form.riskTags"
                  :suggestions="['重金属污染', '监测超标', '信访风险', '违法排污', '水源地风险']"
                />
                <div v-if="autoTags.length && !form.riskTags.length" class="auto-hint">
                  <el-tag v-for="t in autoTags" :key="t" size="small" effect="light" class="mr-4">{{
                    t
                  }}</el-tag>
                  <span class="hint-text">（按标题/类型自动推断，点上方「+ 添加」可采纳）</span>
                </div>
              </el-form-item>
            </el-form>

            <!-- Step 3 责任时限 -->
            <el-form
              v-show="currentStep === 2"
              ref="step3Ref"
              :model="form"
              :rules="rules3"
              label-width="90px"
            >
              <el-form-item label="责任单位" prop="responsibleUnit">
                <el-input v-model="form.responsibleUnit" placeholder="如：右江区生态环境局" />
              </el-form-item>
              <el-form-item label="责任人" prop="responsiblePerson">
                <el-input v-model="form.responsiblePerson" placeholder="如：张主任" />
              </el-form-item>
              <el-form-item label="整改时限" prop="deadline">
                <el-date-picker
                  v-model="form.deadline"
                  type="date"
                  placeholder="整改截止日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-form>

            <!-- Step 4 自动定级 -->
            <div v-show="currentStep === 3" class="level-step">
              <el-alert
                type="info"
                :closable="false"
                show-icon
                title="双维度矩阵判定规则"
                description="来源等级（按来源层级推断）× 风险等级（按类别/类型/标签推断）交叉定级：高×高→红、中×中→橙、低×低→绿，支持人工上调（仅上调，留痕）。"
              />
              <el-form label-width="90px" class="level-form">
                <el-form-item label="来源等级">
                  <el-select v-model="form.sourceGrade" placeholder="自动推断" style="width: 160px">
                    <el-option label="高" value="高" /><el-option label="中" value="中" /><el-option
                      label="低"
                      value="低"
                    />
                  </el-select>
                  <span v-if="!form.sourceGrade" class="hint-text"
                    >自动推断：{{ levelResult.sourceGrade }}</span
                  >
                </el-form-item>
                <el-form-item label="风险等级">
                  <el-select v-model="form.riskGrade" placeholder="自动推断" style="width: 160px">
                    <el-option label="高" value="高" /><el-option label="中" value="中" /><el-option
                      label="低"
                      value="低"
                    />
                  </el-select>
                  <span v-if="!form.riskGrade" class="hint-text"
                    >自动推断：{{ levelResult.riskGrade }}</span
                  >
                </el-form-item>
              </el-form>
              <div class="level-result">
                <div class="result-label">系统判定重要等级</div>
                <LevelBadge :level="levelResult.level" :sub-label="levelResult.label" />
                <div class="result-desc">
                  来源 {{ levelResult.sourceGrade }} × 风险 {{ levelResult.riskGrade }}
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
            <el-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</el-button>
            <el-button v-else type="success" :loading="submitting" @click="submit"
              >提交录入</el-button
            >
          </div>
        </el-card>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { problemApi } from '@/api/problem'
import {
  calcImportantLevel,
  inferCategory,
  inferRiskTags,
  type LevelForm,
  type Grade,
} from '@/utils/level'
import { POLLUTION_TYPES, PROBLEM_SOURCES, REGIONS } from '@/constants'
import PageHeader from '@/components/common/PageHeader.vue'
import LevelBadge from '@/components/common/LevelBadge.vue'
import TagInput from '@/components/common/TagInput.vue'
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

/** 8 类判定对象（对应广西方案） */
const CATEGORIES = [
  '水源地',
  '供水厂',
  '垃圾填埋场',
  '涉重企业',
  '尾矿库',
  '矿山',
  '散乱污',
  '其他',
]

const currentStep = ref(0)
const submitting = ref(false)
const step1Ref = ref<FormInstance>()
const step3Ref = ref<FormInstance>()

const form = reactive({
  title: '',
  source: '日常巡查',
  regionCode: '451000',
  regionName: '右江区',
  pollutionType: '水',
  category: '',
  riskTags: [] as string[],
  responsibleUnit: '',
  responsiblePerson: '',
  deadline: '',
  lngText: '',
  latText: '',
  sourceGrade: undefined as Grade | undefined,
  riskGrade: undefined as Grade | undefined,
})

const rules1: FormRules = {
  title: [{ required: true, message: '请输入问题标题', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  regionCode: [{ required: true, message: '请选择区域', trigger: 'change' }],
  pollutionType: [{ required: true, message: '请选择污染类型', trigger: 'change' }],
}

const rules3: FormRules = {
  responsibleUnit: [{ required: true, message: '请填写责任单位', trigger: 'blur' }],
  responsiblePerson: [{ required: true, message: '请填写责任人', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择整改时限', trigger: 'change' }],
}

/** 标题自动推断类别 */
const autoCategory = computed(() => inferCategory(form.title))

/** 自动推断风险标签（预览用） */
const autoTags = computed(() => {
  if (!form.title && !form.pollutionType) return []
  return inferRiskTags({
    title: form.title,
    category: form.category || autoCategory.value,
    pollutionType: form.pollutionType,
  })
})

/** 双维度定级结果（实时） */
const levelResult = computed(() => {
  const input: LevelForm = {
    sourceGrade: form.sourceGrade,
    riskGrade: form.riskGrade,
    sourceLevel: form.source,
    category: form.category || autoCategory.value,
    pollutionType: form.pollutionType,
    riskTags: form.riskTags,
  }
  return calcImportantLevel(input)
})

function onRegionChange(code: string): void {
  form.regionName = REGIONS.find((r) => r.code === code)?.name || ''
}

/** 类别/类型变化时自动采纳推断标签（追加式） */
function onAutoTag(): void {
  const tags = autoTags.value
  if (tags.length) {
    form.riskTags = Array.from(new Set([...form.riskTags, ...tags]))
  }
}

async function nextStep(): Promise<void> {
  if (currentStep.value === 0 && step1Ref.value) {
    const ok = await step1Ref.value.validate().catch(() => false)
    if (!ok) return
  }
  if (currentStep.value === 2 && step3Ref.value) {
    const ok = await step3Ref.value.validate().catch(() => false)
    if (!ok) return
  }
  currentStep.value++
}

async function submit(): Promise<void> {
  submitting.value = true
  try {
    const payload = {
      title: form.title,
      source: form.source,
      regionCode: form.regionCode,
      regionName: form.regionName,
      pollutionType: form.pollutionType,
      category: form.category || autoCategory.value || undefined,
      riskTags: form.riskTags.length ? form.riskTags : autoTags.value,
      responsibleUnit: form.responsibleUnit,
      responsiblePerson: form.responsiblePerson,
      deadline: form.deadline,
      lng: form.lngText ? Number(form.lngText) : undefined,
      lat: form.latText ? Number(form.latText) : undefined,
      importantLevel: levelResult.value.level,
      sourceGrade: levelResult.value.sourceGrade,
      riskGrade: levelResult.value.riskGrade,
    }
    const created = await problemApi.create(payload)
    ElMessage.success(`录入成功：${created.problemNo}（${levelResult.value.label}）`)
    router.push(`/problem/${created.id}`)
  } catch {
    ElMessage.error('录入失败，请重试')
  } finally {
    submitting.value = false
  }
}

function openScreen(): void {
  window.open('/screen', '_blank')
}
</script>

<style scoped lang="scss">
.problem-input-page {
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

.form-card {
  max-width: 860px;
  margin: 0 auto;
}
.steps {
  margin-bottom: 32px;
}
.step-body {
  min-height: 260px;
}

.lnglat-row {
  display: flex;
  gap: 12px;
}
.auto-hint {
  margin-top: 6px;
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}
.hint-text {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
.mr-4 {
  margin-right: 4px;
}

.level-step {
  .level-form {
    margin-top: 16px;
  }

  .level-result {
    margin-top: 24px;
    text-align: center;
    padding: 24px;
    background: #f9fbf8;
    border-radius: 8px;

    .result-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 12px;
    }
    .result-desc {
      margin-top: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}
</style>
