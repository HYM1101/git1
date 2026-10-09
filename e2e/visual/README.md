# PC 视觉回归说明

## 固定条件

- Chromium 使用项目 Playwright 锁定版本。
- 视口：1920×1080（主基线）、1440×900、1366×768。
- DPR：1；浏览器缩放：100%；字体使用系统微软雅黑优先。
- development mock 开启，账号与数据种子固定。
- 截图前关闭动画、过渡、光标和实时变化内容。

## 通过标准

- 整页像素差异率不超过 1.5%。
- 关键组件像素差异率不超过 0.5%。
- 侧栏、顶栏、标题、主按钮、首卡片、表头、分页等锚点偏差不超过 2px。

## 基线管理

基线目录由 Playwright 按测试文件生成，当前核心页面基线位于
`e2e/visual-regression.spec.ts-snapshots/`。

- 执行视觉回归：`npm run test:visual`
- 经批准更新基线：`npm run test:visual:update`
- 执行全部 E2E：`npm run test:e2e`
- 生成 HTML/Vue 差异报告：`npm run visual:compare`

基线失败时先判断代码回退还是规范变更；没有产品批准不得使用更新命令覆盖基线。动态区域只能按登记清单做最小范围遮罩。

当前快照用于防止 Vue 实现发生非预期回退，不代表已完成 HTML 像素差异签字。HTML 对照仍以根目录 `demo-pc-*.html` 为真值，并按整页 1.5%、关键组件 0.5% 阈值单独验收。
