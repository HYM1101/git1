<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    append-to-body
    class="confirm-dialog"
    align-center
  >
    <div class="confirm-content">
      <el-icon class="confirm-icon" :size="40"><WarningFilled /></el-icon>
      <p>{{ message }}</p>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button :type="type" :loading="loading" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 确认对话框（危险操作/流程操作确认）
 * @props title 标题
 * @props message 提示文案
 * @props type 按钮类型（danger 危险操作）
 * @props width 宽度
 * @emits confirm 用户确认
 * 用法：v-model:visible 控制显隐
 */
import { ref, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    title?: string
    message: string
    type?: 'primary' | 'danger' | 'warning'
    width?: string
    modelValue: boolean
  }>(),
  { title: '操作确认', type: 'primary', width: '420px' },
)

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  confirm: []
}>()

const visible = ref(props.modelValue)
const loading = ref(false)

watch(
  () => props.modelValue,
  (v) => (visible.value = v),
)
watch(visible, (v) => emit('update:modelValue', v))

async function handleConfirm(): Promise<void> {
  loading.value = true
  try {
    emit('confirm')
    visible.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.confirm-content {
  display: flex;
  align-items: center;
  gap: 12px;

  .confirm-icon {
    color: #fb8c00;
    flex-shrink: 0;
  }

  p {
    font-size: 14px;
    color: var(--color-text-muted);
    line-height: 1.6;
  }
}
</style>
