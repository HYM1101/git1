<template>
  <span
    class="level-tag"
    :style="{ backgroundColor: bgColor, color: fgColor, borderColor: fgColor }"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IMPORTANT_LEVEL_COLORS, IMPORTANT_LEVEL_LABELS } from '@/constants'
import type { ImportantLevel } from '@/utils/level'

const props = defineProps<{
  level: ImportantLevel
}>()

const bgColor = computed(() => `${IMPORTANT_LEVEL_COLORS[props.level]}15`)
const fgColor = computed(() => IMPORTANT_LEVEL_COLORS[props.level])
const label = computed(() => IMPORTANT_LEVEL_LABELS[props.level])
</script>

<style scoped lang="scss">
.level-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
}
</style>
