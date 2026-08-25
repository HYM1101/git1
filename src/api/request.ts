/**
 * axios 实例与拦截器 —— 所有 API 请求统一入口
 * 职责：baseURL / 请求头注入 Token / 401 自动刷新重试 / 统一错误提示
 */
import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
// ElMessage 子路径导入（绕过 element-plus/es 聚合入口，实现 API 按需）
import { ElMessage } from 'element-plus/es/components/message/index'
import 'element-plus/es/components/message/style/css'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { ApiResponse } from '@/types'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

/** 请求拦截：注入 JWT */
request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

/** 响应拦截：解包统一响应体 + 401 处理 */
request.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse
    // 非标准响应体（文件流等）直接透传
    if (body === null || typeof body !== 'object' || !('code' in body)) {
      return response.data
    }
    if (body.code !== 0) {
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return body.data
  },
  async (error: AxiosError) => {
    const userStore = useUserStore()
    // 401：尝试刷新，失败则登出回登录页
    if (error.response?.status === 401 && userStore.token) {
      const refreshed = await userStore.tryRefresh()
      if (refreshed) {
        // 重放原请求
        const config = error.config as AxiosRequestConfig
        return request(config)
      }
    }
    if (error.response?.status === 401) {
      userStore.clearSession()
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    } else {
      const msg =
        (error.response?.data as { message?: string })?.message || error.message || '网络错误'
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  },
)

export default request
