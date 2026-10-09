# PC 页面映射表

| HTML 基准 | Vue 文件 | 路由 | 角色限制 | 基线状态 |
|---|---|---|---|---|
| `demo-pc-login.html` | `src/views/auth/Login.vue` | `/login` | 公开 | 第五批 Vue 三档快照已生成，HTML 对照待签字 |
| `demo-pc-workbench.html` | `src/views/workbench/Workbench.vue` | `/workbench` | 登录用户 | 第五批 Vue 三档快照已生成，HTML 对照待签字 |
| `demo-pc-ledger.html` | `src/views/ledger/LedgerList.vue` | `/ledger` | 登录用户 | 第五批 Vue 三档快照已生成，HTML 对照待签字 |
| `demo-pc-input.html` | `src/views/problem/ProblemInput.vue` | `/problem/input` | admin/operator | 已纳入 HTML 自动对比 |
| `demo-pc-detail.html` | `src/views/problem/ProblemDetail.vue` | `/problem/:id` | 登录用户 | 已纳入 HTML 自动对比 |
| `demo-pc-schedule.html` | `src/views/schedule/Schedule.vue` | `/schedule` | 登录用户 | 已纳入 HTML 自动对比 |
| `demo-pc-warning.html` | `src/views/warning/WarningCenter.vue` | `/warning` | 登录用户 | 已纳入 HTML 自动对比 |
| `demo-pc-gis.html` | `src/views/gis/GisMap.vue` | `/gis` | 登录用户 | 已纳入 HTML 自动对比 |
| `demo-pc-analysis.html` | `src/views/analysis/AnalysisBoard.vue` | `/analysis` | 登录用户 | 已纳入 HTML 自动对比 |
| `demo-pc-admin.html` | `src/views/admin/AdminPanel.vue` | `/admin` | admin | 已纳入 HTML 自动对比 |
| `demo-pc-files.html` | 未决策 | 未决策 | 未决策 | K-07 阻塞，不新增路由 |

## 固定数据状态

- 登录：默认、字段校验、凭据错误、提交中。
- 工作台：管理员账号、6 张统计卡、固定待办数据。
- 台账：默认列表、筛选结果、空态、分页。
- 动态时间、动画和随机数据在视觉截图时必须冻结。
