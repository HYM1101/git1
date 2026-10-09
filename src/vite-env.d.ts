/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** 后端 API 基础路径 */
  readonly VITE_API_BASE_URL: string
  /** 是否启用前端 mock（true 时由 axios-mock-adapter 拦截 /api/*） */
  readonly VITE_MOCK: string
  /** 百度地图浏览器端 AK（需配置 Referer 白名单） */
  readonly VITE_BAIDU_MAP_AK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
