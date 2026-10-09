import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const outputDir = resolve('artifacts/visual-compare')
const comparisonPages = [
  { name: 'input', html: 'demo-pc-input.html', route: '/problem/input' },
  { name: 'detail', html: 'demo-pc-detail.html?id=PRB-2024-0001', route: '/problem/P0001' },
  { name: 'schedule', html: 'demo-pc-schedule.html', route: '/schedule' },
  { name: 'warning', html: 'demo-pc-warning.html', route: '/warning' },
  { name: 'gis', html: 'demo-pc-gis.html', route: '/gis' },
  { name: 'analysis', html: 'demo-pc-analysis.html', route: '/analysis' },
  { name: 'admin', html: 'demo-pc-admin.html', route: '/admin' },
] as const

async function login(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByPlaceholder('请输入用户名').fill('admin')
  await page.getByPlaceholder('请输入密码').fill('123456')
  await page.getByRole('button', { name: '登 录' }).click()
  await page.waitForURL('**/workbench')
}

async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: resolve(outputDir, `${name}.png`),
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
  })
}

async function waitForStablePage(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  await page
    .locator('.el-loading-mask')
    .waitFor({ state: 'detached', timeout: 5000 })
    .catch(() => {})
  await page.waitForTimeout(700)
}

test('生成 HTML 与 Vue 核心页面对照截图', async ({ page }) => {
  test.setTimeout(90_000)
  await mkdir(outputDir, { recursive: true })
  await page.setViewportSize({ width: 1920, height: 1080 })

  const htmlLoginUrl = pathToFileURL(resolve('..', 'demo-pc-login.html')).href
  await page.goto(htmlLoginUrl, { waitUntil: 'load' })
  await capture(page, 'login-html')
  await page.locator('#username').fill('admin')
  await page.locator('#password').fill('123456')
  await page.locator('#login-btn').click()
  await page.waitForURL('**/demo-pc-workbench.html')
  await page.waitForTimeout(1300)
  await capture(page, 'workbench-html')

  await page.goto(pathToFileURL(resolve('..', 'demo-pc-ledger.html')).href, { waitUntil: 'load' })
  await expect(page.locator('#ledgerTbody tr').first()).toBeVisible()
  await capture(page, 'ledger-html')

  for (const target of comparisonPages) {
    const [fileName, query] = target.html.split('?')
    const url = `${pathToFileURL(resolve('..', fileName)).href}${query ? `?${query}` : ''}`
    await page.goto(url, { waitUntil: 'load' })
    await page.waitForTimeout(700)
    await capture(page, `${target.name}-html`)
  }

  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /生态环境问题/ })).toBeVisible()
  await page.getByPlaceholder('请输入用户名').fill('admin')
  await page.getByPlaceholder('请输入密码').fill('123456')
  await capture(page, 'login-vue')

  await login(page)
  await expect(page.locator('.todo-list .todo-item').first()).toBeVisible()
  await expect(page.locator('.el-loading-mask')).toHaveCount(0)
  await capture(page, 'workbench-vue')

  await page.goto('/ledger')
  await expect(page.locator('.table-panel .ledger-table tbody tr').first()).toBeVisible()
  await expect(page.locator('.table-panel.is-loading')).toHaveCount(0)
  await capture(page, 'ledger-vue')

  for (const target of comparisonPages) {
    await page.goto(target.route)
    await expect(page.locator('.app-shell')).toBeVisible()
    await waitForStablePage(page)
    await capture(page, `${target.name}-vue`)
  }
})
