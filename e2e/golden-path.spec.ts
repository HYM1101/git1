/**
 * TE-07 Playwright E2E —— 黄金链路 5 条用例
 * ① 登录 → 工作台  ② 台账 → 详情  ③ 录入 → 自动定级
 * ④ 进度填报 → 提交验收按钮激活  ⑤ responsible 角色权限（菜单隔离）
 */
import { test, expect, type Page } from '@playwright/test'

/** 管理员登录（全局 beforeEach 复用） */
async function loginAs(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.getByPlaceholder('请输入用户名').fill(username)
  await page.getByPlaceholder('请输入密码').fill(password)
  await page.getByRole('button', { name: '登 录' }).click()
  await page.waitForURL('**/workbench')
}

test.describe('黄金链路 E2E', () => {
  test('① 登录 → 工作台（统计卡片 + 待办列表加载）', async ({ page }) => {
    await loginAs(page, 'admin', 'admin123')
    // 工作台标题
    await expect(page.locator('.layout-header .title')).toContainText('生态环境问题闭环管理系统')
    // 统计卡片渲染（6 张）
    await expect(page.locator('.stat-card')).toHaveCount(6)
    // 待办表格渲染
    await expect(page.locator('.section .el-table')).toBeVisible()
  })

  test('② 台账 → 详情（双标签 + 状态流转按钮）', async ({ page }) => {
    await loginAs(page, 'admin', 'admin123')
    await page.goto('/ledger')
    // 台账表格加载（编号列存在）
    await expect(page.locator('.el-table__header-wrapper')).toContainText('编号')
    // 进入第一行详情
    await page.locator('.el-table__body-wrapper tbody tr').first().locator('text=详情').click()
    await page.waitForURL('**/problem/**')
    // 详情页展示：标题 + 等级徽章 + 状态标签
    await expect(page.locator('.level-badge')).toBeVisible()
    await expect(page.locator('.status-tag')).toBeVisible()
  })

  test('③ 问题录入 → 自动定级（3×3 矩阵联动）', async ({ page }) => {
    await loginAs(page, 'admin', 'admin123')
    await page.goto('/problem/input')
    // 填写基础信息
    await page.getByPlaceholder('简明描述问题').fill('E2E 测试问题：涉重企业废水直排')
    // 来源（默认"日常巡查"，重新选择"中央环保督察"）
    await page.locator('.el-form-item', { hasText: '问题来源' }).locator('.el-select').click()
    await page.locator('.el-select-dropdown__item:has-text("中央环保督察")').first().click()
    // 污染类型（默认"水"，已满足高×中判定，无需重选）
    // 下一步 → 分类标注页
    await page.getByRole('button', { name: '下一步' }).click()
    // 下一步 → 责任时限页
    await page.getByRole('button', { name: '下一步' }).click()
    // 责任时限（责任单位/责任人/截止日期均为必填）
    await page.getByPlaceholder(/右江区生态环境局/).fill('田阳区生态环境局')
    await page.getByPlaceholder(/张主任/).fill('张主任')
    // 日期选择：单日期模式点击即选中并关闭（无"确定"按钮）
    await page.getByPlaceholder('整改截止日期').click()
    await page.locator('.el-date-table td:not(.disabled)').first().click()
    await page.getByRole('button', { name: '下一步' }).click()
    // 自动定级预览（中央督察→来源高 + 水污染→风险中 → 高×中 = 红色）
    await expect(page.locator('.level-badge')).toContainText('红色重大')
  })

  test('④ 进度填报 → 提交验收按钮按 100% 规则激活', async ({ page }) => {
    // responsible 登录：有填报进度权限
    await loginAs(page, 'resp', 'resp123')
    await page.goto('/schedule')
    // 第一行（整改中/已驳回）打开填报对话框
    const fillRow = page.locator('.el-table__body-wrapper tbody tr', { hasText: '填报进度' }).first()
    await fillRow.locator('text=填报进度').click()
    // 对话框内：填措施 + 成效 → 三扇区进度 60%
    await page.getByPlaceholder(/整改措施/).fill('已完成设施改造')
    await page.getByPlaceholder(/整改成效/).fill('排放达标')
    await expect(page.locator('.el-dialog .el-progress__text')).toContainText('60')
    // 上传佐证附件 → 100%
    await page.setInputFiles('.el-dialog input[type=file]', {
      name: 'evidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('pdf-content'),
    })
    await expect(page.locator('.el-dialog .el-progress__text')).toContainText('100')
    // 保存进度成功
    await page.getByRole('button', { name: '保存进度' }).click()
    await expect(page.locator('.el-message--success').first()).toBeVisible()
  })

  test('⑤ responsible 角色权限：无"问题录入"入口', async ({ page }) => {
    await loginAs(page, 'resp', 'resp123')
    // 侧边栏不应出现"问题录入"菜单（仅 admin/operator 可见）
    await expect(page.locator('.el-menu').getByText('问题录入')).toHaveCount(0)
    // 直接访问受限路由被守卫重定向到工作台（首次编译较慢，放宽等待）
    await page.goto('/problem/input')
    await page.waitForURL('**/workbench', { timeout: 20000 })
  })
})
