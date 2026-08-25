<template>
  <div class="level-badge" :style="{ borderColor: color, color }">
    <span class="badge-label">{{ label }}</span>
    <span class="badge-sub">{{ subLabel }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * 大号等级徽章（问题详情/录入预览用）
 * @props level 重要等级 red/orange/green
 * @props subLabel 副文案（如定级依据）
 */
import { computed } from 'vue'
import { IMPORTANT_LEVEL_COLORS, IMPORTANT_LEVEL_LABELS } from '@/constants'
import type { ImportantLevel } from '@/utils/level'

const props = withDefaults(
  defineProps<{
    level: ImportantLevel
    subLabel?: string
  }>(),
  { subLabel: undefined },
)

const color = computed(() => IMPORTANT_LEVEL_COLORS[props.level])
const label = computed(() => IMPORTANT_LEVEL_LABELS[props.level])
</script>

<style scoped lang="scss">
.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: 2px solid;
  border-radius: 8px;
  background: #fff;

  .badge-label {
    font-size: 16px;
    font-weight: 700;
  }

  .badge-sub {
    font-size: 12px;
    opacity: 0.75;
  }
}
</style>
