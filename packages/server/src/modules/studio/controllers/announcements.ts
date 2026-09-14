import type { Context } from 'koa'
import { fetchStudioAnnouncements } from '../services/notifications/announcements'

export async function getAnnouncements(ctx: Context): Promise<void> {
  ctx.set('Cache-Control', 'no-store')
  ctx.body = { ok: true, platform: 'desktop', list: [] }
}
