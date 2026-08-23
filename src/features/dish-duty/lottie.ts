export interface LottieController {
  play: () => void
  stop: () => void
  destroy: () => void
  usingNativePlayer: boolean
}

interface LottieRuntime {
  loadAnimation: (options: Record<string, unknown>) => {
    play: () => void
    stop: () => void
    destroy: () => void
    addEventListener?: (event: string, callback: () => void) => void
  }
}

function getRuntime(): LottieRuntime | null {
  if (typeof window === 'undefined') return null
  const runtime = (window as Window & { lottie?: LottieRuntime }).lottie
  return runtime?.loadAnimation ? runtime : null
}

export function createLottieController(
  container: unknown,
  animationData: unknown,
  onComplete: () => void,
  fallbackDuration = 620,
): LottieController {
  const runtime = getRuntime()
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined
  let animation: ReturnType<LottieRuntime['loadAnimation']> | null = null
  let completed = false

  const finish = () => {
    if (completed) return
    completed = true
    clearTimeout(fallbackTimer)
    onComplete()
  }

  if (runtime && container && typeof container === 'object') {
    try {
      animation = runtime.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData,
      })
      animation.addEventListener?.('complete', finish)
    }
    catch {
      animation = null
    }
  }

  return {
    usingNativePlayer: Boolean(animation),
    play() {
      completed = false
      if (animation) {
        animation.stop()
        animation.play()
        clearTimeout(fallbackTimer)
        fallbackTimer = setTimeout(finish, fallbackDuration + 180)
        return
      }
      clearTimeout(fallbackTimer)
      fallbackTimer = setTimeout(finish, fallbackDuration)
    },
    stop() {
      clearTimeout(fallbackTimer)
      animation?.stop()
    },
    destroy() {
      clearTimeout(fallbackTimer)
      animation?.destroy()
      animation = null
    },
  }
}
