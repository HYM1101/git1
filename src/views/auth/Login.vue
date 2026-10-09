<template>
  <div class="login-page">
    <div class="login-card">
      <aside class="brand-panel">
        <div class="brand-header">
          <div class="brand-logo"><img src="/logo.svg" alt="" /></div>
          <h1>生态环境问题<br />闭环管理系统</h1>
          <p>问题发现 · 整改督办 · 验收销号<br />全流程闭环管理</p>
        </div>
        <div class="brand-features">
          <div v-for="item in features" :key="item.text" class="feature-item">
            <span class="feature-icon"><component :is="item.icon" /></span>
            <span>{{ item.text }}</span>
          </div>
        </div>
        <div class="demo-accounts">
          <div class="demo-title">演示账号</div>
          <button type="button" :disabled="loading" @click="fillDemo('admin', '123456')">
            <span>管理员</span><strong>admin / 123456</strong>
          </button>
          <button type="button" :disabled="loading" @click="fillDemo('kehu', '123456')">
            <span>科室人员</span><strong>kehu / 123456</strong>
          </button>
          <button type="button" :disabled="loading" @click="fillDemo('handler', '123456')">
            <span>整改责任人</span><strong>handler / 123456</strong>
          </button>
        </div>
        <div class="brand-footer">© 2026 v3.0</div>
      </aside>

      <div class="login-form-panel">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p class="subtitle">请输入您的账号信息</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" size="large" clearable />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="remember">记住账号</el-checkbox>
            <button type="button" :disabled="loading" @click="forgotPassword">忘记密码？</button>
          </div>
          <el-form-item class="login-action">
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              :disabled="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Bell, EditPen, MapLocation, PieChart } from '@element-plus/icons-vue'
// ElMessage 子路径导入（按需）；FormInstance/FormRules 为纯类型
import { ElMessage } from 'element-plus/es/components/message/index'
import 'element-plus/es/components/message/style/css'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const remember = ref(true)
const REMEMBERED_USERNAME_KEY = 'ec_remembered_username'

const features = [
  { icon: EditPen, text: '问题录入与分级管控' },
  { icon: Bell, text: '分级预警消息推送' },
  { icon: MapLocation, text: 'GIS 点位一张图' },
  { icon: PieChart, text: '统计分析与报表' },
]

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不少于 6 位', trigger: 'blur' },
  ],
}

function fillDemo(username: string, password: string): void {
  form.username = username
  form.password = password
}

function forgotPassword(): void {
  ElMessage.info('请联系系统管理员重置密码')
}

async function handleLogin(): Promise<void> {
  if (loading.value) return
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login({ username: form.username, password: form.password })
    if (remember.value) localStorage.setItem(REMEMBERED_USERNAME_KEY, form.username.trim())
    else localStorage.removeItem(REMEMBERED_USERNAME_KEY)
    ElMessage.success('登录成功')
    const requestedRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const redirect =
      requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')
        ? requestedRedirect
        : '/workbench'
    router.push(redirect)
  } catch {
    ElMessage.error('用户名或密码错误')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const remembered = localStorage.getItem(REMEMBERED_USERNAME_KEY)
  if (remembered) form.username = remembered
})
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  padding: 24px;
  background: linear-gradient(160deg, #e8f5e9 0%, #dce8dc 30%, #d4e5d4 60%, #edf2ed 100%);
}

.login-page::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  opacity: 0.28;
  background-image: radial-gradient(rgb(26 95 42 / 18%) 0.7px, transparent 0.7px);
  background-size: 18px 18px;
}

.login-card {
  position: relative;
  display: flex;
  width: 820px;
  height: 559px;
  overflow: hidden;
  background: #fff;
  border-radius: 20px;
  box-shadow:
    0 16px 32px rgb(0 0 0 / 0.06),
    0 32px 64px rgb(0 0 0 / 0.06);
}

.brand-panel {
  position: relative;
  display: flex;
  flex: 0 0 360px;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 36px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(160deg, #0d3b1a 0%, #1a5f2a 40%, #2e8b3a 100%);
}

.brand-panel::before,
.brand-panel::after {
  position: absolute;
  content: '';
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 50%;
}

.brand-panel::before {
  top: -88px;
  right: -98px;
  width: 260px;
  height: 260px;
}

.brand-panel::after {
  right: -48px;
  bottom: -112px;
  width: 230px;
  height: 230px;
}

.brand-header,
.brand-features,
.brand-footer {
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: grid;
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  background: rgb(255 255 255 / 15%);
  border-radius: 14px;
  place-items: center;
}

.brand-logo img {
  width: 34px;
  height: 34px;
}

.brand-header h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.5;
  letter-spacing: 1px;
}

.brand-header p {
  margin: 8px 0 0;
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
  line-height: 1.6;
}

.brand-features {
  display: grid;
  gap: 12px;
  margin-top: 26px;
}

.feature-item {
  display: flex;
  gap: 11px;
  align-items: center;
  font-size: 13px;
}

.feature-icon {
  display: grid;
  width: 28px;
  height: 28px;
  color: #dff3e3;
  background: rgb(255 255 255 / 12%);
  border-radius: 8px;
  place-items: center;

  svg {
    width: 15px;
    height: 15px;
  }
}

.demo-accounts {
  position: relative;
  z-index: 1;
  padding: 12px 14px;
  margin-top: 22px;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 12px;

  .demo-title {
    margin-bottom: 5px;
    color: rgb(255 255 255 / 65%);
    font-size: 11px;
  }

  button {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 3px 0;
    color: rgb(255 255 255 / 78%);
    font: inherit;
    font-size: 11px;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  strong {
    font-weight: 500;
  }
}

.brand-footer {
  padding-top: 12px;
  margin-top: auto;
  border-top: 1px solid rgb(255 255 255 / 12%);
  color: rgb(255 255 255 / 55%);
  font-size: 11px;
}

.login-form-panel {
  flex: 1;
  padding: 48px 44px 40px;
}

.login-header {
  margin-bottom: 30px;

  h2 {
    margin: 0 0 6px;
    color: #1a1a2e;
    font-size: 22px;
    font-weight: 700;
  }

  .subtitle {
    font-size: 13px;
    color: #6b7280;
  }
}

:deep(.el-form-item) {
  margin-bottom: 21px;
}

:deep(.el-form-item__label) {
  height: auto;
  padding-bottom: 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

:deep(.el-form-item.is-required .el-form-item__label::before) {
  display: none;
}

:deep(.el-input__wrapper) {
  min-height: 44px;
  padding: 1px 14px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d9dee7 inset;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -5px 0 22px;

  button {
    padding: 0;
    color: #2e8b3a;
    font-size: 12px;
    cursor: pointer;
    background: transparent;
    border: 0;
  }
}

.login-action {
  margin-bottom: 0;
}

.login-btn {
  width: 100%;
  min-height: 44px;
  background: linear-gradient(135deg, #1a5f2a 0%, #2e8b3a 100%);
  border: 0;
  border-radius: 10px;
}

@media (width <= 768px) {
  .login-card {
    width: min(440px, 100%);
    min-height: auto;
  }

  .brand-panel {
    display: none;
  }

  .login-form-panel {
    padding: 36px 28px;
  }
}
</style>
