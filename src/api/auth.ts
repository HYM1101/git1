/** 认证域 API */
import request from './request'
import type { LoginResult, UserInfo } from '@/types'

export interface LoginPayload {
  username: string
  password: string
}

export const authApi = {
  /** 账号密码登录 → 返回 token + 用户信息 */
  login: (payload: LoginPayload) => request.post<unknown, LoginResult>('/auth/login', payload),

  /** 获取当前登录用户信息 */
  getUserInfo: () => request.get<unknown, UserInfo>('/auth/userInfo'),

  /** 刷新 Token（401 自动调用） */
  refreshToken: (refreshToken: string) =>
    request.post<unknown, { token: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    }),

  /** 登出 */
  logout: () => request.post<unknown, void>('/auth/logout'),
}
