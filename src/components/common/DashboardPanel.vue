<template>
  <section class="dashboard-panel" :class="{ compact }">
    <header v-if="title || $slots.header || $slots.actions" class="panel-header">
      <slot name="header">
        <div class="panel-heading">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="panel-actions"><slot name="actions" /></div>
    </header>
    <div class="panel-content"><slot /></div>
    <footer v-if="$slots.footer" class="panel-footer"><slot name="footer" /></footer>
  </section>
</template>

<script setup lang="ts">
/** 通用看板面板：通过标题、说明与插槽承载图表、表格或业务摘要。 */
withDefaults(
  defineProps<{
    title?: string
    description?: string
    compact?: boolean
  }>(),
  { title: '', description: '', compact: false },
)
</script>

<style scoped lang="scss">
.dashboard-panel {
  min-width: 0;
  overflow: hidden;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e3e9e4);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgb(20 50 28 / 4%);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--color-border-light, #edf1ed);
}

.panel-heading h2 {
  margin: 0;
  color: var(--color-text, #17201a);
  font-size: 15px;
  font-weight: 650;
}

.panel-heading p {
  margin: 5px 0 0;
  color: var(--color-text-muted, #66736a);
  font-size: 12px;
  line-height: 1.5;
}

.panel-actions {
  flex: 0 0 auto;
}

.panel-content {
  min-width: 0;
  padding: 18px 20px;
}

.panel-footer {
  border-top: 1px solid var(--color-border-light, #edf1ed);
}

.compact .panel-header {
  padding: 14px 16px 12px;
}

.compact .panel-content {
  padding: 14px 16px;
}

@media (width <= 600px) {
  .panel-header {
    padding: 16px;
  }

  .panel-content {
    padding: 16px;
  }
}
</style>
