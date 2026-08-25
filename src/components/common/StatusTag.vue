<template>
  <span class="status-tag" :style="{ color, backgroundColor: `${color}15` }">
    <span class="dot" :style="{ backgroundColor: color }" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
/**
 * StatusTag 问题状态标签
 * @example <StatusTag :status="row.status" />
 */
import { computed } from 'vue'
import { STATUS_COLORS } from '@/constants'
import { STATUS_LABELS } from '@/utils/status'
import type { ProblemStatus } from '@/utils/status'

const props = defineProps<{
  /** 问题状态枚举 */
  status: ProblemStatus
}>()

const label = computed(() => STATUS_LABELS[props.status])
const color = computed(() => STATUS_COLORS[props.status])
</script>

<style scoped lang="scss">
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}
</style>
