import { createRouter, createWebHashHistory } from 'vue-router'
import { hasApiKey, isStoredSuperAdmin } from '@/api/client'
import { hasDesktopBrowserBridge } from '@/utils/desktop-bridge'
import { resolveLoginRedirect } from '@/utils/login-redirect'

const router = createRouter({
  history: createWebHashHistory(),
    routes: [
    {
      path: '/desktop-pet',
      name: 'desktop.pet',
      component: () => import('@/views/hermes/DesktopPetView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      // aiduHUI 0.1.0 — the unified single-page workbench
      path: '/workbench',
      name: 'workbench',
      component: () => import('@/views/WorkbenchView.vue'),
      meta: { ownSidebar: true },
    },
    {
      path: '/hermes/models',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'models' } }),
    },
    {
      path: '/hermes/settings',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'settings' } }),
    },
    {
      path: '/hermes/jobs',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'jobs' } }),
    },
    {
      path: '/hermes/channels',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'channels' } }),
    },
    {
      path: '/hermes/memory',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'memory' } }),
    },
    {
      path: '/hermes/profiles',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'profiles' } }),
    },
    {
      path: '/hermes/logs',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'settings', p: 'logs' } }),
    },
    {
      path: '/hermes/usage',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'settings', p: 'usage' } }),
    },
    {
      path: '/hermes/performance',
      redirect: to => ({ name: 'workbench', query: { ...to.query, s: 'settings', p: 'performance' } }),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/workbench',
    },
  ],
})

// Desktop exposes a dedicated settings page. Actual browsing stays inside the
// chat tool panel so this route never creates or positions a WebContentsView.
if (hasDesktopBrowserBridge()) {
  router.addRoute({
    path: '/hermes/browser',
    name: 'hermes.browser',
    component: () => import('@/views/hermes/DesktopBrowserView.vue'),
  })
}

async function ensureDesktopAuth(): Promise<void> {
  if (hasApiKey()) return
  const bridge = (window as typeof window & {
    hermesDesktop?: { isDesktop?: boolean; ensureAuth?: () => Promise<boolean> }
  }).hermesDesktop
  if (bridge?.isDesktop === true && bridge.ensureAuth) {
    await bridge.ensureAuth().catch(() => false)
  }
}

function isDesktopShell(): boolean {
  return (window as typeof window & {
    hermesDesktop?: { isDesktop?: boolean }
  }).hermesDesktop?.isDesktop === true
}

router.beforeEach(async (to, _from, next) => {
  await ensureDesktopAuth()

  // Public pages don't need auth
  if (to.meta.public) {
    // Already has key, skip login
    if (to.name === 'login' && hasApiKey() && !isDesktopShell()) {
      next(resolveLoginRedirect(to.query.redirect))
      return
    }
    next()
    return
  }

  // All other pages require token
  if (!hasApiKey()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresSuperAdmin && !isStoredSuperAdmin()) {
    next({ name: 'workbench' })
    return
  }

  next()
})

export default router
