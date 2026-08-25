<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="/favicon.svg" alt="logo" class="logo" />
        <h1>生态环境问题闭环管理系统</h1>
        <p class="subtitle">百色市生态环境局</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="demo-hint">
        <p>演示账号：</p>
        <p>管理员 admin / admin123</p>
        <p>运维员 operator / op123</p>
        <p>责任人 resp / resp123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
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

async function handleLogin(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login({ username: form.username, password: form.password })
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/workbench'
    router.push(redirect)
  } catch {
    ElMessage.error('用户名或密码错误')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1a5c35 0%, #2b7a4b 50%, #4a9d6a 100%);
}

.login-card {
  width: 400px;
  padding: 40px 36px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 13px;
    color: #909399;
  }
}

.login-btn {
  width: 100%;
}

.demo-hint {
  margin-top: 20px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.8;

  p:first-child {
    font-weight: 500;
    color: #606266;
  }
}
</style>
