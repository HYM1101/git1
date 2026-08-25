<template>
  <el-progress
    type="circle"
    :percentage="percent"
    :width="width"
    :stroke-width="strokeWidth"
    :color="ringColor"
    :status="status"
  >
    <span class="ring-text" :style="{ fontSize: width / 5 }">{{ percent }}%</span>
  </el-progress>
</template>

<script setup lang="ts">
/**
 * ProgressRing 环形进度（整改进度展示）
 * @example <ProgressRing :percent="detail.progress" :width="120" />
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 百分比 0-100 */
    percent: number
    /** 圆环直径 */
    width?: number
    /** 描边宽度 */
    strokeWidth?: number
  }>(),
  { width: 100, strokeWidth: 8 },
)

const clamped = computed(() => Math.min(100, Math.max(0, props.percent)))

const status = computed(() => {
  if (clamped.value >= 100) return 'success' as const
  if (clamped.value < 30) return 'exception' as const
  return undefined
})

const ringColor = computed(() => {
  if (clamped.value >= 100) return '#43A047'
  if (clamped.value >= 60) return '#2B7A4B'
  if (clamped.value >= 30) return '#FB8C00'
  return '#E53935'
})
</script>

<style scoped lang="scss">
.ring-text {
  font-weight: 600;
  color: #303133;
}
</style>
