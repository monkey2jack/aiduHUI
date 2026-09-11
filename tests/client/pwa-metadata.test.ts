import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

describe('PWA metadata', () => {
  it('links manifest and touch icon from the client shell', () => {
    const html = readFileSync('packages/client/index.html', 'utf8')

    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"')
    expect(html).toContain('rel="icon" type="image/png" href="/assets/img/monkey.png"')
    expect(html).toContain('rel="apple-touch-icon" href="/assets/img/monkey.png"')
    // aiduHUI rebrand: the installed-app title is the brand, not upstream's.
    expect(html).toContain('name="apple-mobile-web-app-title" content="aiduHUI⚕爱嘟心视界"')
  })

  it('ships a standalone web manifest with the Hermes icon', () => {
    const manifest = JSON.parse(readFileSync('packages/client/public/manifest.webmanifest', 'utf8'))

    expect(manifest.name).toBe('aiduHUI⚕爱嘟心视界')
    expect(manifest.short_name).toBe('aiduHUI')
    expect(manifest.display).toBe('standalone')
    // aiduHUI lands on the workbench, so the installed app must too.
    expect(manifest.start_url).toBe('/#/workbench')
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({
        src: '/logo.png',
        type: 'image/png',
        purpose: 'any maskable',
      }),
    ]))
  })
})
