import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import process from 'node:process'

const npmCli = process.env.npm_execpath
const playwrightCli = resolve('node_modules/@playwright/test/cli.js')

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

// E2E 必须使用固定 Mock 数据，避免依赖真实后端或上一次构建产物。
if (!npmCli) throw new Error('无法定位 npm CLI，请通过 npm run test:e2e 执行')

run(process.execPath, [npmCli, 'run', 'build:e2e'])
run(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)])
