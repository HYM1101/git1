# 公共组件清单（components/common）

> 版本：V1.0 · 更新：2026-08-25 · 全部组件带 JSDoc 与使用示例
> 目标：公共组件 ≥ 15 个（CP-01 验收项，当前 17 个）

## 组件列表

| # | 组件 | 用途 | 关键 Props / Emits |
|---|---|---|---|
| 1 | `LevelTag` | 重要等级标签（红/橙/绿） | `level: ImportantLevel` |
| 2 | `WarningTag` | 预警等级标签（四级） | `level: WarningLevel` |
| 3 | `StatusTag` | 问题状态标签（五态） | `status: ProblemStatus` |
| 4 | `StatCard` | 统计卡片（数值 + 图标） | `label / value / color / icon / onClick` |
| 5 | `StatPanel` | 预警统计面板（主题色边框） | `label / value / color` + 默认插槽 |
| 6 | `PhaseProgress` | 整改阶段进度条（按权重计算） | `phases / completedIndexes / percent / showPhases` |
| 7 | `ProgressRing` | 环形进度 | `percent / width / strokeWidth` |
| 8 | `FileUpload` | 附件上传（类型/大小/数量校验） | `accept / maxSize / limit / v-model:fileList / reject` |
| 9 | `PaginationBar` | 分页条（受控） | `page / pageSize / total / update:page / update:pageSize` |
| 10 | `FilterBar` | 筛选栏容器 | 默认插槽 + `search / reset` 事件 |
| 11 | `RiskTagList` | 风险标签展示（高危红色） | `tags: string[]` |
| 12 | `TimelineList` | 问题生命周期时间线 | `items: {time,action,desc,user}[]` |
| 13 | `EmptyState` | 空状态占位 | `description / imageSize` |
| 14 | `PageHeader` | 页头（标题 + 面包屑 + 操作区） | `title / crumbs` + `#actions` 插槽 |
| 15 | `DetailItem` | 详情字段网格 | `items: {key,label,value}[]` + 具名插槽 |
| 16 | `TagInput` | 标签输入（去重、限额） | `v-model / suggestions / max` |
| 17 | `OverdueTag` | 超期/剩余天数标签 | `days: number` |

## 使用示例

### 双标签（台账列表核心）
```vue
<el-table-column label="重要等级">
  <template #default="{ row }"><LevelTag :level="row.importantLevel" /></template>
</el-table-column>
<el-table-column label="预警等级">
  <template #default="{ row }"><WarningTag :level="row.warningLevel" /></template>
</el-table-column>
```

### 阶段进度（进度调度页）
```vue
<PhaseProgress
  :phases="getPhases(detail.pollutionType)"
  :completed-indexes="detail.completedPhases"
/>
```

### 附件上传（进度填报）
```vue
<FileUpload
  v-model:file-list="attachments"
  accept=".jpg,.png,.pdf"
  :max-size="10 * 1024 * 1024"
  :limit="5"
  @reject="(m) => (errorMsg = m)"
/>
```

## 规范

- 组件目录：`src/components/common/`（跨页面复用）、`src/components/business/`（业务组合）
- 命名：PascalCase 多词；Props 用 `defineProps<{}>` 类型声明；Emits 用 `defineEmits<{}>`
- 双标签渲染必须走 `LevelTag` / `WarningTag`，禁止页面手写颜色
- 新增公共组件后在本表登记并补 JSDoc 示例
