import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { isAbsolute } from 'node:path'
import { resolveHermesInstallationEnvironment } from '../runtime/installation'
import { resolveHermesBin } from '../runtime/process'
import { getProfileDir } from '../profiles/profile'
import { logger } from '../../../studio/public/logging'
import { fetchOpenCodeFreeModels } from '../../../studio/public/provider-catalog'
import { OPENCODE_FREE_PROVIDER, OPENCODE_FREE_BASE_URL } from '../../../studio/contracts/opencode-free'
import { writeProviderModelCatalogEntry } from './model-catalog-cache'

const execFileAsync = promisify(execFile)
const PROBE = "from hermes_cli.auth import PROVIDER_REGISTRY; print('supported' if 'opencode-free' in PROVIDER_REGISTRY else 'unsupported')"
const REFRESH_MS = 5 * 60_000
const RETRY_MS = 60_000

export type OpenCodeFreeStatus = 'loading' | 'ready' | 'error' | 'unsupported'
let status: OpenCodeFreeStatus = 'loading'
let inflight: Promise<void> | undefined
let retryTimer: ReturnType<typeof setTimeout> | undefined

export function getOpenCodeFreeStatus(): OpenCodeFreeStatus {
  return status
}

async function probeSupport(): Promise<boolean> {
  const hermesHome = getProfileDir('default')
  let bin = resolveHermesBin()
  if (!process.env.HERMES_AGENT_BRIDGE_PYTHON && !isAbsolute(bin) && !bin.includes('/') && !bin.includes('\\')) {
    const result = await execFileAsync(process.platform === 'win32' ? 'where.exe' : 'which', [bin], {
      timeout: 2000, windowsHide: true, maxBuffer: 64 * 1024,
    })
    bin = result.stdout.trim().split(/\r?\n/)[0] || bin
  }
  const installation = resolveHermesInstallationEnvironment(bin, hermesHome)
  const python = process.env.HERMES_AGENT_BRIDGE_PYTHON || installation.python
  if (!python) throw new Error('Hermes Python could not be resolved')
  const { stdout } = await execFileAsync(python, ['-c', PROBE], {
    cwd: process.env.HERMES_AGENT_ROOT || installation.agentRoot,
    env: { ...process.env, HERMES_HOME: hermesHome },
    timeout: 5000,
    maxBuffer: 64 * 1024,
    windowsHide: true,
  })
  return stdout.trim().split(/\r?\n/).at(-1) === 'supported'
}

/** Disabled - OpenCode Free is bypassed by default */
export function initializeOpenCodeFreeInBackground(): void {
  // noop
}
