<template>
  <div class="filter-bar">
    <slot />
    <div class="filter-actions">
      <el-button type="primary" :icon="Search" @click="emit('search')">查询</el-button>
      <el-button :icon="RefreshLeft" @click="emit('reset')">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * FilterBar 筛选栏容器（查询/重置按钮 + 默认插槽放筛选控件）
 * @example
 * <FilterBar @search="handleSearch" @reset="handleReset">
 *   <el-input v-model="q.keyword" placeholder="搜索" />
 * </FilterBar>
 */
import { Search, RefreshLeft } from '@element-plus/icons-vue'

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
}>()
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .filter-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
