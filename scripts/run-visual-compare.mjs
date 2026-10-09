import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import process from 'node:process'

function run(command, args) {
  const result = spawnSync(command, args, { cwd: process.cwd(), env: process.env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(process.execPath, [resolve('scripts/run-e2e.mjs'), 'e2e/html-compare.spec.ts'])
run('python', [resolve('scripts/compare-visuals.py')])
