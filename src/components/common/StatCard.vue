<template>
  <div class="stat-card" :class="{ clickable: !!onClick }" @click="onClick">
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
 * @example <StatCard label="问题总数" :value="128" color="#2b7a4b" icon="Document" />
 */
defineProps<{
  /** 卡片标题 */
  label: string
  /** 数值（可传 number 或 string，如 "12.5%"） */
  value: number | string
  /** 主题色（默认品牌绿） */
  color?: string
  /** Element Plus 图标组件名（如 Document / Warning） */
  icon?: string
  /** 点击回调（可选） */
  onClick?: () => void
}>()
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);

  &.clickable {
    cursor: pointer;
    transition:
      transform 0.15s,
      box-shadow 0.15s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
    }
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  margin-top: 2px;
  font-size: 13px;
  color: #909399;
}
</style>
