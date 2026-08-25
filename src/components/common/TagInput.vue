<template>
  <div class="tag-input">
    <el-tag
      v-for="tag in modelValue"
      :key="tag"
      closable
      disable-transitions
      class="tag"
      @close="removeTag(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      v-if="inputVisible"
      ref="inputRef"
      v-model="inputValue"
      size="small"
      class="input"
      @keyup.enter="confirmTag"
      @blur="confirmTag"
    />
    <el-button v-else size="small" class="add-btn" @click="showInput">+ 添加</el-button>
  </div>
</template>

<script setup lang="ts">
/**
 * TagInput 标签输入（v-model 受控，回车/失焦确认，去重）
 * @example <TagInput v-model="form.riskTags" :suggestions="['重金属污染','信访风险']" />
 */
import { ref, nextTick } from 'vue'
import { ElMessage, ElInput } from 'element-plus'

const props = withDefaults(
  defineProps<{
    /** 标签数组（v-model） */
    modelValue: string[]
    /** 预置可选标签 */
    suggestions?: string[]
    /** 最大标签数 */
    max?: number
  }>(),
  { suggestions: () => [], max: 10 },
)

const emit = defineEmits<{
  (e: 'update:modelValue', tags: string[]): void
}>()

const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref<InstanceType<typeof ElInput>>()

function showInput(): void {
  inputVisible.value = true
  nextTick(() => inputRef.value?.focus())
}

function removeTag(tag: string): void {
  emit(
    'update:modelValue',
    props.modelValue.filter((t) => t !== tag),
  )
}

function confirmTag(): void {
  const val = inputValue.value.trim()
  if (val) {
    if (props.modelValue.includes(val)) {
      ElMessage.warning('标签已存在')
    } else if (props.modelValue.length >= props.max) {
      ElMessage.warning(`最多 ${props.max} 个标签`)
    } else {
      emit('update:modelValue', [...props.modelValue, val])
    }
  }
  inputValue.value = ''
  inputVisible.value = false
}
</script>

<style scoped lang="scss">
.tag-input {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .tag {
    margin-right: 0;
  }

  .input {
    width: 120px;
  }

  .add-btn {
    border-style: dashed;
  }
}
</style>
