export interface MotionPoint {
  x: number
  y: number
}

export interface MotionRect {
  left: number
  top: number
  width: number
  height: number
}

export interface NormalizedMotionPoint extends MotionPoint {
  inside: boolean
}

export type MotionTemplateKey = 'duo' | 'trio' | 'quad' | 'crowd'

export interface ParticipantMotionPath {
  template: MotionTemplateKey
  start: MotionPoint
  swap: MotionPoint
  orbit: MotionPoint
  gather: MotionPoint
  exit: MotionPoint
  delayMs: number
}

export const DISH_DUTY_REVEAL_THRESHOLD = 0.6

function round(value: number) {
  return Math.round(value * 10) / 10
}

function polarPoint(angle: number, radiusX: number, radiusY: number): MotionPoint {
  return {
    x: round(Math.cos(angle) * radiusX),
    y: round(Math.sin(angle) * radiusY),
  }
}

function crowdRadius(total: number) {
  if (total <= 4) return { x: 180, y: 160 }
  if (total <= 6) return { x: 225, y: 178 }
  return { x: 248, y: 198 }
}

export function getMotionTemplateKey(total: number): MotionTemplateKey {
  if (total <= 2) return 'duo'
  if (total === 3) return 'trio'
  if (total === 4) return 'quad'
  return 'crowd'
}

export function getParticipantMotionPath(index: number, total: number): ParticipantMotionPath {
  const safeTotal = Math.max(2, Math.min(8, Math.round(total)))
  const safeIndex = ((Math.round(index) % safeTotal) + safeTotal) % safeTotal
  const template = getMotionTemplateKey(safeTotal)

  if (template === 'duo') {
    const direction = safeIndex === 0 ? -1 : 1
    return {
      template,
      start: { x: direction * 142, y: direction * 128 },
      swap: { x: direction * -154, y: direction * -54 },
      orbit: { x: direction * 104, y: direction * -126 },
      gather: { x: direction * 68, y: direction * 28 },
      exit: { x: direction * 290, y: direction * 72 },
      delayMs: safeIndex * 36,
    }
  }

  const radius = crowdRadius(safeTotal)
  const startAngle = -Math.PI / 2 + (Math.PI * 2 * safeIndex) / safeTotal
  const swapSteps = template === 'trio' ? 1 : template === 'quad' ? 1 : 2
  const swapAngle = startAngle + (Math.PI * 2 * swapSteps) / safeTotal
  const orbitAngle = startAngle + (Math.PI * 2 * (swapSteps + 1)) / safeTotal
  const start = polarPoint(startAngle, radius.x, radius.y)
  const swap = polarPoint(swapAngle, radius.x * 1.03, radius.y * 0.88)
  const orbit = polarPoint(orbitAngle, radius.x * 0.88, radius.y * 1.04)
  const gatherAngle = startAngle + Math.PI / 3
  const exitAngle = startAngle

  return {
    template,
    start,
    swap,
    orbit,
    gather: polarPoint(
      gatherAngle,
      template === 'crowd' ? 102 : template === 'quad' ? 86 : 78,
      template === 'crowd' ? 72 : template === 'quad' ? 62 : 56,
    ),
    exit: polarPoint(exitAngle, radius.x + 115, radius.y + 92),
    delayMs: safeIndex * (template === 'crowd' ? 22 : 30),
  }
}

export function normalizeMotionPoint(clientX: number, clientY: number, rect: MotionRect): NormalizedMotionPoint {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0, inside: false }
  const rawX = ((clientX - rect.left) / rect.width) * 100
  const rawY = ((clientY - rect.top) / rect.height) * 100
  return {
    x: Math.min(100, Math.max(0, rawX)),
    y: Math.min(100, Math.max(0, rawY)),
    inside: rawX >= 0 && rawX <= 100 && rawY >= 0 && rawY <= 100,
  }
}

export function interpolateMotionPoints(previous: MotionPoint | null, current: MotionPoint, maximumStep = 6): MotionPoint[] {
  if (!previous) return [current]
  const safeStep = Math.max(1, maximumStep)
  const distance = Math.hypot(current.x - previous.x, current.y - previous.y)
  const steps = Math.max(1, Math.ceil(distance / safeStep))
  return Array.from({ length: steps }, (_, index) => {
    const progress = (index + 1) / steps
    return {
      x: previous.x + (current.x - previous.x) * progress,
      y: previous.y + (current.y - previous.y) * progress,
    }
  })
}

export function hasReachedRevealThreshold(cleared: number, total: number, threshold = DISH_DUTY_REVEAL_THRESHOLD) {
  if (total <= 0) return false
  return cleared / total >= threshold
}
