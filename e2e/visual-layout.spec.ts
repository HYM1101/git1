import { expect, test, type Page } from '@playwright/test'

async function login(page: Page, username = 'admin', password = '123456'): Promise<void> {
  await page.goto('/login')
  await page.getByPlaceholder('请输入用户名').fill(username)
  await page.getByPlaceholder('请输入密码').fill(password)
  await page.getByRole('button', { name: '登 录' }).click()
  await page.waitForURL('**/workbench')
}

async function expectAppShell(page: Page): Promise<void> {
  await expect(page.locator('.app-shell__header')).toHaveCSS('height', '60px')
  await expect(page.locator('.app-shell__sidebar')).toHaveCSS('width', '240px')
  await expect(page.locator('.app-shell__main')).toHaveCSS('background-color', 'rgb(240, 243, 238)')
}

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
]) {
  test(`第二批页面布局基线 ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await login(page)

    await page.goto('/problem/input')
    await expectAppShell(page)
    await expect(page.getByRole('heading', { name: '问题录入' })).toBeVisible()
    await expect(page.locator('.form-card')).toBeVisible()

    await page.goto('/schedule')
    await expectAppShell(page)
    await expect(page.getByRole('heading', { name: '进度管理' })).toBeVisible()
    await expect(page.locator('.schedule-panel')).toBeVisible()

    await page.getByRole('button', { name: '详情', exact: true }).first().click()
    await page.waitForURL('**/problem/**')
    await expectAppShell(page)
    await expect(page.locator('.detail-content')).toBeVisible()
  })
}

test('公共组件视觉规范', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page, 'handler', '123456')

  await page.goto('/ledger')
  await expect(page.locator('.filter-bar')).toHaveCSS('background-color', 'rgb(250, 251, 248)')
  await expect(page.locator('.filter-bar')).toHaveCSS('border-radius', '8px')
  await expect(page.locator('.pagination-bar')).toHaveCSS('min-height', '56px')
  await expect(page.locator('.el-table th.el-table__cell').first()).toHaveCSS(
    'background-color',
    'rgb(238, 245, 238)',
  )

  await page.goto('/analysis')
  await expect(page.locator('.stat-card').first()).toHaveCSS('border-radius', '12px')
  await expect(page.locator('.stat-card').first()).toHaveCSS(
    'background-color',
    'rgb(250, 251, 248)',
  )

  await page.goto('/schedule')
  await page.getByRole('button', { name: '填报进度' }).first().click()
  await expect(page.locator('.progress-dialog')).toBeVisible()
  await expect(page.locator('.progress-dialog')).toHaveCSS('border-radius', '16px')
})

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
]) {
  test(`第三批页面布局基线 ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await login(page)

    await page.goto('/warning')
    await expectAppShell(page)
    await expect(page.locator('.warning-content')).toBeVisible()
    await expect(page.locator('.warning-panel')).toBeVisible()

    await page.goto('/gis')
    await expectAppShell(page)
    await expect(page.locator('.gis-content')).toBeVisible()
    await expect(page.locator('.chart-card')).toHaveCount(2)

    await page.goto('/analysis')
    await expectAppShell(page)
    await expect(page.locator('.analysis-content')).toBeVisible()
    await expect(page.locator('.chart-card')).toHaveCount(3)

    await page.goto('/admin')
    await expectAppShell(page)
    await expect(page.locator('.admin-content')).toBeVisible()
    await expect(page.locator('.admin-tabs')).toBeVisible()
  })
}
