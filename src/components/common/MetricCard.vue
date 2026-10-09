<template>
  <article class="metric-card">
    <span class="metric-icon" :style="{ color, backgroundColor: `${color}12` }">
      <el-icon :size="20"><component :is="icon" /></el-icon>
    </span>
    <div class="metric-content">
      <span class="metric-label">{{ label }}</span>
      <strong>{{ value }}</strong>
      <span class="metric-helper" :style="{ color: helperColor || color }">{{ helper }}</span>
    </div>
    <slot />
  </article>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

/** 通用核心指标卡，可通过属性和默认插槽扩展，不绑定具体业务。 */
withDefaults(
  defineProps<{
    label: string
    value: number | string
    helper: string
    icon: Component
    color?: string
    helperColor?: string
  }>(),
  { color: '#176b3a', helperColor: '' },
)
</script>

<style scoped lang="scss">
.metric-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  min-height: 104px;
  padding: 18px;
  background: #fff;
  border: 1px solid var(--color-border, #e3e9e4);
  border-radius: 10px;
  transition: border-color 0.18s ease;
}

.metric-card:hover {
  border-color: #c8d8cb;
}

.metric-icon {
  display: grid;
  width: 42px;
  height: 42px;
  border-radius: 9px;
  flex: 0 0 auto;
  place-items: center;
}

.metric-content {
  min-width: 0;
}

.metric-label,
.metric-helper {
  display: block;
  font-size: 12px;
}

.metric-label {
  color: var(--color-text-muted, #66736a);
}

.metric-content strong {
  display: block;
  margin: 3px 0 4px;
  color: var(--color-text, #17201a);
  font-size: 26px;
  line-height: 1.1;
}
</style>
