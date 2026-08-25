<template>
  <div v-if="tags.length" class="risk-tags">
    <el-tag
      v-for="tag in tags"
      :key="tag"
      size="small"
      :type="tagType(tag)"
      effect="plain"
      class="risk-tag"
    >
      {{ tag }}
    </el-tag>
  </div>
  <span v-else class="risk-empty">—</span>
</template>

<script setup lang="ts">
/**
 * RiskTagList 风险标签展示
 * @example <RiskTagList :tags="row.riskTags" />
 */
withDefaults(
  defineProps<{
    /** 风险标签数组 */
    tags?: string[]
  }>(),
  { tags: () => [] },
)

/** 高危关键词映射红色，其余灰色 */
function tagType(tag: string): 'danger' | 'warning' | 'info' {
  if (/重金属|危废|危险废物|暗管|直排|超标/.test(tag)) return 'danger'
  if (/信访|聚集|散乱污/.test(tag)) return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.risk-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;

  .risk-tag {
    margin-right: 0;
  }
}

.risk-empty {
  color: #c0c4cc;
  font-size: 12px;
}
</style>
