<template>
  <div
    class="stat-card"
    :class="{ clickable: !!onClick }"
    :role="onClick ? 'button' : undefined"
    :tabindex="onClick ? 0 : undefined"
    @click="onClick"
    @keydown.enter="onClick?.()"
    @keydown.space.prevent="onClick?.()"
  >
    <div v-if="icon" class="stat-icon" :style="{ backgroundColor: `${color}18` }">
      <el-icon :size="22" :color="color"><component :is="icon" /></el-icon>
    </div>
    <div class="stat-body">
      <div class="stat-value" :style="{ color }">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * StatCard 统计卡片
 * @example <StatCard label="问题总数" :value="128" color="#1a5f2a" :icon="Document" />
 */
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    /** 卡片标题 */
    label: string
    /** 数值（可传 number 或 string，如 "12.5%"） */
    value: number | string
    /** 主题色（默认品牌绿） */
    color?: string
    /** 图标组件 */
    icon?: Component
    /** 点击回调（可选） */
    onClick?: () => void
  }>(),
  { color: '#1a5f2a' },
)
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
  min-height: 82px;
  padding: 14px 16px;
  background: #fafbf8;
  border: 1px solid #e3e9e4;
  border-radius: 9px;

  &.clickable {
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      border-color 0.18s ease;

    &:hover {
      background: #fbfdfb;
      border-color: #bfd3c3;
    }

    &:focus-visible {
      outline: 2px solid rgb(26 95 42 / 20%);
      outline-offset: 2px;
    }
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 21px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  margin-top: 3px;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
