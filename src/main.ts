/**
 * 应用入口 —— 创建 Vue 实例、挂载插件、初始化 Mock（可选）
 *
 * 说明：Element Plus 已改为按需引入（unplugin-auto-import + unplugin-vue-components，
 * 见 vite.config.ts BD-02），此处不再全量 app.use(ElementPlus)，
 * 组件在模板中直接用 <el-xxx>，API（ElMessage 等）在 <script setup> 中直接调用。
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/es/components/message-box/style/css'

import App from './App.vue'
import router from './router'
import request from './api/request'
import { setupMock } from './api/mock'

import './styles/index.scss'

// ── Mock 模式：VITE_MOCK=true 时激活（.env 统一 true/false 语义） ──
if (import.meta.env.VITE_MOCK === 'true') {
  setupMock(request)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
