/**
 * Vitest 配置 —— 单元测试框架
 * Phase 1 纯函数测试用 node 环境（无需 DOM）
 * Phase 2 组件测试时可改为 jsdom
 */
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/api/mock/**'],
    },
  },
})
