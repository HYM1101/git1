<template>
  <div class="file-upload">
    <el-upload
      :auto-upload="false"
      :limit="limit"
      :accept="accept"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :file-list="fileList"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">拖拽文件到此处，或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">
          支持 {{ accept }}，单个不超过 {{ maxSize / 1024 / 1024 }}MB，最多 {{ limit }} 个
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
/**
 * FileUpload 附件上传（前端校验：类型 + 大小，仅收集文件不自动上传）
 * 校验不通过会阻止加入列表并触发 onReject（提示走 ElMessage.warning）
 * @example
 * <FileUpload v-model="files" accept=".jpg,.png,.pdf" :max-size="5*1024*1024" :limit="5" @reject="msg" />
 * <FileUpload accept=".jpg,.png" max-size-mb="10" />  <!-- MB 单位便捷写法 -->
 */
import { computed, ref, watch } from 'vue'
// 使用 es 路径导入：与组件测试的 vi.mock 共享同一模块实例
import { ElMessage } from 'element-plus/es/components/message/index'
import type { UploadFile } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    /** 接受的文件类型（原生 accept 语法） */
    accept?: string
    /** 单个文件大小上限（字节，默认 10MB；与 maxSizeMB 同时给定时优先 maxSizeMB） */
    maxSize?: number
    /** 单个文件大小上限（MB 便捷单位） */
    maxSizeMB?: number
    /** 最大文件数（默认 5） */
    limit?: number
    /** 受控文件列表（v-model:file-list 或 v-model） */
    fileList?: { name: string; url?: string }[]
  }>(),
  {
    accept: '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx',
    maxSize: 10 * 1024 * 1024,
    limit: 5,
    fileList: () => [],
  },
)

const emit = defineEmits<{
  /** 文件列表变化（含通过校验的文件） */
  (e: 'update:fileList', files: { name: string; size: number; raw?: File }[]): void
  /** 校验被拒绝（类型/大小/数量超限） */
  (e: 'reject', msg: string): void
}>()

/** 生效的大小上限（字节） */
const effectiveMaxBytes = computed(() =>
  props.maxSizeMB ? props.maxSizeMB * 1024 * 1024 : props.maxSize,
)

const internalList = ref<UploadFile[]>([])

watch(
  () => props.fileList,
  (val) => {
    internalList.value = val.map((f, i) => ({
      name: f.name,
      url: f.url,
      status: 'success' as const,
      uid: i + 1,
    }))
  },
  { immediate: true },
)

/** 文件类型白名单（从 accept 提取扩展名） */
const acceptExts = props.accept.split(',').map((s) => s.trim().toLowerCase())

function handleChange(file: UploadFile): void {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (acceptExts.length > 0 && !acceptExts.includes(ext)) {
    const msg = `不支持的文件类型：${file.name}（仅支持 ${props.accept}）`
    ElMessage.warning(msg)
    emit('reject', msg)
    internalList.value = internalList.value.filter((f) => f.name !== file.name)
    return
  }
  if ((file.size || 0) > effectiveMaxBytes.value) {
    const msg = `文件大小超过 ${effectiveMaxBytes.value / 1024 / 1024}MB：${file.name}`
    ElMessage.warning(msg)
    emit('reject', msg)
    internalList.value = internalList.value.filter((f) => f.name !== file.name)
    return
  }
  if (internalList.value.length >= props.limit) {
    const msg = `最多上传 ${props.limit} 个文件`
    ElMessage.warning(msg)
    emit('reject', msg)
    internalList.value = internalList.value.filter((f) => f.name !== file.name)
    return
  }
  // 通过校验：将新文件入列后 emit（el-upload 内部已入列，但 props.fileList 尚未回传）
  internalList.value = [...internalList.value.filter((f) => f.name !== file.name), file]
  emitModel()
}

function handleRemove(_file: UploadFile): void {
  emitModel()
}

/** 把通过校验的文件（去重）emit 出去 */
function emitModel(): void {
  const valid = internalList.value
    .filter((f) => f.status !== 'fail')
    .map((f) => ({ name: f.name, size: f.size || 0, raw: f.raw as File | undefined }))
  emit('update:fileList', valid)
}
</script>

<style scoped lang="scss">
.file-upload {
  width: 100%;
}
</style>
