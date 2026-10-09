# PC 视觉令牌实施记录

令牌来源：根目录 `PC端视觉规范.md` 和 `demo-pc-*.html`。

| 类型 | 实施值 |
|---|---|
| 主品牌色 | `#1A5F2A` |
| 深品牌色 | `#0D3B1A` / `#0A2A14` |
| 页面背景 | `#F0F3EE` |
| 卡片表面 | `#FAFBF8` |
| 正文 / 次要文字 | `#1A1A2E` / `#6B7280` |
| 标准边框 | `#E5E7EB` |
| 顶栏 / 侧栏 | `60px` / `240px` |
| 页面内边距 | `24px` |
| 按钮、输入、菜单圆角 | `8px` |
| 卡片圆角 | `12px` |
| 标签圆角 | `4px` |

实现位置：`src/styles/variables.scss`、`src/styles/index.scss`、`src/styles/theme-override.scss`。

页面不得新增与上述值近似但不相同的色值；确需例外时先登记视觉差异。
