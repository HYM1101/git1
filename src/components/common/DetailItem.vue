<template>
  <div class="detail-grid">
    <div v-for="item in items" :key="item.label" class="detail-item">
      <span class="detail-label">{{ item.label }}</span>
      <span class="detail-value">
        <slot :name="item.key">{{ item.value }}</slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * DetailItem 详情字段网格（label-value 对，支持插槽覆盖）
 * @example
 * <DetailItem :items="[{key:'title',label:'问题标题',value:detail.title},{key:'level',label:'重要等级'}]">
 *   <template #level><LevelTag :level="detail.importantLevel" /></template>
 * </DetailItem>
 */
defineProps<{
  /** 字段数组（key 用于插槽名，value 为默认显示值） */
  items: { key: string; label: string; value?: unknown }[]
}>()
</script>

<style scoped lang="scss">
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;

  .detail-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }

  .detail-label {
    font-size: 13px;
    color: #909399;
    flex-shrink: 0;

    &::after {
      content: '：';
    }
  }

  .detail-value {
    font-size: 14px;
    color: #303133;
    word-break: break-all;
  }
}
</style>
