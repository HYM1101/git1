<template>
  <AppShell>
    <section class="page-heading">
      <div>
        <h1>问题录入</h1>
        <p>按步骤登记问题信息，系统将自动完成风险标签与重要等级判定</p>
      </div>
    </section>

    <el-card shadow="never" class="form-card">
      <el-steps :active="currentStep" align-center finish-status="success" class="steps">
        <el-step
          v-for="(step, index) in STEPS"
          :key="step"
          :title="step"
          class="clickable-step"
          @click="goStep(index)"
        />
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
          <el-form-item label="问题编号"
            ><el-input :model-value="problemNoPreview" disabled
          /></el-form-item>
          <el-form-item label="问题标题" prop="title">
            <el-input
              v-model="form.title"
              maxlength="100"
              show-word-limit
              placeholder="简明描述问题（自动推断类别与风险标签）"
            />
          </el-form-item>
          <el-form-item label="发现日期" prop="discoveredDate">
            <el-date-picker
              v-model="form.discoveredDate"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="问题内容" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="5"
              maxlength="1000"
              show-word-limit
              placeholder="请详细描述问题情况，包括时间、地点、具体表现等"
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
        </el-form>

        <!-- Step 2 分类标注 -->
        <el-form
          v-show="currentStep === 1"
          ref="step2Ref"
          :model="form"
          :rules="rules2"
          label-width="110px"
        >
          <el-form-item label="污染类型一级" prop="pollutionType">
            <el-select
              v-model="form.pollutionType"
              style="width: 100%"
              @change="onPollutionLevel1Change"
              ><el-option v-for="t in POLLUTION_TYPES" :key="t" :label="t" :value="t"
            /></el-select>
          </el-form-item>
          <el-form-item label="污染类型二级" prop="pollutionLevel2">
            <el-select
              v-model="form.pollutionLevel2"
              clearable
              placeholder="请选择二级类型"
              style="width: 100%"
              @change="onPollutionLevel2Change"
              ><el-option v-for="t in level2Options" :key="t" :label="t" :value="t"
            /></el-select>
          </el-form-item>
          <el-form-item label="污染类型三级">
            <el-select
              v-model="form.pollutionLevel3"
              clearable
              placeholder="请选择三级类型"
              style="width: 100%"
              ><el-option v-for="t in level3Options" :key="t" :label="t" :value="t"
            /></el-select>
          </el-form-item>
          <el-form-item label="所属分类" prop="category">
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
              <el-button link type="primary" @click="acceptAutoCategory">采纳建议</el-button>
            </div>
          </el-form-item>
          <el-form-item label="行业类别" prop="industry"
            ><el-input v-model="form.industry" maxlength="50" placeholder="请输入行业类别"
          /></el-form-item>
          <el-form-item label="涉及企业/点位"
            ><el-input
              v-model="form.entityName"
              maxlength="100"
              placeholder="请输入涉及的企业名称或具体点位"
          /></el-form-item>
          <el-form-item label="标签">
            <TagInput
              v-model="form.riskTags"
              :suggestions="['重金属污染', '监测超标', '信访风险', '违法排污', '水源地风险']"
            />
            <div v-if="autoTags.length && !form.riskTags.length" class="auto-hint">
              <el-tag v-for="t in autoTags" :key="t" size="small" effect="light" class="mr-4">{{
                t
              }}</el-tag>
              <span class="hint-text">（按标题/类型自动推断，点上方「+ 添加」可采纳）</span>
              <el-button link type="primary" @click="acceptAutoTags">全部采纳</el-button>
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
          <el-form-item label="整改要求" prop="requirements">
            <el-input
              v-model="form.requirements"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="请输入整改要求及验收标准"
            />
          </el-form-item>
          <el-form-item label="督办层级"
            ><el-select v-model="form.supervisionLevel" style="width: 100%"
              ><el-option label="市级督办" value="市级督办" /><el-option
                label="县级督办"
                value="县级督办" /><el-option label="局级督办" value="局级督办" /></el-select
          ></el-form-item>
          <el-form-item label="抄送单位"
            ><el-checkbox-group v-model="form.ccUnits"
              ><el-checkbox value="市政府办公厅">市政府办公厅</el-checkbox
              ><el-checkbox value="市水利局">市水利局</el-checkbox
              ><el-checkbox value="市城管局">市城管局</el-checkbox></el-checkbox-group
            ></el-form-item
          >
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

        <el-form
          v-show="currentStep === 4"
          ref="step5Ref"
          :model="form"
          :rules="rules5"
          label-width="90px"
        >
          <el-form-item label="详细地址" prop="address"
            ><div class="address-row">
              <el-input
                v-model="form.address"
                placeholder="请输入详细地址或使用区域中心点"
              /><el-button @click="useRegionCenter">使用区域中心点</el-button>
            </div></el-form-item
          >
          <el-form-item label="经纬度" prop="lngText"
            ><div class="lnglat-row">
              <el-input v-model="form.lngText" placeholder="经度（如 106.62）" /><el-input
                v-model="form.latText"
                placeholder="纬度（如 23.92）"
              /></div
          ></el-form-item>
          <div class="location-preview">
            <span>问题点位</span><small>填写经纬度后将在 GIS 一张图中展示</small>
          </div>
        </el-form>

        <div v-show="currentStep === 5" class="upload-step">
          <div class="upload-title">
            现场照片 <em>*</em><small>JPG/PNG，单张不超过 20MB，至少 2 张、最多 9 张</small>
          </div>
          <label class="upload-entry"
            ><input type="file" accept="image/jpeg,image/png" multiple @change="onPhotoChange" /><b
              >点击选择现场照片</b
            ><span>已选择 {{ photos.length }} 张</span></label
          >
          <ul v-if="photos.length" class="file-list">
            <li v-for="file in photos" :key="file.name">
              {{ file.name }}<button type="button" @click="removePhoto(file.name)">移除</button>
            </li>
          </ul>
          <el-button v-if="photos.length" link type="danger" @click="clearPhotos"
            >清空照片</el-button
          >
          <div class="upload-title">
            证明文档 <small>PDF、Word、Excel，单个文件不超过 50MB</small>
          </div>
          <label class="upload-entry"
            ><input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
              @change="onDocumentChange"
            /><b>点击选择证明文档</b><span>已选择 {{ documents.length }} 个</span></label
          >
          <ul v-if="documents.length" class="file-list">
            <li v-for="file in documents" :key="file.name">
              {{ file.name }}<button type="button" @click="removeDocument(file.name)">移除</button>
            </li>
          </ul>
          <div class="upload-title">
            视频资料 <small>MP4、MOV，单个文件不超过 100MB（选填）</small>
          </div>
          <label class="upload-entry"
            ><input type="file" accept="video/mp4,video/quicktime" @change="onVideoChange" /><b
              >点击选择视频资料</b
            ><span>{{ video?.name || '尚未选择' }}</span></label
          >
          <el-button v-if="video" link type="danger" @click="removeVideo">移除视频</el-button>
          <div class="submit-note">
            <strong>提交说明：</strong
            >请确认所有信息填写完整。提交后将自动生成问题编号，并实时同步到问题台账。
          </div>
        </div>
      </div>

      <div class="step-actions">
        <el-button @click="clearForm">清空重填</el-button>
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 5" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-else type="success" :loading="submitting" @click="submit">提交录入</el-button>
      </div>
    </el-card>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import AppShell from '@/layouts/AppShell.vue'
import { problemApi } from '@/api/problem'
import { useProblemStore } from '@/stores/problem'
import {
  calcImportantLevel,
  inferCategory,
  inferRiskTags,
  type LevelForm,
  type Grade,
} from '@/utils/level'
import { POLLUTION_TYPES, PROBLEM_SOURCES, REGIONS } from '@/constants'
import LevelBadge from '@/components/common/LevelBadge.vue'
import TagInput from '@/components/common/TagInput.vue'
const router = useRouter()
const problemStore = useProblemStore()

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
const STEPS = ['基础信息', '分类标注', '责任时限', '自动定级', '地图定位', '附件上传']
const POLLUTION_LEVEL2: Record<string, string[]> = {
  大气: ['工业废气', '扬尘污染', '机动车尾气', '恶臭污染'],
  水: ['工业废水', '生活污水', '养殖废水', '地表水污染'],
  固废: ['危险废物', '一般工业固废', '生活垃圾', '建筑垃圾'],
  土壤: ['重金属污染', '有机物污染', '农业面源污染'],
  噪声: ['工业噪声', '施工噪声', '交通噪声', '社会生活噪声'],
  生态: ['矿山破坏', '水土流失', '自然保护地问题', '生态修复'],
}
const POLLUTION_LEVEL3: Record<string, string[]> = {
  工业废气: ['超标排放', '无组织排放', '治理设施异常'],
  工业废水: ['超标排放', '偷排漏排', '治理设施异常'],
  危险废物: ['非法倾倒', '贮存不规范', '转移手续不全'],
  重金属污染: ['镉污染', '铅污染', '汞污染', '其他重金属'],
}
const REGION_CENTERS: Record<string, { lng: number; lat: number }> = {
  右江区: { lng: 106.618, lat: 23.905 },
  田阳区: { lng: 106.915, lat: 23.755 },
  田东县: { lng: 107.126, lat: 23.597 },
  德保县: { lng: 106.618, lat: 23.323 },
  靖西市: { lng: 106.418, lat: 23.134 },
  那坡县: { lng: 105.833, lat: 23.408 },
  凌云县: { lng: 106.561, lat: 24.345 },
  乐业县: { lng: 106.557, lat: 24.782 },
  田林县: { lng: 106.228, lat: 24.292 },
  西林县: { lng: 105.095, lat: 24.497 },
  隆林县: { lng: 105.344, lat: 24.771 },
  平果市: { lng: 107.59, lat: 23.323 },
}

const currentStep = ref(0)
const submitting = ref(false)
const step1Ref = ref<FormInstance>()
const step2Ref = ref<FormInstance>()
const step3Ref = ref<FormInstance>()
const step5Ref = ref<FormInstance>()
const photos = ref<File[]>([])
const documents = ref<File[]>([])
const video = ref<File>()
const DRAFT_KEY = 'ec-problem-input-draft'
let draftTimer: ReturnType<typeof setTimeout> | undefined
let draftStorageWarned = false

function cancelDraftSave(): void {
  if (!draftTimer) return
  clearTimeout(draftTimer)
  draftTimer = undefined
}

function removeDraft(): void {
  cancelDraftSave()
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // 浏览器禁用本地存储时不影响表单主流程。
  }
}

function scheduleDraftSave(): void {
  cancelDraftSave()
  draftTimer = setTimeout(() => {
    draftTimer = undefined
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    } catch {
      if (!draftStorageWarned) {
        draftStorageWarned = true
        ElMessage.warning('浏览器无法保存录入草稿，请及时提交当前内容')
      }
    }
  }, 400)
}

const form = reactive({
  title: '',
  content: '',
  discoveredDate: new Date().toISOString().slice(0, 10),
  source: '日常巡查',
  regionCode: '451000',
  regionName: '右江区',
  pollutionType: '水',
  pollutionLevel2: '',
  pollutionLevel3: '',
  category: '',
  industry: '',
  entityName: '',
  riskTags: [] as string[],
  responsibleUnit: '',
  responsiblePerson: '',
  deadline: '',
  requirements: '',
  supervisionLevel: '市级督办',
  ccUnits: [] as string[],
  address: '',
  lngText: '',
  latText: '',
  sourceGrade: undefined as Grade | undefined,
  riskGrade: undefined as Grade | undefined,
})

const rules1: FormRules = {
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' },
    { min: 5, max: 100, message: '问题标题需为 5～100 个字符', trigger: 'blur' },
  ],
  discoveredDate: [{ required: true, message: '请选择发现日期', trigger: 'change' }],
  content: [
    { required: true, message: '请输入问题内容', trigger: 'blur' },
    { min: 10, max: 1000, message: '问题内容需为 10～1000 个字符', trigger: 'blur' },
  ],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  regionCode: [{ required: true, message: '请选择区域', trigger: 'change' }],
}

const rules2: FormRules = {
  pollutionType: [{ required: true, message: '请选择污染类型一级', trigger: 'change' }],
  pollutionLevel2: [{ required: true, message: '请选择污染类型二级', trigger: 'change' }],
  category: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
  industry: [{ required: true, message: '请输入行业类别', trigger: 'blur' }],
}

const rules3: FormRules = {
  responsibleUnit: [{ required: true, message: '请填写责任单位', trigger: 'blur' }],
  responsiblePerson: [{ required: true, message: '请填写责任人', trigger: 'blur' }],
  requirements: [{ required: true, message: '请填写整改要求及验收标准', trigger: 'blur' }],
  deadline: [
    { required: true, message: '请选择整改时限', trigger: 'change' },
    {
      validator: (_rule, value, callback) =>
        value && value < new Date().toISOString().slice(0, 10)
          ? callback(new Error('整改时限不能早于今天'))
          : callback(),
      trigger: 'change',
    },
  ],
}

const rules5: FormRules = {
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  lngText: [{ required: true, message: '请输入经纬度坐标', trigger: 'blur' }],
}

/** 标题自动推断类别 */
const autoCategory = computed(() => inferCategory(form.title))
const level2Options = computed(() => POLLUTION_LEVEL2[form.pollutionType] || [])
const level3Options = computed(() => POLLUTION_LEVEL3[form.pollutionLevel2] || [])
const problemNoPreview = computed(
  () => `STHB-${form.discoveredDate.replace(/-/g, '') || '待选择'}-待生成`,
)

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

function onPollutionLevel1Change(): void {
  form.pollutionLevel2 = ''
  form.pollutionLevel3 = ''
  onAutoTag()
}

function onPollutionLevel2Change(): void {
  form.pollutionLevel3 = ''
}

function acceptAutoCategory(): void {
  if (!autoCategory.value) return
  form.category = autoCategory.value
  ElMessage.success('已采纳系统推荐分类')
}

function acceptAutoTags(): void {
  onAutoTag()
  ElMessage.success('已采纳系统推荐标签')
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
  if (currentStep.value === 1 && step2Ref.value) {
    const ok = await step2Ref.value.validate().catch(() => false)
    if (!ok) return
  }
  if (currentStep.value === 2 && step3Ref.value) {
    const ok = await step3Ref.value.validate().catch(() => false)
    if (!ok) return
  }
  if (currentStep.value === 4 && step5Ref.value) {
    const ok = await step5Ref.value.validate().catch(() => false)
    if (!ok || !validateCoordinates()) return
  }
  if (currentStep.value === 0) onAutoTag()
  currentStep.value++
}

function goStep(target: number): void {
  if (target <= currentStep.value) {
    currentStep.value = target
    return
  }
  ElMessage.info('请先完成当前步骤并点击“下一步”')
}

function useRegionCenter(): void {
  const center = REGION_CENTERS[form.regionName]
  if (!center) {
    ElMessage.warning('当前区域暂无可用中心点坐标')
    return
  }
  form.lngText = String(center.lng)
  form.latText = String(center.lat)
  if (!form.address) form.address = `${form.regionName}（区域中心点）`
  step5Ref.value?.clearValidate('lngText')
  ElMessage.success('已填入所属区域中心点，可继续修改为精确位置')
}

function validateCoordinates(): boolean {
  if (!form.lngText || !form.latText) {
    ElMessage.warning('经度和纬度必须成对填写')
    return false
  }
  const lng = Number(form.lngText)
  const lat = Number(form.latText)
  if (
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180 ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90
  ) {
    ElMessage.warning('请输入有效坐标：经度 -180～180，纬度 -90～90')
    return false
  }
  return true
}

function onPhotoChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  const invalid = files.find(
    (file) => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 20 * 1024 * 1024,
  )
  if (invalid) {
    ElMessage.error(`${invalid.name} 格式不支持或超过 20MB`)
    input.value = ''
    return
  }
  if (new Set([...photos.value, ...files].map((file) => file.name)).size > 9) {
    ElMessage.warning('现场照片最多上传 9 张，请移除后再添加')
    input.value = ''
    return
  }
  photos.value = Array.from(
    new Map([...photos.value, ...files].map((file) => [file.name, file])).values(),
  )
  input.value = ''
  ElMessage.success(`已添加现场照片，当前共 ${photos.value.length} 张`)
}

function removePhoto(name: string): void {
  photos.value = photos.value.filter((file) => file.name !== name)
  ElMessage.success('照片已移除')
}

function clearPhotos(): void {
  photos.value = []
  ElMessage.success('现场照片已清空')
}

function onDocumentChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
  const invalid = files.find(
    (file) =>
      file.size > 50 * 1024 * 1024 ||
      !allowedExtensions.some((extension) => file.name.toLowerCase().endsWith(extension)),
  )
  if (invalid) {
    ElMessage.error(`${invalid.name} 格式不支持或超过 50MB`)
    input.value = ''
    return
  }
  documents.value = Array.from(
    new Map([...documents.value, ...files].map((file) => [file.name, file])).values(),
  )
  input.value = ''
  ElMessage.success(`已添加证明文档，当前共 ${documents.value.length} 个`)
}

function removeDocument(name: string): void {
  documents.value = documents.value.filter((file) => file.name !== name)
  ElMessage.success('证明文档已移除')
}

function onVideoChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!['video/mp4', 'video/quicktime'].includes(file.type) || file.size > 100 * 1024 * 1024) {
    ElMessage.error('视频仅支持 MP4/MOV，且不能超过 100MB')
    input.value = ''
    return
  }
  video.value = file
  input.value = ''
  ElMessage.success('视频资料已添加')
}

function removeVideo(): void {
  video.value = undefined
  ElMessage.success('视频资料已移除')
}

async function clearForm(): Promise<void> {
  try {
    await ElMessageBox.confirm('将清空当前页面所有已填写内容和附件，是否继续？', '清空重填', {
      type: 'warning',
      confirmButtonText: '确认清空',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  Object.assign(form, {
    title: '',
    content: '',
    discoveredDate: new Date().toISOString().slice(0, 10),
    source: '日常巡查',
    regionCode: '451000',
    regionName: '右江区',
    pollutionType: '水',
    pollutionLevel2: '',
    pollutionLevel3: '',
    category: '',
    industry: '',
    entityName: '',
    riskTags: [],
    responsibleUnit: '',
    responsiblePerson: '',
    deadline: '',
    requirements: '',
    supervisionLevel: '市级督办',
    ccUnits: [],
    address: '',
    lngText: '',
    latText: '',
    sourceGrade: undefined,
    riskGrade: undefined,
  })
  photos.value = []
  documents.value = []
  video.value = undefined
  currentStep.value = 0
  step1Ref.value?.clearValidate()
  step2Ref.value?.clearValidate()
  step3Ref.value?.clearValidate()
  step5Ref.value?.clearValidate()
  await nextTick()
  removeDraft()
  ElMessage.success('录入内容已清空')
}

async function submit(): Promise<void> {
  if (submitting.value) return
  const step1Valid = await step1Ref.value?.validate().catch(() => false)
  const step2Valid = await step2Ref.value?.validate().catch(() => false)
  const step3Valid = await step3Ref.value?.validate().catch(() => false)
  const step5Valid = await step5Ref.value?.validate().catch(() => false)
  if (!step1Valid || !step2Valid || !step3Valid || !step5Valid || !validateCoordinates()) {
    ElMessage.warning('请先补齐并检查所有必填项')
    return
  }
  if (photos.value.length < 2) {
    ElMessage.warning('请至少上传 2 张能反映问题现状的现场照片')
    return
  }
  const lng = Number(form.lngText)
  const lat = Number(form.latText)
  submitting.value = true
  try {
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      discoveredDate: form.discoveredDate,
      source: form.source,
      regionCode: form.regionCode,
      regionName: form.regionName,
      pollutionType: form.pollutionType,
      pollutionLevel2: form.pollutionLevel2,
      pollutionLevel3: form.pollutionLevel3 || undefined,
      category: form.category || autoCategory.value || undefined,
      industry: form.industry.trim(),
      entityName: form.entityName.trim() || undefined,
      riskTags: form.riskTags.length ? form.riskTags : autoTags.value,
      responsibleUnit: form.responsibleUnit.trim(),
      responsiblePerson: form.responsiblePerson.trim(),
      requirements: form.requirements.trim(),
      supervisionLevel: form.supervisionLevel,
      ccUnits: form.ccUnits,
      address: form.address.trim(),
      deadline: form.deadline,
      lng,
      lat,
      importantLevel: levelResult.value.level,
      sourceGrade: levelResult.value.sourceGrade,
      riskGrade: levelResult.value.riskGrade,
      attachments: [...photos.value, ...documents.value, ...(video.value ? [video.value] : [])].map(
        (file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        }),
      ),
    }
    const created = await problemApi.create(payload)
    problemStore.addCreatedProblem(created)
    removeDraft()
    ElMessage.success(`录入成功：${created.problemNo}（${levelResult.value.label}）`)
    router.push(`/problem/${created.id}`)
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : '服务暂不可用'
    ElMessage.error(`录入失败：${message}，请检查网络后重试`)
  } finally {
    submitting.value = false
  }
}

watch(form, scheduleDraftSave, { deep: true })

onMounted(() => {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(DRAFT_KEY)
  } catch {
    draftStorageWarned = true
  }
  if (!saved) return
  try {
    Object.assign(form, JSON.parse(saved))
    ElMessage.info('已恢复上次未提交的录入草稿')
  } catch {
    removeDraft()
  }
})

onBeforeUnmount(cancelDraftSave)
</script>

<style scoped lang="scss">
.page-heading {
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

.form-card {
  max-width: 960px;
  margin: 0 auto;
  border-radius: 12px;
}

.form-card :deep(.el-card__body) {
  padding: 24px;
}

.steps {
  margin-bottom: 32px;
}

.clickable-step {
  cursor: pointer;
}

.step-body {
  min-height: 260px;
}

.lnglat-row {
  display: flex;
  gap: 12px;
}

.address-row {
  display: flex;
  width: 100%;
  gap: 8px;
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

.location-preview {
  display: grid;
  height: 220px;
  color: #1a5f2a;
  text-align: center;
  background-color: #f1f8e9;
  background-image:
    linear-gradient(rgb(26 95 42 / 8%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(26 95 42 / 8%) 1px, transparent 1px);
  background-size: 40px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  place-content: center;
}

.location-preview span {
  font-size: 16px;
  font-weight: 700;
}

.location-preview small {
  margin-top: 8px;
  color: #6b7280;
}

.upload-step {
  display: grid;
  gap: 14px;
}

.upload-title {
  font-weight: 600;
}

.upload-title em {
  color: #e53935;
  font-style: normal;
}

.upload-title small {
  margin-left: 10px;
  color: #6b7280;
  font-weight: 400;
}

.upload-entry {
  display: grid;
  min-height: 105px;
  color: #6b7280;
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  place-content: center;
}

.upload-entry:hover {
  color: #1a5f2a;
  border-color: #1a5f2a;
}

.upload-entry input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.upload-entry b {
  color: #1a1a2e;
}

.upload-entry span {
  margin-top: 5px;
  font-size: 12px;
}

.file-list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  background: #f9fbf8;
  border-radius: 6px;
}

.file-list button {
  color: #e53935;
  background: none;
  border: 0;
  cursor: pointer;
}

.submit-note {
  padding: 12px 14px;
  color: #6b7280;
  font-size: 12px;
  background: #f9fbf8;
  border-left: 3px solid #1a5f2a;
}

@media (width <= 768px) {
  .form-card :deep(.el-card__body) {
    padding: 16px;
  }

  .steps {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .steps :deep(.el-step) {
    min-width: 110px;
  }

  .lnglat-row,
  .address-row {
    flex-direction: column;
  }

  .upload-title small {
    display: block;
    margin: 4px 0 0;
  }

  .step-actions {
    position: sticky;
    bottom: 0;
    z-index: 5;
    padding: 12px 0;
    background: #fff;
    flex-wrap: wrap;
  }
}
</style>
