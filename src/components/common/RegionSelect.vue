<template>
  <el-select v-model="value" :placeholder="placeholder" :clearable="clearable" style="width: 100%">
    <el-option v-for="r in regions" :key="r.code" :label="r.name" :value="r.code" />
  </el-select>
</template>

<script setup lang="ts">
/**
 * 区县选择器（与百色市 12 区县口径对齐）
 * @props modelValue 选中区县编码
 * @props placeholder 占位文案
 * @emits update:modelValue
 */
import { computed } from 'vue'
import { REGIONS } from '@/constants'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  clearable?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [code: string | undefined] }>()

const regions = REGIONS

const value = computed({
  get: () => props.modelValue,
  set: (v: string | undefined) => emit('update:modelValue', v),
})
</script>
