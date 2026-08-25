/**
 * Playwright E2E 配置
 * 服务方式：preview 静态服务构建产物（VITE_MOCK=true 内联，见 scripts/e2e 说明）
 * 说明：本沙箱环境下 vite dev 的依赖优化清理会触发进程崩溃，故 E2E 基于构建产物运行
 * 浏览器基线：本机 Edge（msedge channel）
 */
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:8090',
    headless: true,
    screenshot: 'only-on-failure',
    locale: 'zh-CN',
  },
  projects: [
    {
      name: 'msedge',
      use: { channel: 'msedge' },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 8090 --strictPort',
    url: 'http://localhost:8090',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
