<template>
  <div class="pagination-bar">
    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      @update:current-page="(p: number) => emit('update:page', p)"
      @update:page-size="(s: number) => emit('update:pageSize', s)"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * PaginationBar 分页条（受控组件）
 * @example <PaginationBar :page="q.page" :page-size="q.pageSize" :total="total" @update:page="q.page=$event" @update:pageSize="q.pageSize=$event" />
 */
withDefaults(
  defineProps<{
    /** 当前页（从 1 开始） */
    page: number
    /** 每页条数 */
    pageSize: number
    /** 总条数 */
    total: number
    /** 可选分页大小 */
    pageSizes?: number[]
  }>(),
  { pageSizes: () => [10, 20, 50] },
)

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', pageSize: number): void
}>()
</script>

<style scoped lang="scss">
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 56px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
}
</style>
