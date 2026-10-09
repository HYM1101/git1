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
  min-height: 40px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    line-height: 26px;
    color: var(--color-text);
  }

  .breadcrumb {
    :deep(.el-breadcrumb__inner) {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
