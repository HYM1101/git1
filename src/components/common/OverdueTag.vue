<template>
  <span v-if="days > 0" class="overdue-tag">超期 {{ days }} 天</span>
  <span v-else-if="days < 0" class="remain-tag">剩余 {{ -days }} 天</span>
  <span v-else class="today-tag">今日到期</span>
</template>

<script setup lang="ts">
/**
 * OverdueTag 超期/剩余天数标签（正数=超期红色，负数=剩余绿色，0=今日黄色）
 * @example <OverdueTag :days="row.overdueDays" />
 */
withDefaults(
  defineProps<{
    /** 超期天数（负数表示剩余天数） */
    days: number
  }>(),
  { days: 0 },
)
</script>

<style scoped lang="scss">
.overdue-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #fdecea;
  color: #e53935;
  white-space: nowrap;
}

.remain-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #eaf4ee;
  color: #43a047;
  white-space: nowrap;
}

.today-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #fef7e0;
  color: #fb8c00;
  white-space: nowrap;
}
</style>
