<template>
  <div class="empty-state">
    <el-empty :description="description" :image-size="imageSize" />
  </div>
</template>

<script setup lang="ts">
/**
 * EmptyState 空状态占位
 * @example <EmptyState description="暂无待办问题" />
 */
withDefaults(
  defineProps<{
    /** 空状态文案 */
    description?: string
    /** 图片尺寸 */
    imageSize?: number
  }>(),
  { description: '暂无数据', imageSize: 120 },
)
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 48px 0;
}
</style>
