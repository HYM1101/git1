# 构建产物分析报告（BD-06）

**日期**：2026-08-24 ｜ **构建方式**：`ANALYZE=1 npx vite build`（含 rollup-plugin-visualizer）
**可视化报告**：`dist/stats.html`（构建产物目录，可浏览器打开查看依赖图）

## 一、验收指标对照

| 指标 | 目标 | 实测 | 结论 |
|---|---|---|---|
| 构建耗时 | < 60s | 20.0s（常规）/ 47.7s（ANALYZE） | ✅ |
| 首屏 JS(gzip) | < 300KB | **≈ 115KB**（index + vendor-vue + vendor-http + Login） | ✅ 达标 62% |
| 单 chunk > 500KB | 无（echarts 除外） | 最大 vendor-echarts 209KB(gzip) | ✅ |
| 总 JS(gzip) | 可接受 | 531KB（10 页面全量，按需加载） | ✅ |

## 二、Chunk 分布（Top 10，gzip 后）

| Chunk | 大小(gzip) | 说明 |
|---|---|---|
| vendor-echarts | 209.0KB | ECharts 按需（map/geo/visualMap 是重量级），仅地图/分析页加载 |
| vendor-vue | 60.9KB | vue + vue-router + pinia 运行时 |
| vendor-http | 39.1KB | axios + 拦截器链 |
| ProblemInput | 33.2KB | 录入页（分步表单） |
| el-table-column | 29.2KB | Element Plus 表格（按需拆分） |
| GisMap | 27.2KB | 空间分析（地图点位/热力） |
| el-menu-item | 21.1KB | 侧边菜单 |
| index（主入口） | 12.4KB | 应用引导 + 路由表 |
| AdminPanel | 11.4KB | 系统管理 |
| ProblemDetail | 11.3KB | 问题详情 |

## 三、优化效果（相对 Phase 1 全量引入）

| 指标 | Phase 1（全量） | Phase 2（按需） | 降幅 |
|---|---|---|---|
| 总 JS | 1180KB | 616KB（页面未全量时）→ 1533KB（10 页全量） | 按需生效 |
| Element Plus | 944KB 单 chunk | 分散按需（el-* 独立 chunk） | 首屏不再全量加载 |
| 首屏 JS(gzip) | ~345KB | **~115KB** | **-67%** |

## 四、已实施优化

1. **BD-01 manualChunks**：vue/pinia/router → vendor-vue；axios → vendor-http；echarts → vendor-echarts
2. **BD-02 Element Plus 按需引入**：unplugin-auto-import + unplugin-vue-components（移除全量 app.use）
   - 经验：**Element Plus 不可用 manualChunks 强制分组**（实测 +500KB 全量打包），按需拆分到引用页面 chunk 更优
3. **BD-03 ECharts 按需引入**：echarts/core + 仅注册 bar/line/pie/scatter/map + 所需组件
4. **BD-04 gzip 压缩**：vite-plugin-compression 输出 .gz 产物（nginx gzip_static 直接服务）

## 五、后续建议（Phase 3）

- Element Plus 的 el-* chunk 仍分散（el-table-column 29KB 等），若页面间共享度提升可考虑 `build.splitVendorChunk` 阈值微调
- vendor-echarts 209KB 是地图页必需，若只做 PC 可评估是否保留热力图组件（visualMap 约 30KB）
- 图片资源压缩（vite-plugin-image-optimizer）待加入（当前无大图资源）
