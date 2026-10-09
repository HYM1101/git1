<template>
  <el-dialog
    v-model="visible"
    :title="mode === 'accept' ? '验收通过确认' : '验收驳回说明报告'"
    width="550px"
    append-to-body
    align-center
    class="workflow-dialog"
    :class="`workflow-dialog--${mode}`"
    :close-on-click-modal="false"
    :close-on-press-escape="!loading"
    :show-close="!loading"
  >
    <div v-if="problem" class="workflow-body">
      <section class="workflow-problem">
        <div>
          <small>问题编号</small><b>{{ problem.problemNo }}</b>
        </div>
        <div>
          <small>问题标题</small><span>{{ problem.title }}</span>
        </div>
        <div>
          <small>责任单位</small><span class="brand">{{ problem.responsibleUnit || '—' }}</span>
        </div>
      </section>

      <template v-if="mode === 'accept'">
        <section class="accept-notice">
          <b>● 验收通过确认</b>
          <p>
            确认该问题整改已完成，所有整改措施和材料均已核查通过。验收通过后问题将正式销号，流程结束。
          </p>
        </section>
        <label class="workflow-field">
          <span>验收意见 <i>*</i></span>
          <textarea
            v-model.trim="form.opinion"
            rows="3"
            placeholder="请填写验收意见，如：经现场核查，整改到位，各项指标达标，同意验收通过…"
          />
        </label>
        <FileUploadField v-model="acceptFiles" label="验收材料（可选）" />
      </template>

      <template v-else>
        <label class="workflow-field">
          <span>驳回原因 <i>*</i></span>
          <textarea
            v-model.trim="form.reason"
            rows="3"
            placeholder="请填写验收驳回原因，如：整改措施未落实到位，现场核查不达标…"
          />
        </label>
        <label class="workflow-field">
          <span>整改要求 <i>*</i></span>
          <textarea
            v-model.trim="form.requirement"
            rows="3"
            placeholder="请填写后续整改要求及完成时限，如：请于15日内完成以下整改内容并重新提交验收申请…"
          />
        </label>
        <fieldset class="workflow-options">
          <legend>是否更换责任单位</legend>
          <label
            ><input v-model="form.changeResponsible" type="radio" :value="false" />不更换</label
          >
          <label><input v-model="form.changeResponsible" type="radio" :value="true" />更换</label>
          <select v-if="form.changeResponsible" v-model="form.newResponsible">
            <option value="">请选择新的责任单位…</option>
            <option v-for="unit in responsibleUnits" :key="unit">{{ unit }}</option>
          </select>
        </fieldset>
        <fieldset class="workflow-options">
          <legend>是否延长整改期限</legend>
          <label><input v-model="form.extendDeadline" type="radio" :value="false" />不延长</label>
          <label><input v-model="form.extendDeadline" type="radio" :value="true" />延长</label>
          <input
            v-if="form.extendDeadline"
            v-model="form.newDeadline"
            type="date"
            :min="today"
            aria-label="新的整改期限"
          />
        </fieldset>
        <FileUploadField v-model="rejectFiles" label="验收材料（可选）" />
        <label class="workflow-field">
          <span>附件说明（可选）</span>
          <textarea
            v-model.trim="form.attachmentDescription"
            rows="2"
            placeholder="如需补充附件，请说明附件名称及内容…"
          />
        </label>
        <p class="reject-notice">
          <b>提示：</b>驳回说明报告将下发至责任单位，责任人将收到整改任务通知并重新开展整改工作。
        </p>
      </template>
    </div>

    <template #footer>
      <button class="workflow-button" type="button" :disabled="loading" @click="visible = false">
        取消
      </button>
      <button
        class="workflow-button workflow-button--primary"
        :class="mode"
        type="button"
        :disabled="loading"
        @click="submit"
      >
        {{ loading ? '提交中…' : mode === 'accept' ? '确认验收通过' : '确认驳回并下发报告' }}
      </button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import FileUploadField from '@/components/workflow/FileUploadField.vue'
import type { Problem } from '@/types'
import type { WorkflowPayload } from '@/types/workflow'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: 'accept' | 'reject'
    problem: Problem | null
    loading?: boolean
  }>(),
  { loading: false },
)
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: WorkflowPayload]
}>()

const visible = ref(props.modelValue)
const acceptFiles = ref<File[]>([])
const rejectFiles = ref<File[]>([])
const today = new Date().toISOString().slice(0, 10)
const responsibleUnits = [
  'A县生态环境局',
  'B县生态环境局',
  'C县生态环境局',
  'D县生态环境局',
  'A县住建局',
  'B县自然资源局',
]
const form = reactive({
  opinion: '',
  reason: '',
  requirement: '',
  changeResponsible: false,
  newResponsible: '',
  extendDeadline: false,
  newDeadline: '',
  attachmentDescription: '',
})

function reset(): void {
  Object.assign(form, {
    opinion: '',
    reason: '',
    requirement: '',
    changeResponsible: false,
    newResponsible: '',
    extendDeadline: false,
    newDeadline: '',
    attachmentDescription: '',
  })
  acceptFiles.value = []
  rejectFiles.value = []
}

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value
    if (value) reset()
  },
)
watch(visible, (value) => emit('update:modelValue', value))

function submit(): void {
  if (props.mode === 'accept' && !form.opinion) {
    ElMessage.warning('请填写验收意见')
    return
  }
  if (props.mode === 'reject') {
    if (!form.reason || !form.requirement) {
      ElMessage.warning('请填写驳回原因和整改要求')
      return
    }
    if (form.changeResponsible && !form.newResponsible) {
      ElMessage.warning('请选择新的责任单位')
      return
    }
    if (form.extendDeadline && !form.newDeadline) {
      ElMessage.warning('请选择新的整改期限')
      return
    }
  }
  emit('submit', {
    opinion: form.opinion || undefined,
    reason: form.reason || undefined,
    requirement: form.requirement || undefined,
    changeResponsible: form.changeResponsible,
    newResponsible: form.newResponsible || undefined,
    extendDeadline: form.extendDeadline,
    newDeadline: form.newDeadline || undefined,
    files: props.mode === 'accept' ? acceptFiles.value : rejectFiles.value,
    attachmentDescription: form.attachmentDescription || undefined,
  })
}
</script>

<style lang="scss">
.workflow-dialog {
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 20%);
}

.workflow-dialog .el-dialog__header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.workflow-dialog .el-dialog__title {
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.workflow-dialog--accept .el-dialog__title::before {
  margin-right: 6px;
  color: #43a047;
  content: '▣';
}

.workflow-dialog--reject .el-dialog__title::before {
  margin-right: 6px;
  color: #e53935;
  content: '▤';
}

.workflow-dialog .el-dialog__body {
  max-height: 68vh;
  padding: 20px;
  overflow-y: auto;
}

.workflow-dialog .el-dialog__footer {
  padding: 14px 20px;
  border-top: 1px solid #e5e7eb;
}

.workflow-problem {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.workflow-problem small,
.workflow-problem b,
.workflow-problem span {
  display: block;
}

.workflow-problem small {
  margin-bottom: 4px;
  color: #6b7280;
  font-size: 12px;
}

.workflow-problem b,
.workflow-problem span {
  color: #1a1a2e;
  font-size: 13px;
}

.workflow-problem b {
  font-size: 14px;
}

.workflow-problem .brand {
  color: #1a5f2a;
}

.accept-notice {
  padding: 14px;
  margin-bottom: 16px;
  color: #1b5e20;
  background: #e8f5e9;
  border-radius: 8px;
}

.accept-notice b {
  font-size: 15px;
}

.accept-notice p {
  margin: 8px 0 0;
  color: #26352a;
  font-size: 12px;
  line-height: 1.7;
}

.workflow-field {
  display: grid;
  gap: 7px;
  margin-bottom: 16px;
  color: #596273;
  font-size: 12px;
}

.workflow-field i {
  color: #e53935;
  font-style: normal;
}

.workflow-field textarea,
.workflow-options select,
.workflow-options > input[type='date'] {
  width: 100%;
  padding: 10px 12px;
  color: #1a1a2e;
  font: inherit;
  background: #f8faf7;
  border: 1px solid #dfe5df;
  border-radius: 8px;
  outline: none;
}

.workflow-field textarea:focus,
.workflow-options select:focus,
.workflow-options > input[type='date']:focus {
  background: #fff;
  border-color: #1a5f2a;
  box-shadow: 0 0 0 3px rgb(26 95 42 / 8%);
}

.workflow-options {
  padding: 0;
  margin: 0 0 16px;
  border: 0;
}

.workflow-options legend {
  margin-bottom: 8px;
  color: #596273;
  font-size: 12px;
}

.workflow-options label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 16px;
  font-size: 13px;
}

.workflow-options select,
.workflow-options > input[type='date'] {
  height: 38px;
  margin-top: 9px;
}

.reject-notice {
  padding: 11px 13px;
  margin: 0;
  color: #6f4618;
  background: #fff3e0;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.6;
}

.workflow-button {
  min-height: 38px;
  padding: 0 17px;
  color: #374151;
  background: #fff;
  border: 1px solid #dfe5df;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.workflow-button--primary {
  color: #fff;
  border: 0;
}

.workflow-button--primary.accept {
  background: #43a047;
}

.workflow-button--primary.reject {
  background: #e53935;
}

.workflow-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (width <= 600px) {
  .workflow-dialog {
    width: calc(100vw - 24px) !important;
    margin-top: 2vh !important;
  }
}
</style>
