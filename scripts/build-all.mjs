import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const pcDir = path.resolve(scriptsDir, '..')
const screenDir = path.resolve(pcDir, '..', 'demo4-standalone')
const npmCommand = 'npm'

function runBuild(name, cwd, script) {
  console.log(`\n正在构建${name}...`)
  const result = spawnSync(npmCommand, ['run', script], {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.error) {
    console.error(`${name}构建命令无法启动：${result.error.message}`)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}

runBuild('PC端', pcDir, 'build:pc')
runBuild('指挥大屏', screenDir, 'build')

const screenSource = path.join(screenDir, 'dist')
const screenTarget = path.join(pcDir, 'dist', 'screen')
if (!existsSync(screenSource)) {
  console.error('指挥大屏构建产物不存在，无法完成集成。')
  process.exit(1)
}

rmSync(screenTarget, { recursive: true, force: true })
mkdirSync(screenTarget, { recursive: true })
cpSync(screenSource, screenTarget, { recursive: true })
console.log('\n构建完成：指挥大屏已集成到 dist/screen。')
