<template>
  <span class="matrix-cell" :style="{ backgroundColor: bgColor, color: fgColor }">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
/**
 * 定级矩阵单元格（红/橙/绿三色）
 * @props value 重要等级 red/orange/green
 */
import { computed } from 'vue'
import type { ImportantLevel } from '@/utils/level'

const props = defineProps<{ value: ImportantLevel }>()

const LEVEL_TEXT: Record<ImportantLevel, string> = { red: '红', orange: '橙', green: '绿' }
const LEVEL_BG: Record<ImportantLevel, string> = {
  red: '#fdecea',
  orange: '#fdf1e7',
  green: '#eaf4ee',
}
const LEVEL_FG: Record<ImportantLevel, string> = {
  red: '#e53935',
  orange: '#fb8c00',
  green: '#43a047',
}

const text = computed(() => LEVEL_TEXT[props.value])
const bgColor = computed(() => LEVEL_BG[props.value])
const fgColor = computed(() => LEVEL_FG[props.value])
</script>

<style scoped lang="scss">
.matrix-cell {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 4px;
  font-weight: 600;
}
</style>
