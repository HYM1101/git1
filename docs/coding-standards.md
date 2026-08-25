# 前端代码规范（ec-frontend）

> 版本：V1.0 · 适用范围：`ec-frontend/` 工程全部代码
> 配套工具链：ESLint 9（flat config）+ Prettier + Stylelint + husky + lint-staged + commitlint

## 1. 工具链与命令

| 命令 | 作用 | 何时运行 |
|------|------|----------|
| `npm run lint` | ESLint 检查全部源码 | 提交前 / CI |
| `npm run format` | Prettier 格式化 | 提交前 |
| `npm run typecheck` | vue-tsc 类型检查 | 提交前 / CI |
| `npm run test:unit` | Vitest 单元测试 | 提交前 / CI |
| `npm run build` | 生产构建（含 typecheck） | 发布前 / CI |

提交时 husky 自动对**暂存文件**执行 lint + format（lint-staged），格式不合规的提交会被拦截。

## 2. 命名约定

| 对象 | 规范 | 示例 |
|------|------|------|
| 目录 | 小写 kebab-case（领域化） | `src/views/problem/` |
| Vue 组件文件 | PascalCase | `LedgerList.vue` |
| Vue 组件名 | PascalCase（多词，避免与原生元素冲突） | `LevelTag` |
| TS/JS 文件 | 小写 kebab-case | `request.ts` |
| 常量 | UPPER_SNAKE_CASE | `WARNING_THRESHOLDS` |
| 类型/接口 | PascalCase，前缀 `I` 不加 | `UserInfo`, `PageResult` |
| 函数/变量 | camelCase | `calcImportantLevel` |
| Pinia Store | use + PascalCase + Store | `useUserStore` |
| 路由 path | kebab-case | `/problem/input` |
| 路由 name | PascalCase | `ProblemInput` |

## 3. TypeScript 严格模式

- `strict: true` 已开启；禁止使用 `any`（确需时用 `unknown` + 类型收窄）
- 函数参数/返回值必须有显式类型；`noUnusedLocals`/`noUnusedParameters` 已开启
- 禁止 `@ts-ignore`；确需绕过时写 `@ts-expect-error` 并注明原因
- 业务枚举值（重要等级/预警等级/状态）统一从 `src/utils/` 类型导入，禁止字符串散落

## 4. Vue 组件规范

- `<script setup lang="ts">` 语法，组合式 API
- Props 用 `defineProps<{...}>()` 类型声明；Emits 用 `defineEmits<{...}>()`
- 样式用 `<style scoped lang="scss">`；颜色/间距优先引用 `src/styles/variables.scss` 变量
- 组件文件只做展示与交互，业务计算调用 `src/utils/` 纯函数
- 双标签渲染统一用 `LevelTag` / `WarningTag` 公共组件（禁止各页面手写颜色）

## 5. 状态管理（Pinia）

- 全局登录态：`useUserStore`（唯一，禁止页面自存 token）
- 业务列表：`useProblemStore`（含筛选条件与分页）
- Store 内禁止直接操作 DOM；异步逻辑放 Action

## 6. API 层约定

- 所有请求经 `src/api/request.ts`（自动注入 Token、解包响应体、401 刷新）
- 按域拆分文件：`auth.ts` / `problem.ts`（其余域合并于 `index.ts`）
- 接口函数命名 `getList` / `getDetail` / `create` / `transition` 等，参数类型化
- Mock 开关：`VITE_MOCK=on` 走 `src/api/mock/`，后端就绪后设 `off`

## 7. Git 提交规范

提交格式（Conventional Commits）：

```
<type>(<scope>): <subject>

<body>
```

- type 枚举：`feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
- scope 可选，建议使用业务域：`ledger` `login` `warning` `level` `api` `router` 等
- subject 为祈使句、不超过 100 字符；重大变更必须写 body 说明影响

示例：
```
feat(ledger): 新增问题台账筛选与分页

- 支持按重要等级/预警等级/状态筛选
- 列表按预警等级优先、超期天数降序排序
```

## 8. 分支策略

- 主分支：`main`（受保护，禁止直接推送）
- 开发分支：`develop`（集成测试环境）
- 功能分支：`feature/<业务域>-<简述>`（如 `feature/ledger-filter`）
- 修复分支：`fix/<简述>`（如 `fix/login-401-loop`）
- 提交流程：feature 分支开发 → MR 合并到 develop → 验证后合并 main
- MR 必须通过 CI（lint + typecheck + test + build 全绿）且至少 1 人 Review

## 9. 目录职责

```
src/
├── api/          # API 层（request 实例 + 分域接口 + mock）
├── components/   # 公共组件（common/ 与业务组件 business/）
├── composables/  # 组合式函数
├── constants/    # 全局常量（双标签颜色映射等）
├── router/       # 路由与守卫
├── stores/       # Pinia 状态
├── styles/       # 全局样式（variables/reset/index）
├── types/        # 全局类型
├── utils/        # 业务纯函数（level/warning/progress/status）
└── views/        # 页面级组件（按业务域分子目录）
```

## 10. 验收红线

- `npm run lint` 0 error
- `npm run typecheck` 0 error
- `npm run test:unit` 全绿
- `npm run build` 成功
- 禁止提交含 `console.log`（调试后必须移除）；`debugger` 同理
