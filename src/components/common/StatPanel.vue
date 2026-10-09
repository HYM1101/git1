<template>
  <div class="stat-panel" :style="{ borderColor: color, backgroundColor: `${color}08` }">
    <div class="panel-header">
      <span class="panel-dot" :style="{ backgroundColor: color }" />
      <span class="panel-label">{{ label }}</span>
      <span class="panel-value" :style="{ color }">{{ value }}</span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * StatPanel 预警统计面板（带主题色边框与数值）
 * @example
 * <StatPanel label="红色三级预警" :value="12" color="#E53935">
 *   <div class="list">...</div>
 * </StatPanel>
 */
withDefaults(
  defineProps<{
    /** 面板标题 */
    label: string
    /** 数值 */
    value: number | string
    /** 主题色 */
    color?: string
  }>(),
  { color: '#1A5F2A' },
)
</script>

<style scoped lang="scss">
.stat-panel {
  border: 1px solid;
  padding: 16px 18px;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .panel-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .panel-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    flex: 1;
  }

  .panel-value {
    font-size: 18px;
    font-weight: 700;
  }
}
</style>
