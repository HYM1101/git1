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
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
