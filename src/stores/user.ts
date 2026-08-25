/**
 * 用户 Store —— 登录态管理、Token 持久化、角色判断
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginPayload } from '@/api/auth'
import type { UserInfo, Role } from '@/types'

const TOKEN_KEY = 'ec_token'
const REFRESH_KEY = 'ec_refresh_token'
const USER_KEY = 'ec_user'

export const useUserStore = defineStore('user', () => {
  // ── State ──
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const refreshToken = ref<string>(localStorage.getItem(REFRESH_KEY) || '')
  const user = ref<UserInfo | null>(
    (() => {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? (JSON.parse(raw) as UserInfo) : null
    })(),
  )

  // ── Getters ──
  const isLoggedIn = computed(() => Boolean(token.value))
  const role = computed<Role | null>(() => user.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'admin')
  const isOperator = computed(() => role.value === 'operator')
  const isResponsible = computed(() => role.value === 'responsible')
  const regionCode = computed(() => user.value?.regionCode)
  const displayName = computed(() => user.value?.realName || user.value?.username || '未登录')

  // ── Actions ──
  async function login(payload: LoginPayload): Promise<void> {
    const result = await authApi.login(payload)
    token.value = result.token
    refreshToken.value = result.refreshToken || ''
    user.value = result.user
    persist()
  }

  async function fetchUserInfo(): Promise<void> {
    const info = await authApi.getUserInfo()
    user.value = info
    persistUser()
  }

  /** 401 时尝试刷新 Token（request.ts 调用） */
  async function tryRefresh(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const result = await authApi.refreshToken(refreshToken.value)
      token.value = result.token
      refreshToken.value = result.refreshToken
      persist()
      return true
    } catch {
      return false
    }
  }

  function clearSession(): void {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // 忽略登出请求失败
    }
    clearSession()
  }

  // ── 内部工具 ──
  function persist(): void {
    localStorage.setItem(TOKEN_KEY, token.value)
    if (refreshToken.value) localStorage.setItem(REFRESH_KEY, refreshToken.value)
    persistUser()
  }

  function persistUser(): void {
    if (user.value) {
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  return {
    token,
    refreshToken,
    user,
    isLoggedIn,
    role,
    isAdmin,
    isOperator,
    isResponsible,
    regionCode,
    displayName,
    login,
    fetchUserInfo,
    tryRefresh,
    clearSession,
    logout,
  }
})
