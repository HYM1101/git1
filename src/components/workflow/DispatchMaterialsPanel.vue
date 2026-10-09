<template>
  <div class="dispatch-panel">
    <div class="dispatch-tip">
      ● 以下为当前问题的调度资料，按类型分类管理。上传后自动与问题关联。
    </div>
    <section class="material-list">
      <article v-for="category in categories" :key="category.key" class="material-card">
        <header>
          <span class="material-icon" :class="category.key">{{ category.icon }}</span>
          <b>{{ category.label }}</b>
          <span class="material-count">{{ files[category.key].length }} 个文件</span>
          <label class="upload-button">
            ＋ 上传
            <input type="file" multiple @change="selectFiles($event, category.key)" />
          </label>
          <button
            class="expand-button"
            type="button"
            :aria-label="expanded[category.key] ? '收起文件' : '展开文件'"
            @click="expanded[category.key] = !expanded[category.key]"
          >
            {{ expanded[category.key] ? '⌃' : '⌄' }}
          </button>
        </header>
        <div v-if="expanded[category.key]" class="material-content">
          <p v-if="!files[category.key].length">该分类暂无调度资料，点击右上角「上传」按钮添加</p>
          <ul v-else>
            <li v-for="file in files[category.key]" :key="`${file.name}-${file.size}`">
              <span>{{ file.name }}</span
              ><small>{{ formatSize(file.size) }}</small>
              <button type="button" @click="removeFile(category.key, file)">删除</button>
            </li>
          </ul>
        </div>
      </article>
    </section>
    <section class="zip-import">
      <b>▣ 批量 ZIP 导入（按问题编号）</b>
      <p>将多个问题的调度资料打包为 ZIP，文件名含问题编号即可自动匹配</p>
      <label>
        ↥ 选择 ZIP 文件导入
        <input type="file" accept=".zip,application/zip" @change="importZip" />
      </label>
      <small v-if="zipName">已选择：{{ zipName }}</small>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

type CategoryKey = 'forwarded' | 'meeting' | 'photos' | 'records'

const categories: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'forwarded', label: '县级转发文件', icon: '↪' },
  { key: 'meeting', label: '本县调度会议通知', icon: '▣' },
  { key: 'photos', label: '乡镇现场核查照片', icon: '●' },
  { key: 'records', label: '本县整改记录', icon: '▤' },
]
const files = reactive<Record<CategoryKey, File[]>>({
  forwarded: [],
  meeting: [],
  photos: [],
  records: [],
})
const expanded = reactive<Record<CategoryKey, boolean>>({
  forwarded: true,
  meeting: true,
  photos: true,
  records: true,
})
const zipName = ref('')

function selectFiles(event: Event, key: CategoryKey): void {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files || [])
  const oversized = selected.find((file) => file.size > 50 * 1024 * 1024)
  if (oversized) {
    ElMessage.error(`${oversized.name} 超过单文件 50MB 限制`)
    input.value = ''
    return
  }
  const merged = new Map([...files[key], ...selected].map((file) => [file.name, file]))
  files[key] = [...merged.values()]
  if (selected.length) ElMessage.success(`已添加 ${selected.length} 个调度资料`)
  input.value = ''
}

function removeFile(key: CategoryKey, target: File): void {
  files[key] = files[key].filter((file) => file !== target)
  ElMessage.success('文件已移除')
}

function importZip(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.zip')) {
    ElMessage.error('请选择 ZIP 格式文件')
  } else if (file.size > 200 * 1024 * 1024) {
    ElMessage.error('ZIP 文件不能超过 200MB')
  } else {
    zipName.value = file.name
    ElMessage.success('ZIP 文件已接收，将按问题编号自动匹配')
  }
  input.value = ''
}

function formatSize(size: number): string {
  return size < 1024 * 1024
    ? `${Math.ceil(size / 1024)} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped lang="scss">
.dispatch-panel {
  display: grid;
  gap: 16px;
}

.dispatch-tip {
  padding: 14px;
  color: #617066;
  background: #f4f8f5;
  border-radius: 8px;
  font-size: 13px;
}

.material-list {
  overflow: hidden;
  border: 1px solid #e1e6e2;
  border-radius: 9px;
}

.material-card + .material-card {
  border-top: 1px solid #e8ece9;
}

.material-card header {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
}

.material-icon {
  display: grid;
  width: 34px;
  height: 34px;
  color: #f59e0b;
  background: #fff3d6;
  border-radius: 9px;
  place-items: center;
}

.material-icon.meeting {
  color: #0288d1;
  background: #e5f5fd;
}

.material-icon.photos {
  color: #8e24aa;
  background: #f5e8f8;
}

.material-icon.records {
  color: #43a047;
  background: #e8f5e9;
}

.material-card b {
  flex: 1;
  color: #242b36;
  font-size: 14px;
}

.material-count {
  color: #687386;
  font-size: 12px;
}

.upload-button {
  padding: 6px 12px;
  color: #17652e;
  border: 1px solid #17652e;
  border-radius: 7px;
  cursor: pointer;
  font-size: 12px;
}

.upload-button:hover {
  color: #fff;
  background: #17652e;
}

.upload-button input,
.zip-import input {
  position: absolute;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
}

.expand-button {
  color: #657180;
  background: none;
  border: 0;
  cursor: pointer;
  font-size: 18px;
}

.material-content {
  padding: 0 60px 18px;
  color: #a1a7af;
  font-size: 13px;
}

.material-content p {
  margin: 0;
}

.material-content ul {
  display: grid;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.material-content li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  color: #374151;
  background: #f8faf8;
  border-radius: 6px;
}

.material-content li span {
  flex: 1;
}

.material-content li button {
  color: #e53935;
  background: none;
  border: 0;
  cursor: pointer;
}

.zip-import {
  display: grid;
  justify-items: center;
  gap: 9px;
  padding: 17px;
  text-align: center;
  border: 1px solid #e1e6e2;
  border-radius: 9px;
}

.zip-import b {
  font-size: 14px;
}

.zip-import p,
.zip-import small {
  margin: 0;
  color: #7b8492;
  font-size: 12px;
}

.zip-import label {
  padding: 9px 28px;
  color: #fff;
  background: #17652e;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

@media (width <= 720px) {
  .material-card header {
    flex-wrap: wrap;
  }

  .material-card b {
    min-width: calc(100% - 48px);
  }

  .material-count {
    margin-left: 46px;
  }

  .material-content {
    padding: 0 16px 16px;
  }
}
</style>
