// aiduHUI lands on the workbench; chat stays reachable at /hermes/chat.
const DEFAULT_LOGIN_REDIRECT = '/workbench'

export function resolveLoginRedirect(value: unknown): string {
  const redirect = typeof value === 'string' ? value : ''
  return redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : DEFAULT_LOGIN_REDIRECT
}
