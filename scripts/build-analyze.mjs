import { spawnSync } from 'node:child_process'
import process from 'node:process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npmCommand, ['exec', 'vite', 'build'], {
  env: { ...process.env, ANALYZE: '1' },
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
