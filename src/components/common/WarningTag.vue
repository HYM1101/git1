<template>
  <span class="warning-tag" :style="{ backgroundColor: bgColor }">
    <span class="dot" :style="{ backgroundColor: dotColor }" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WARNING_LEVEL_COLORS, WARNING_LEVEL_LABELS } from '@/constants'
import type { WarningLevel } from '@/utils/warning'

const props = defineProps<{
  level: WarningLevel
}>()

const bgColor = computed(() => WARNING_LEVEL_COLORS[props.level])
const label = computed(() => WARNING_LEVEL_LABELS[props.level])
const dotColor = computed(() => {
  const map: Record<WarningLevel, string> = {
    red: '#e53935',
    orange: '#fb8c00',
    yellow: '#fdd835',
    green: '#43a047',
  }
  return map[props.level]
})
</script>

<style scoped lang="scss">
.warning-tag {
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
