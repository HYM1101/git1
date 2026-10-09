import { expect, test } from '@playwright/test'

test('从 PC 端指挥大屏入口打开 demo4-standalone', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /管理员/ }).click()
  await page.getByRole('button', { name: '登 录' }).click()
  await expect(page).toHaveURL(/\/workbench$/)

  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: /指挥大屏/ }).click()
  const screenPage = await popupPromise

  await screenPage.waitForLoadState('domcontentloaded')
  await expect(screenPage).toHaveURL(/localhost:5173\/?$/)
  await expect(screenPage).toHaveTitle('大屏可视化')
  await expect(screenPage.getByText('百色市生态环境智慧指挥中心')).toBeVisible()
  await expect(screenPage.locator('#root')).not.toBeEmpty()
})
