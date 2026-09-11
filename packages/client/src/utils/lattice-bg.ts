/* =============================================================================
   aiduHUI — lattice-bg.ts (adapted from aiduPARK js/lattice-bg.js)
   -----------------------------------------------------------------------------
   Tri-colour geometric lattice backdrop.
   Brand discipline: blue #1F4E79, gray #525252, black #000000.
   Transparent canvas overlaying the paper ground.
   ============================================================================= */

const PALETTE = [
  [31, 78, 121], /* --blue  #1F4E79 */
  [82, 82, 82],  /* --gray  #525252  */
  [0, 0, 0],     /* --ink   #000000  */
]

const COLOR_TABLE = PALETTE.map((rgb) => {
  const table = new Array(101)
  for (let i = 0; i <= 100; i++) {
    table[i] = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(i / 100).toFixed(2)})`
  }
  return table
})

function rgba(colorIdx: number, alpha: number): string {
  let q = Math.round(alpha * 100)
  if (q < 0) q = 0
  else if (q > 100) q = 100
  return COLOR_TABLE[colorIdx][q]
}

const MAX_DIST = 140
const MAX_DIST_SQ = MAX_DIST * MAX_DIST
const MOUSE_REPEL_RADIUS_SQ = 200 * 200
const MOUSE_ACCENT_RADIUS = 220
const MOUSE_ACCENT_RADIUS_SQ = MOUSE_ACCENT_RADIUS * MOUSE_ACCENT_RADIUS

const FILL_FAR = 0.08
const STROKE_FAR = 0.20
const FILL_NEAR_MAX = 0.28
const NODE_FAR = 0.55

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  pulse: number
  pulseSpeed: number
  color: number
}

interface Instance {
  container: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  points: Point[]
  mouse: { x: number; y: number; tx: number; ty: number }
  rafId: number
  lastTime: number
  hidden: boolean
  destroyed: boolean
  staticOnly: boolean
  resizeObserver: ResizeObserver | null
  moveHandler: ((e: MouseEvent) => void) | null
  outHandler: ((e: FocusEvent | MouseEvent) => void) | null
}

const instances = typeof WeakMap !== 'undefined' ? new WeakMap<HTMLElement, Instance>() : null

function motionReduced() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function initPoints(inst: Instance, w: number, h: number) {
  const points: Point[] = []
  const density = Math.floor((w * h) / 10000)
  const cap = Math.min(w, h) < 768 ? 60 : 100
  const count = Math.min(Math.max(density, 35), cap)
  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 1 + Math.random() * 1.5,
      color: i % PALETTE.length,
    })
  }
  inst.points = points
}

function resize(inst: Instance) {
  const rect = inst.container.getBoundingClientRect()
  const w = rect.width
  const h = rect.height
  if (w < 2 || h < 2) {
    inst.hidden = true
    return
  }
  inst.hidden = false
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  inst.width = w
  inst.height = h
  inst.canvas.width = Math.round(w * dpr)
  inst.canvas.height = Math.round(h * dpr)
  inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  initPoints(inst, w, h)
  if (inst.staticOnly) drawFrame(inst, performance.now(), 0.016)
}

function onPointerMove(inst: Instance, e: MouseEvent) {
  const rect = inst.container.getBoundingClientRect()
  inst.mouse.tx = e.clientX - rect.left
  inst.mouse.ty = e.clientY - rect.top
}

function onPointerOut(inst: Instance) {
  inst.mouse.tx = -1000
  inst.mouse.ty = -1000
}

function drawFrame(inst: Instance, _now: number, dt: number) {
  const ctx = inst.ctx
  const width = inst.width
  const height = inst.height
  const mouse = inst.mouse
  const points = inst.points

  mouse.x += (mouse.tx - mouse.x) * 0.1
  mouse.y += (mouse.ty - mouse.y) * 0.1

  ctx.clearRect(0, 0, width, height)

  const pCount = points.length
  for (let i = 0; i < pCount; i++) {
    const p = points[i]
    p.pulse += dt * p.pulseSpeed
    p.x += p.vx * dt * 60
    p.y += p.vy * dt * 60
    if (p.x < 0) { p.x = 0; p.vx *= -1 }
    else if (p.x > width) { p.x = width; p.vx *= -1 }
    if (p.y < 0) { p.y = 0; p.vy *= -1 }
    else if (p.y > height) { p.y = height; p.vy *= -1 }

    const mdx = mouse.x - p.x
    const mdy = mouse.y - p.y
    const mDistSq = mdx * mdx + mdy * mdy
    if (mDistSq < MOUSE_REPEL_RADIUS_SQ && mDistSq > 0) {
      const mDist = Math.sqrt(mDistSq)
      const force = (1 - mDist / 200) * 35
      p.x -= (mdx / mDist) * force * dt * 6
      p.y -= (mdy / mDist) * force * dt * 6
    }
  }

  const cellSize = MAX_DIST
  const cols = Math.max(1, Math.ceil(width / cellSize))
  const rows = Math.max(1, Math.ceil(height / cellSize))
  const grid: number[][][] = new Array(cols)
  for (let c = 0; c < cols; c++) {
    grid[c] = new Array(rows)
    for (let r = 0; r < rows; r++) grid[c][r] = []
  }
  for (let i = 0; i < pCount; i++) {
    const p = points[i]
    const gc = Math.min(cols - 1, Math.max(0, Math.floor(p.x / cellSize)))
    const gr = Math.min(rows - 1, Math.max(0, Math.floor(p.y / cellSize)))
    grid[gc][gr].push(i)
  }

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cellPoints = grid[c][r]
      if (!cellPoints.length) continue

      const neighbors: number[] = []
      for (let nc = Math.max(0, c - 1); nc <= Math.min(cols - 1, c + 1); nc++) {
        for (let nr = Math.max(0, r - 1); nr <= Math.min(rows - 1, r + 1); nr++) {
          const nList = grid[nc][nr]
          for (let k = 0; k < nList.length; k++) neighbors.push(nList[k])
        }
      }
      const neighborCount = neighbors.length

      for (let i = 0; i < cellPoints.length; i++) {
        const idx1 = cellPoints[i]
        const p1 = points[idx1]

        for (let j = 0; j < neighborCount; j++) {
          const idx2 = neighbors[j]
          if (idx1 >= idx2) continue
          const p2 = points[idx2]
          const dx12 = p1.x - p2.x
          const dy12 = p1.y - p2.y
          if (dx12 * dx12 + dy12 * dy12 > MAX_DIST_SQ) continue

          for (let k = j + 1; k < neighborCount; k++) {
            const idx3 = neighbors[k]
            if (idx2 >= idx3) continue
            const p3 = points[idx3]
            const dx23 = p2.x - p3.x
            const dy23 = p2.y - p3.y
            if (dx23 * dx23 + dy23 * dy23 > MAX_DIST_SQ) continue
            const dx31 = p3.x - p1.x
            const dy31 = p3.y - p1.y
            if (dx31 * dx31 + dy31 * dy31 > MAX_DIST_SQ) continue

            const avgX = (p1.x + p2.x + p3.x) * 0.3333
            const avgY = (p1.y + p2.y + p3.y) * 0.3333
            const tDx = mouse.x - avgX
            const tDy = mouse.y - avgY
            const tDistSq = tDx * tDx + tDy * tDy
            const near = tDistSq < MOUSE_ACCENT_RADIUS_SQ

            const fillAlpha = near
              ? (1 - Math.sqrt(tDistSq) / MOUSE_ACCENT_RADIUS) * FILL_NEAR_MAX
              : FILL_FAR
            ctx.fillStyle = rgba(p1.color, fillAlpha)
            ctx.strokeStyle = rgba(p1.color, near ? fillAlpha * 1.6 : STROKE_FAR)
            ctx.lineWidth = near ? 0.8 : 0.4

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.lineTo(p3.x, p3.y)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
          }
        }
      }
    }
  }

  for (let i = 0; i < pCount; i++) {
    const p = points[i]
    const nDx = mouse.x - p.x
    const nDy = mouse.y - p.y
    const isNear = nDx * nDx + nDy * nDy < MOUSE_ACCENT_RADIUS_SQ

    ctx.fillStyle = rgba(p.color, isNear ? 0.85 : NODE_FAR)
    ctx.beginPath()
    ctx.arc(p.x, p.y, isNear ? 3.2 : 1.8 + Math.sin(p.pulse) * 0.8, 0, Math.PI * 2)
    ctx.fill()

    if (isNear) {
      ctx.strokeStyle = rgba(p.color, 0.3)
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6 + Math.sin(p.pulse * 2) * 2, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

function tick(inst: Instance, now: number) {
  if (inst.destroyed) return
  const dt = Math.min((now - inst.lastTime) / 1000, 0.033)
  inst.lastTime = now
  if (!inst.hidden) drawFrame(inst, now, dt)
  inst.rafId = requestAnimationFrame((t) => tick(inst, t))
}

export function mountLatticeBG(container: HTMLElement): Instance | null {
  if (!container || (instances && instances.has(container))) return null

  const canvas = document.createElement('canvas')
  canvas.className = 'lattice-bg-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;'
  container.appendChild(canvas)

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return null

  const inst: Instance = {
    container,
    canvas,
    ctx,
    width: 0,
    height: 0,
    points: [],
    mouse: { x: -1000, y: -1000, tx: -1000, ty: -1000 },
    rafId: 0,
    lastTime: performance.now(),
    hidden: false,
    destroyed: false,
    staticOnly: motionReduced(),
    resizeObserver: null,
    moveHandler: null,
    outHandler: null,
  }
  if (instances) instances.set(container, inst)

  inst.resizeObserver = new ResizeObserver(() => resize(inst))
  inst.resizeObserver.observe(container)

  inst.moveHandler = (e: MouseEvent) => onPointerMove(inst, e)
  inst.outHandler = (e: FocusEvent | MouseEvent) => {
    if (!('relatedTarget' in e) || !e.relatedTarget) onPointerOut(inst)
  }
  window.addEventListener('pointermove', inst.moveHandler, { passive: true })
  window.addEventListener('pointerout', inst.outHandler, { passive: true })
  window.addEventListener('blur', inst.outHandler)

  resize(inst)
  if (!inst.staticOnly) {
    inst.rafId = requestAnimationFrame((t) => tick(inst, t))
  }
  return inst
}

export function unmountLatticeBG(container: HTMLElement) {
  const inst = container && instances ? instances.get(container) : null
  if (!inst) return
  inst.destroyed = true
  cancelAnimationFrame(inst.rafId)
  inst.resizeObserver?.disconnect()
  if (inst.moveHandler) window.removeEventListener('pointermove', inst.moveHandler)
  if (inst.outHandler) {
    window.removeEventListener('pointerout', inst.outHandler)
    window.removeEventListener('blur', inst.outHandler)
  }
  inst.canvas.remove()
  if (instances) instances.delete(container)
}
