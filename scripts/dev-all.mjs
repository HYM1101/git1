import { spawn } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const pcDir = path.resolve(scriptsDir, '..')
const screenDir = path.resolve(pcDir, '..', 'demo4-standalone')
const npmCommand = 'npm'

function start(name, cwd, args) {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name}启动失败，退出码：${code}`)
      stopAll(code)
    }
  })
  return child
}

const children = [
  start('PC端', pcDir, ['run', 'dev:pc']),
  start('指挥大屏', screenDir, ['run', 'dev', '--', '--port', '5173', '--strictPort']),
]

let stopping = false
function stopAll(code = 0) {
  if (stopping) return
  stopping = true
  children.forEach((child) => {
    if (!child.killed) child.kill()
  })
  process.exitCode = code
}

process.on('SIGINT', () => stopAll())
process.on('SIGTERM', () => stopAll())
