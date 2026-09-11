// In aiduHUI 0.1.0, the root and primary workspace is strictly /workbench.
// Never redirect back to upstream legacy multi-agent routes.
const DEFAULT_LOGIN_REDIRECT = '/workbench'

export function resolveLoginRedirect(value: unknown): string {
  const redirect = typeof value === 'string' ? value : ''
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return DEFAULT_LOGIN_REDIRECT
  }
  // If redirect points to legacy views or root, normalize to workbench
  if (redirect === '/' || redirect.startsWith('/hermes/chat') || redirect.startsWith('/hermes/session')) {
    return DEFAULT_LOGIN_REDIRECT
  }
  return redirect
}
