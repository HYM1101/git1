<template>
  <div class="page-header">
    <div class="header-left">
      <h2 class="title">{{ title }}</h2>
      <el-breadcrumb v-if="crumbs.length" separator="/" class="breadcrumb">
        <el-breadcrumb-item v-for="c in crumbs" :key="c">{{ c }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PageHeader 页头（标题 + 面包屑 + 操作区插槽）
 * @example
 * <PageHeader title="问题台账" :crumbs="['工作台','问题台账']">
 *   <template #actions><el-button type="primary">录入</el-button></template>
 * </PageHeader>
 */
withDefaults(
  defineProps<{
    /** 页面标题 */
    title: string
    /** 面包屑路径 */
    crumbs?: string[]
  }>(),
  { crumbs: () => [] },
)
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .breadcrumb {
    :deep(.el-breadcrumb__inner) {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
