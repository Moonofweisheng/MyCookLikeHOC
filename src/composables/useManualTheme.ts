import type { ThemeColorOption, ThemeMode } from '@/composables/types/theme'
import { onShow } from '@dcloudio/uni-app'
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { themeColorOptions } from '@/composables/types/theme'
import { useManualThemeStore } from '@/store/manualThemeStore'

export function useManualTheme() {
  const store = useManualThemeStore()
  const showThemeColorSheet = ref(false)

  function toggleTheme(mode?: ThemeMode, isFollow: boolean = false) {
    store.toggleTheme(mode, isFollow)
  }

  function openThemeColorPicker() {
    showThemeColorSheet.value = true
  }

  function closeThemeColorPicker() {
    showThemeColorSheet.value = false
  }

  function selectThemeColor(option: ThemeColorOption) {
    store.setCurrentThemeColor(option)
    closeThemeColorPicker()
  }

  function initTheme() {
    store.initTheme()
  }

  onBeforeMount(() => {
    initTheme()

    if (typeof uni !== 'undefined' && uni.onThemeChange) {
      uni.onThemeChange((res) => {
        if (store.followSystem) {
          toggleTheme(res.theme as ThemeMode, true)
        }
      })
    }
  })

  onShow(() => {
    store.setNavigationBarColor()
  })

  onUnmounted(() => {
    if (typeof uni !== 'undefined' && uni.offThemeChange) {
      uni.offThemeChange((res) => {
        if (store.followSystem) {
          toggleTheme(res.theme as ThemeMode, true)
        }
      })
    }
  })

  return {
    theme: computed(() => store.theme),
    isDark: computed(() => store.isDark),
    followSystem: computed(() => store.followSystem),
    hasUserSet: computed(() => store.hasUserSet),
    currentThemeColor: computed(() => store.currentThemeColor),
    themeVars: computed(() => store.themeVars),
    showThemeColorSheet,
    themeColorOptions,
    initTheme,
    toggleTheme,
    setFollowSystem: store.setFollowSystem,
    openThemeColorPicker,
    closeThemeColorPicker,
    selectThemeColor,
  }
}

export type { ThemeColorOption, ThemeMode }
export { themeColorOptions }
