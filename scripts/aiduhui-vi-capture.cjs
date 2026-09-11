// aiduHUI VI evidence capture — drives the real Chrome install via Playwright's
// `channel: 'chrome'`, so no browser download is needed.
//
// It logs in through the real login form, then walks each workbench section and
// writes a full-page screenshot per section to /tmp/aiduhui_shots/.
const { chromium } = require('@playwright/test')
const fs = require('fs')

const BASE = 'http://127.0.0.1:8649'
const OUT = '/tmp/aiduhui_shots'
const SHOTS = [
  { name: '10_workbench_models', query: '#/workbench' },
  { name: '11_workbench_settings_compression', query: '#/workbench?s=settings' },
  { name: '12_workbench_settings_performance', query: '#/workbench?s=settings&p=performance' },
  { name: '13_workbench_settings_usage', query: '#/workbench?s=settings&p=usage' },
  { name: '14_workbench_settings_logs', query: '#/workbench?s=settings&p=logs' },
  { name: '15_workbench_jobs', query: '#/workbench?s=jobs' },
  { name: '16_workbench_channels', query: '#/workbench?s=channels' },
  { name: '17_workbench_memory', query: '#/workbench?s=memory' },
]

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })

  await page.goto(BASE, { waitUntil: 'networkidle' })

  // Real login through the form, so we exercise the same path a user does.
  const user = page.locator('input').first()
  const pass = page.locator('input[type="password"]').first()
  if (await pass.count()) {
    await user.fill('admin')
    await pass.fill('123456')
    await page.locator('button[type="submit"], button:has-text("登录"), button:has-text("Sign in")').first().click()
    await page.waitForTimeout(2500)
  }

  for (const shot of SHOTS) {
    await page.goto(`${BASE}/${shot.query}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1800)
    await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: false })
    console.log(`captured ${shot.name} -> ${page.url()}`)
  }

  if (errors.length) {
    console.log('\n--- page errors ---')
    for (const e of [...new Set(errors)].slice(0, 25)) console.log(e)
  } else {
    console.log('\nno page/console errors')
  }

  await browser.close()
})().catch((e) => {
  console.error('CAPTURE FAILED:', e.message)
  process.exit(1)
})
