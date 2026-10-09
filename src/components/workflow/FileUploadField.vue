<template>
  <div class="workflow-upload">
    <span>{{ label }}</span>
    <label class="workflow-upload__box">
      <b>☁</b>
      <span>点击上传验收核查照片、报告等</span>
      <small>支持 JPG、PNG、PDF、DOC 格式</small>
      <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" @change="selectFiles" />
    </label>
    <div v-if="modelValue.length" class="workflow-upload__list">
      <span v-for="file in modelValue" :key="`${file.name}-${file.size}`">
        {{ file.name }}<button type="button" @click="remove(file)">×</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const props = defineProps<{ modelValue: File[]; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [files: File[]] }>()

function selectFiles(event: Event): void {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files || [])
  const invalid = selected.find((file) => file.size > 20 * 1024 * 1024)
  if (invalid) {
    ElMessage.error(`${invalid.name} 超过 20MB`)
    input.value = ''
    return
  }
  const merged = new Map([...props.modelValue, ...selected].map((file) => [file.name, file]))
  emit('update:modelValue', [...merged.values()])
  input.value = ''
}

function remove(target: File): void {
  emit(
    'update:modelValue',
    props.modelValue.filter((file) => file !== target),
  )
}
</script>

<style scoped lang="scss">
.workflow-upload {
  display: grid;
  gap: 7px;
  margin-bottom: 16px;
  color: #596273;
  font-size: 12px;
}

.workflow-upload__box {
  display: grid;
  min-height: 128px;
  color: #697386;
  text-align: center;
  border: 1px dashed #d5dde6;
  border-radius: 8px;
  cursor: pointer;
  place-content: center;
  gap: 5px;
}

.workflow-upload__box:hover {
  color: #1a5f2a;
  background: #f8faf7;
  border-color: #81c784;
}

.workflow-upload__box b {
  font-size: 20px;
}

.workflow-upload__box small {
  font-size: 11px;
}

.workflow-upload__box input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.workflow-upload__list {
  display: grid;
  gap: 4px;
}

.workflow-upload__list > span {
  display: flex;
  justify-content: space-between;
  padding: 6px 9px;
  color: #374151;
  background: #f8faf7;
  border-radius: 5px;
}

.workflow-upload__list button {
  color: #e53935;
  background: none;
  border: 0;
  cursor: pointer;
}
</style>
