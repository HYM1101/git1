<template>
  <AppShell>
    <header class="files-header">
      <div>
        <h2>文件管理</h2>
        <p>市级统筹与县级调度文件统一管理平台</p>
      </div>
      <div class="files-actions">
        <button class="primary" type="button" @click="openUpload">上传文件</button
        ><button type="button" @click="batchInput?.click()">批量导入</button>
        <input ref="batchInput" class="sr-only" type="file" multiple @change="handleBatchImport" />
      </div>
    </header>
    <section class="files-filter">
      <div class="filter-group">
        <span>文件层级：</span
        ><button
          :class="{ active: level === 'municipal' }"
          type="button"
          @click="level = 'municipal'"
        >
          市级统筹文件</button
        ><button :class="{ active: level === 'county' }" type="button" @click="level = 'county'">
          县级调度资料
        </button>
      </div>
      <label
        >县区：<select v-model="region">
          <option value="">全部县区</option>
          <option>A县</option>
          <option>B县</option>
          <option>C县</option>
        </select></label
      >
      <label
        >主题：<select v-model="topic">
          <option value="">全部主题</option>
          <option>工作部署</option>
          <option>督导检查</option>
        </select></label
      >
      <div class="filter-group">
        <span>分类：</span
        ><button
          v-for="item in categories"
          :key="item"
          :class="{ active: category === item }"
          type="button"
          @click="category = item"
        >
          {{ item || '全部' }}
        </button>
      </div>
    </section>
    <section class="files-table">
      <table>
        <thead>
          <tr>
            <th>文件名称</th>
            <th>文件层级</th>
            <th>县区</th>
            <th>主题</th>
            <th>分类</th>
            <th>上传人</th>
            <th>上传时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in filteredFiles" :key="file.id">
            <td>{{ file.name }}</td>
            <td>{{ file.level }}</td>
            <td>{{ file.region }}</td>
            <td>{{ file.topic }}</td>
            <td>{{ file.category }}</td>
            <td>管理员</td>
            <td>2026-08-25</td>
            <td><button class="link" type="button" @click="downloadFile(file)">下载</button></td>
          </tr>
          <tr v-if="!filteredFiles.length">
            <td class="empty-cell" colspan="8">当前筛选条件下暂无文件</td>
          </tr>
        </tbody>
      </table>
    </section>
    <div
      v-if="uploadVisible"
      class="modal-mask"
      role="presentation"
      tabindex="-1"
      @click.self="closeUpload"
      @keydown.esc="closeUpload"
    >
      <section class="upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <header id="upload-title">
          上传文件<button type="button" aria-label="关闭上传弹窗" @click="closeUpload">×</button>
        </header>
        <div class="upload-body">
          <div class="upload-guide">
            <b>文件上传规范</b>
            <span>请选择准确分类并标记关联范围；支持 PDF、Office、CSV、ZIP，单文件 ≤ 200MB。</span>
          </div>
          <label class="drag-area" @dragover.prevent @drop.prevent="handleDrop"
            >点击或拖拽文件到此处上传<input
              class="sr-only"
              type="file"
              @change="handleFileSelect"
            /><strong v-if="selectedFile">{{ selectedFile.name }}</strong></label
          >
          <label class="upload-field"
            ><span>文件名称</span
            ><input v-model.trim="uploadName" type="text" placeholder="选择文件后自动填充"
          /></label>
          <label class="upload-field"
            ><span>分类 <i>*</i></span
            ><select v-model="uploadCategory">
              <option value="">请选择分类</option>
              <option v-for="item in categories.slice(1)" :key="item">{{ item }}</option>
            </select></label
          >
          <div class="upload-row">
            <label class="upload-field"
              ><span>关联县区</span
              ><select v-model="uploadRegion">
                <option value="">不关联</option>
                <option>A县</option>
                <option>B县</option>
                <option>C县</option>
              </select></label
            >
            <label class="upload-field"
              ><span>关联主题</span
              ><select v-model="uploadTopic">
                <option value="">不关联</option>
                <option>工作部署</option>
                <option>督导检查</option>
              </select></label
            >
          </div>
        </div>
        <footer>
          <button type="button" @click="closeUpload">取消</button
          ><button class="primary" type="button" :disabled="uploading" @click="confirmUpload">
            {{ uploading ? '上传中…' : '确认上传' }}
          </button>
        </footer>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AppShell from '@/layouts/AppShell.vue'
interface ManagedFile {
  id: number
  name: string
  level: string
  region: string
  topic: string
  category: string
  content?: File
}
const level = ref('municipal')
const region = ref('')
const topic = ref('')
const category = ref('')
const uploadVisible = ref(false)
const uploading = ref(false)
const selectedFile = ref<File | null>(null)
const uploadName = ref('')
const uploadCategory = ref('')
const uploadRegion = ref('')
const uploadTopic = ref('')
const batchInput = ref<HTMLInputElement | null>(null)
const categories = ['', '市级正式文件', '调度会议材料', '督导材料']
const MAX_FILE_SIZE = 200 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'zip']
const files = ref<ManagedFile[]>([
  {
    id: 1,
    name: '生态环境问题整改工作通知.pdf',
    level: '市级',
    region: '全市',
    topic: '工作部署',
    category: '市级正式文件',
  },
  {
    id: 2,
    name: '重点问题调度会议材料.docx',
    level: '县级',
    region: 'A县',
    topic: '督导检查',
    category: '调度会议材料',
  },
])
const filteredFiles = computed(() =>
  files.value.filter(
    (file) =>
      (!level.value || file.level === (level.value === 'municipal' ? '市级' : '县级')) &&
      (!region.value || file.region === region.value) &&
      (!topic.value || file.topic === topic.value) &&
      (!category.value || file.category === category.value),
  ),
)

function openUpload(): void {
  selectedFile.value = null
  uploadName.value = ''
  uploadCategory.value = category.value || ''
  uploadRegion.value = region.value || ''
  uploadTopic.value = topic.value || ''
  uploadVisible.value = true
}
function closeUpload(): void {
  if (uploading.value) return
  uploadVisible.value = false
  selectedFile.value = null
}
function validateFile(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXTENSIONS.includes(extension))
    return `${file.name} 格式不支持，仅允许 PDF、Office、CSV 或 ZIP 文件`
  if (file.size > MAX_FILE_SIZE) return `${file.name} 超过 200MB`
  return ''
}
function handleFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const error = validateFile(file)
  if (error) {
    ElMessage.error(error)
    input.value = ''
    return
  }
  selectedFile.value = file
  uploadName.value = file.name
  input.value = ''
}
function handleDrop(event: DragEvent): void {
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  const error = validateFile(file)
  if (error) {
    ElMessage.error(error)
    return
  }
  selectedFile.value = file
  uploadName.value = file.name
}
async function confirmUpload(): Promise<void> {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  if (!uploadName.value) {
    ElMessage.warning('请填写文件名称')
    return
  }
  if (!uploadCategory.value) {
    ElMessage.warning('请选择文件分类')
    return
  }
  uploading.value = true
  try {
    await Promise.resolve()
    files.value.unshift({
      id: Date.now(),
      name: uploadName.value,
      level: level.value === 'municipal' ? '市级' : '县级',
      region: uploadRegion.value || '全市',
      topic: uploadTopic.value || '工作部署',
      category: uploadCategory.value,
      content: selectedFile.value,
    })
    uploadVisible.value = false
    ElMessage.success('文件上传成功')
  } catch {
    ElMessage.error('文件上传失败，请重试')
  } finally {
    uploading.value = false
  }
}
function handleBatchImport(event: Event): void {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files || [])
  if (!selected.length) return
  const valid = selected.filter((file) => {
    const error = validateFile(file)
    if (error) ElMessage.error(error)
    return !error
  })
  valid.forEach((file, index) =>
    files.value.unshift({
      id: Date.now() + index,
      name: file.name,
      level: '市级',
      region: '全市',
      topic: '工作部署',
      category: '市级正式文件',
      content: file,
    }),
  )
  input.value = ''
  if (valid.length) ElMessage.success(`成功导入 ${valid.length} 个文件`)
}
function downloadFile(file: ManagedFile): void {
  const blob =
    file.content || new Blob([`文件名称：${file.name}`], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已开始下载')
}
</script>

<style scoped lang="scss">
.files-header,
.files-actions,
.files-filter,
.filter-group,
.upload-modal header,
.upload-modal footer {
  display: flex;
  align-items: center;
}

.upload-body {
  max-height: 64vh;
  padding: 14px 20px 4px;
  overflow-y: auto;
}

.upload-guide {
  display: grid;
  gap: 4px;
  padding: 11px 13px;
  color: #2e7d32;
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.6;
}

.upload-guide b {
  font-size: 12px;
}

.files-header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.files-header h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.files-header p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.files-actions,
.filter-group {
  gap: 8px;
}

.files-filter {
  flex-wrap: wrap;
  gap: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
}

.files-filter button,
.files-actions button,
.upload-modal button {
  padding: 7px 14px;
  background: #fff;
  border: 1px solid #dfe5df;
  border-radius: 6px;
}

.primary,
.active {
  color: #fff !important;
  background: #1a5f2a !important;
}

.files-filter label,
.filter-group {
  font-size: 13px;
}

.files-filter select {
  padding: 7px 12px;
  border: 1px solid #dfe5df;
  border-radius: 6px;
}

.files-table {
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
}

.files-table table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

.empty-cell {
  height: 180px;
  color: #7b8493;
  text-align: center !important;
}

.files-table th,
.files-table td {
  padding: 14px 16px;
  font-size: 13px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.files-table th {
  color: #0d3b1a;
  background: #f0f4f0;
}

.link {
  color: #1a5f2a;
  background: none;
  border: 0;
}

.modal-mask {
  position: fixed;
  inset: 0;
  display: grid;
  background: rgb(0 0 0 / 40%);
  place-items: center;
}

@media (width <= 760px) {
  .files-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .files-filter {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-group {
    flex-wrap: wrap;
  }

  .upload-modal {
    width: min(520px, calc(100vw - 32px));
  }

  .drag-area {
    padding: 34px 18px;
  }
}

.upload-modal {
  width: 520px;
  background: #fff;
  border-radius: 12px;
}

.upload-modal header,
.upload-modal footer {
  justify-content: space-between;
  padding: 16px 20px;
}

.drag-area {
  display: grid;
  gap: 10px;
  margin: 12px 0;
  padding: 34px 20px;
  text-align: center;
  border: 1px dashed #81c784;
  border-radius: 8px;
}

.upload-field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  color: #4b5563;
  font-size: 12px;
}

.upload-field i {
  color: #e53935;
  font-style: normal;
}

.upload-field input,
.upload-field select {
  width: 100%;
  height: 38px;
  padding: 0 11px;
  color: #1a1a2e;
  background: #fff;
  border: 1px solid #dfe5df;
  border-radius: 7px;
}

.upload-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.drag-area strong {
  color: #1a5f2a;
  font-size: 13px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.upload-modal button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-modal footer {
  justify-content: flex-end;
  gap: 8px;
}

@media (width <= 600px) {
  .upload-row {
    grid-template-columns: 1fr;
  }
}
</style>
