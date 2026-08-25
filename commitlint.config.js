/**
 * commitlint 配置 —— Conventional Commits 规范
 * 提交格式：<type>(<scope>): <subject>
 * 示例：feat(ledger): 新增台账筛选；fix(login): 修复登录 401 跳转
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型限定
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 Bug
        'docs', // 文档
        'style', // 格式（不影响代码运行）
        'refactor', // 重构（非新功能非修 Bug）
        'perf', // 性能优化
        'test', // 测试
        'build', // 构建/依赖
        'ci', // CI 配置
        'chore', // 杂项（配置、工具）
        'revert', // 回滚
      ],
    ],
    // 主题非空
    'subject-empty': [2, 'never'],
    // 类型非空
    'type-empty': [2, 'never'],
    // 主题不超过 100 字符
    'subject-max-length': [2, 'always', 100],
    // body 每行不超过 100 字符
    'body-max-line-length': [2, 'always', 100],
    // 必须有 body（影响较大的提交强制说明）
    'body-leading-blank': [2, 'always'],
  },
  // 提示信息
  prompt: {
    settings: {},
    messages: {
      type: '选择提交类型:',
      subject: '填写简短描述（必填）:',
      body: '填写详细描述（可选）:',
    },
    types: [
      { value: 'feat', name: 'feat: 新功能' },
      { value: 'fix', name: 'fix: 修复 Bug' },
      { value: 'docs', name: 'docs: 文档变更' },
      { value: 'style', name: 'style: 代码格式' },
      { value: 'refactor', name: 'refactor: 代码重构' },
      { value: 'perf', name: 'perf: 性能优化' },
      { value: 'test', name: 'test: 添加测试' },
      { value: 'build', name: 'build: 构建系统' },
      { value: 'ci', name: 'ci: CI 配置' },
      { value: 'chore', name: 'chore: 工具配置' },
      { value: 'revert', name: 'revert: 回滚' },
    ],
  },
}
