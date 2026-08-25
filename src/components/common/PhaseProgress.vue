<template>
  <div class="phase-progress">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${percent}%`, backgroundColor: fillColor }" />
    </div>
    <div class="progress-meta">
      <span class="progress-text">{{ percent }}%</span>
      <span v-if="showPhases" class="phase-labels">
        <span
          v-for="(phase, i) in phases"
          :key="phase.name"
          class="phase-label"
          :class="{ done: i < completedCount }"
        >
          {{ phase.name }}
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PhaseProgress 整改阶段进度条（按阶段权重计算百分比）
 * @example
 * <PhaseProgress :phases="getPhases('水')" :completed-indexes="[0,1,2]" />
 * <PhaseProgress :percent="45" show-phases />
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 阶段定义（来自 constants/phases） */
    phases?: { name: string; weight: number }[]
    /** 已完成阶段的下标集合 */
    completedIndexes?: number[]
    /** 直接传百分比（与 phases 二选一，优先 percent） */
    percent?: number
    /** 是否展示阶段名 */
    showPhases?: boolean
  }>(),
  { phases: () => [], completedIndexes: () => [], percent: 0, showPhases: false },
)

const completedCount = computed(() => props.completedIndexes.length)

/** 由阶段权重汇总进度 */
const percent = computed(() => {
  if (props.phases.length > 0) {
    let total = 0
    props.phases.forEach((phase, idx) => {
      if (props.completedIndexes.includes(idx)) total += phase.weight
    })
    return Math.min(100, total)
  }
  return Math.min(100, Math.max(0, props.percent))
})

const fillColor = computed(() => {
  const p = percent.value
  if (p >= 100) return '#43A047'
  if (p >= 60) return '#2B7A4B'
  if (p >= 30) return '#FB8C00'
  return '#E53935'
})
</script>

<style scoped lang="scss">
.phase-progress {
  width: 100%;

  .progress-track {
    height: 8px;
    background: #f0f2f5;
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }
  }

  .progress-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  .progress-text {
    font-size: 12px;
    font-weight: 600;
    color: #606266;
  }

  .phase-labels {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .phase-label {
    font-size: 11px;
    color: #c0c4cc;

    &.done {
      color: #2b7a4b;
      font-weight: 500;
    }
  }
}
</style>
