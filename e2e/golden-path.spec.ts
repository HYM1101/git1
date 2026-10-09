/** PC 端黄金链路 E2E：使用页面语义选择器，不依赖组件库内部类名。 */
import { test, expect, type Page } from '@playwright/test'

async function loginAs(page: Page, username: string): Promise<void> {
  await page.goto('/login')
  await page.getByRole('textbox', { name: '用户名' }).fill(username)
  await page.getByRole('textbox', { name: '密码' }).fill('123456')
  await page.getByRole('button', { name: '登 录' }).click()
  await page.waitForURL('**/workbench')
}

test.describe('PC 端黄金链路', () => {
  test('管理员登录后工作台统计与待办正常加载', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page.getByText('首页 / 工作台')).toBeVisible()
    await expect(page.locator('.stat-card')).toHaveCount(4)
    await expect(page.locator('.todo-item').first()).toBeVisible()
    await expect(page.getByRole('menuitem', { name: '系统管理' })).toBeVisible()
  })

  test('台账原生表格可以进入详情页', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/ledger')
    await expect(page.locator('.ledger-table thead')).toContainText('问题标题')
    await page.locator('.ledger-table tbody tr').first().click()
    await page.waitForURL('**/problem/**')
    await expect(page.getByText('基础信息区')).toBeVisible()
    await expect(page.getByText('整改进度', { exact: true })).toBeVisible()
    await expect(page.getByText('生命周期', { exact: true })).toBeVisible()
  })

  test('问题录入逐步校验并完成自动定级预览', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/problem/input')
    await page.getByPlaceholder(/简明描述问题/).fill('E2E测试涉重企业废水直排问题')
    await page
      .getByPlaceholder(/请详细描述问题情况/)
      .fill('现场发现企业生产废水未经处理直接排放，需要立即整改。')
    await page.getByRole('button', { name: '下一步' }).click()
    const level2 = page.locator('.el-form-item', { hasText: '污染类型二级' }).locator('.el-select')
    await level2.click()
    await page.getByRole('option', { name: '工业废水' }).click()
    const category = page.locator('.el-form-item', { hasText: '所属分类' }).locator('.el-select')
    await category.click()
    await page.getByRole('option', { name: '涉重企业' }).click()
    await page.getByPlaceholder('请输入行业类别').fill('电镀')
    await page.getByRole('button', { name: '下一步' }).click()
    await page.getByPlaceholder(/右江区生态环境局/).fill('田阳区生态环境局')
    await page.getByPlaceholder(/张主任/).fill('张主任')
    await page.getByPlaceholder(/整改要求及验收标准/).fill('完成设施整改并提供达标监测报告。')
    await page.getByPlaceholder('整改截止日期').fill('2026-12-31')
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(page.getByText('系统判定重要等级')).toBeVisible()
    await expect(page.locator('.level-result .level-badge')).toBeVisible()
  })

  test('整改责任人不具有待交办、预警、统计和录入权限', async ({ page }) => {
    await loginAs(page, 'handler')
    await expect(page.getByRole('menuitem', { name: '问题录入' })).toHaveCount(0)
    await expect(page.getByRole('menuitem', { name: '预警清单' })).toHaveCount(0)
    await expect(page.getByRole('menuitem', { name: '统计分析' })).toHaveCount(0)
    await page.goto('/schedule')
    await expect(page.getByRole('button', { name: '待交办', exact: true })).toHaveCount(0)
    await expect(page.locator('.issue-list')).not.toContainText('待交办')
    await page.goto('/problem/P0016')
    await page.waitForURL('**/ledger')
  })

  test('科室人员拥有待交办和验收入口，但没有系统管理权限', async ({ page }) => {
    await loginAs(page, 'kehu')
    await expect(page.getByRole('menuitem', { name: '问题录入' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: '预警清单' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: '统计分析' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: '系统管理' })).toHaveCount(0)
    await page.goto('/schedule')
    await expect(page.getByRole('button', { name: '待交办', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '待验收', exact: true })).toBeVisible()
  })
})
