import { expect, test, type Page } from '@playwright/test'

async function login(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByPlaceholder('请输入用户名').fill('admin')
  await page.getByPlaceholder('请输入密码').fill('123456')
  await page.getByRole('button', { name: '登 录' }).click()
  await page.waitForURL('**/workbench')
}

async function expectStableScreenshot(page: Page, name: string): Promise<void> {
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
    maxDiffPixelRatio: 0.015,
  })
}

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
]) {
  test(`核心页面视觉快照 ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)

    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /生态环境问题/ })).toBeVisible()
    await expectStableScreenshot(page, `login-${viewport.width}x${viewport.height}.png`)

    await login(page)
    await expect(page.locator('.stat-card')).toHaveCount(6)
    await expect(page.locator('.content-panel .el-table__body tbody tr').first()).toBeVisible()
    await expect(page.locator('.el-loading-mask')).toHaveCount(0)
    await expectStableScreenshot(page, `workbench-${viewport.width}x${viewport.height}.png`)

    await page.goto('/ledger')
    await expect(page.locator('.table-panel')).toBeVisible()
    await expect(page.locator('.table-panel .el-table__body tbody tr').first()).toBeVisible()
    await expect(page.locator('.el-loading-mask')).toHaveCount(0)
    await expectStableScreenshot(page, `ledger-${viewport.width}x${viewport.height}.png`)
  })
}
