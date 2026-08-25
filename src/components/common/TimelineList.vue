<template>
  <div class="timeline-list">
    <el-timeline>
      <el-timeline-item
        v-for="item in items"
        :key="item.time + item.action"
        :timestamp="item.time"
        :color="actionColor(item.action)"
      >
        <div class="timeline-entry">
          <span class="action-tag" :style="{ color: actionColor(item.action) }">{{
            actionLabel(item.action)
          }}</span>
          <span class="desc">{{ item.desc }}</span>
          <span class="user">{{ item.user }}</span>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup lang="ts">
/**
 * TimelineList 问题全生命周期时间线
 * @example <TimelineList :items="detail.timeline" />
 */
withDefaults(
  defineProps<{
    /** 时间线条目（action: CREATE/ASSIGN/SUBMIT/ACCEPT/REJECT/WARNING/...） */
    items?: { time: string; action: string; desc?: string; user?: string }[]
  }>(),
  { items: () => [] },
)

/** 动作 → 中文标签 */
const ACTION_LABELS: Record<string, string> = {
  CREATE: '创建',
  ASSIGN: '下发',
  PROGRESS: '进度',
  SUBMIT: '提交验收',
  ACCEPT: '验收通过',
  REJECT: '验收驳回',
  REWORK: '返工',
  WARNING: '预警',
  CLOSE: '销号',
}

/** 动作 → 颜色 */
const ACTION_COLORS: Record<string, string> = {
  CREATE: '#909399',
  ASSIGN: '#2B7A4B',
  PROGRESS: '#00897B',
  SUBMIT: '#7B1FA2',
  ACCEPT: '#43A047',
  REJECT: '#E53935',
  REWORK: '#FB8C00',
  WARNING: '#E53935',
  CLOSE: '#43A047',
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] || action
}

function actionColor(action: string): string {
  return ACTION_COLORS[action] || '#909399'
}
</script>

<style scoped lang="scss">
.timeline-list {
  padding: 8px 0;

  .timeline-entry {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }

  .action-tag {
    font-weight: 600;
    font-size: 12px;
    flex-shrink: 0;
  }

  .desc {
    font-size: 13px;
    color: #606266;
  }

  .user {
    font-size: 12px;
    color: #c0c4cc;
  }
}
</style>
