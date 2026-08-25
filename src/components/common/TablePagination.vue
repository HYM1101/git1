<template>
  <div class="pagination-wrap">
    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="(p: number) => $emit('page-change', p)"
      @size-change="(s: number) => $emit('size-change', s)"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 统一表格分页
 * @props page 当前页
 * @props pageSize 每页条数
 * @props total 总条数
 * @props pageSizes 可选每页条数
 * @emits page-change 页码变化
 * @emits size-change 每页条数变化
 */
withDefaults(
  defineProps<{
    page: number
    pageSize: number
    total: number
    pageSizes?: number[]
  }>(),
  { pageSizes: () => [10, 20, 50] },
)

defineEmits<{ 'page-change': [page: number]; 'size-change': [size: number] }>()
</script>

<style scoped lang="scss">
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
