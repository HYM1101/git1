<template>
  <div class="progress-bar-wrap">
    <div class="bar-track">
      <div
        v-for="seg in segments"
        :key="seg.key"
        class="bar-seg"
        :style="{
          width: `${seg.width}%`,
          backgroundColor: seg.color,
          opacity: seg.active ? 1 : 0.25,
        }"
        :title="`${seg.label}：${seg.value} 分`"
      />
    </div>
    <div class="bar-meta">
      <span v-for="seg in segments" :key="seg.key" class="bar-legend">
        <i :style="{ backgroundColor: seg.color }" />
        {{ seg.label }} {{ seg.value }}
      </span>
      <span class="bar-total" :class="{ done: total >= 100 }">{{ total }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 三扇区进度条（整改 30/30/40 权重展示）
 * @props total 总进度 0-100
 * @props measures 整改措施分（0|30）
 * @props effect 整改成效分（0|30）
 * @props attachments 佐证附件分（0|40）
 * 三扇区色：措施 #00897b / 成效 #1565c0 / 附件 #6a1b9a
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    total: number
    measures?: number
    effect?: number
    attachments?: number
  }>(),
  { measures: 0, effect: 0, attachments: 0 },
)

const segments = computed(() => {
  const segs = [
    { key: 'measures', label: '措施', value: props.measures, color: '#00897b' },
    { key: 'effect', label: '成效', value: props.effect, color: '#1565c0' },
    { key: 'attachments', label: '佐证', value: props.attachments, color: '#6a1b9a' },
  ]
  return segs.map((s) => ({ ...s, width: s.value, active: s.value > 0 }))
})
</script>

<style scoped lang="scss">
.progress-bar-wrap {
  .bar-track {
    display: flex;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    background: #f0f2f5;
    gap: 2px;

    .bar-seg {
      height: 100%;
      transition: width 0.3s;
    }
  }

  .bar-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    font-size: 12px;
    color: #909399;

    .bar-legend {
      display: inline-flex;
      align-items: center;
      gap: 4px;

      i {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        display: inline-block;
      }
    }

    .bar-total {
      margin-left: auto;
      font-weight: 600;
      color: #303133;

      &.done {
        color: #43a047;
      }
    }
  }
}
</style>
