import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // BD-02：Element Plus API 自动导入（ElMessage/ElMessageBox 等无需手动 import）
    // 注意：ElMessage 等 API 排除自动导入，改为源码内子路径手动导入
    // （ElementPlusResolver 对 API 生成 element-plus/es 聚合入口，会拉入全量组件）
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      exclude: ['ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'],
      dts: 'src/auto-imports.d.ts',
    }),
    // BD-02：Element Plus 组件按需引入（替代全量 app.use(ElementPlus)）
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
    // BD-04：生产构建输出 .gz 产物
    viteCompression({ verbose: true, threshold: 10240 }),
    // BD-06：产物分析（npm run build:analyze 触发）
    process.env.ANALYZE === '1'
      ? visualizer({ filename: 'dist/stats.html', gzipSize: true, open: false })
      : undefined,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 预优化：locale / ConfigProvider 等按需路径在启动时预构建，避免运行时优化触发 reload
  optimizeDeps: {
    include: [
      'element-plus/es/components/config-provider/style/css',
      'element-plus/es/locale/lang/zh-cn',
    ],
  },
  server: {
    port: 8090,
    host: true,
    proxy: {
      // 联调真实后端时启用：/api -> 后端网关地址
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // BD-01：三方依赖独立分包（函数形式）
        // 注意：element-plus 不在此处强制分组 —— unplugin 按需引入（BD-02）已将其按需
        // 拆入引用页面 chunk，强制分组会拉入 element-plus 全量组件（实测 +500KB）
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('echarts')) return 'vendor-echarts'
          if (id.includes('/vue/') || id.includes('vue-router') || id.includes('pinia'))
            return 'vendor-vue'
          if (id.includes('axios')) return 'vendor-http'
          return undefined
        },
      },
    },
  },
})
