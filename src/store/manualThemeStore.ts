import { defineStore } from 'pinia'
import type { ThemeColorOption, ThemeMode, ThemeState } from '@/composables/types/theme'
import { themeColorOptions } from '@/composables/types/theme'

function buildThemeVars(color: ThemeColorOption) {
  return {
    ...color.primaryShades,
  }
}

export const useManualThemeStore = defineStore('manualTheme', {
  state: (): ThemeState => ({
    theme: 'light',
    followSystem: true,
    hasUserSet: false,
    currentThemeColor: themeColorOptions[0],
    themeVars: buildThemeVars(themeColorOptions[0]),
  }),

  getters: {
    isDark: state => state.theme === 'dark',
  },

  actions: {
    toggleTheme(mode?: ThemeMode, isFollow: boolean = false) {
      this.theme = mode || (this.theme === 'light' ? 'dark' : 'light')
      if (!isFollow) {
        this.hasUserSet = true
        this.followSystem = false
      }
      this.setNavigationBarColor()
    },

    setFollowSystem(follow: boolean) {
      this.followSystem = follow
      if (follow) {
        this.hasUserSet = false
        this.initTheme()
      }
    },

    setNavigationBarColor() {
      uni.setNavigationBarColor({
        frontColor: this.theme === 'light' ? '#000000' : '#ffffff',
        backgroundColor: this.theme === 'light' ? '#ffffff' : '#000000',
      })
    },

    setCurrentThemeColor(color: ThemeColorOption) {
      this.currentThemeColor = color
      this.themeVars = {
        ...this.themeVars,
        ...buildThemeVars(color),
      }
    },

    getSystemTheme(): ThemeMode {
      try {
        // #ifdef MP-WEIXIN
        const appBaseInfo = uni.getAppBaseInfo()
        if (appBaseInfo?.theme) {
          return appBaseInfo.theme as ThemeMode
        }
        // #endif

        // #ifndef MP-WEIXIN
        const systemInfo = uni.getSystemInfoSync()
        if (systemInfo?.theme) {
          return systemInfo.theme as ThemeMode
        }
        // #endif
      }
      catch (error) {
        console.warn('获取系统主题失败:', error)
      }
      return 'light'
    },

    initTheme() {
      if (this.hasUserSet && !this.followSystem) {
        this.setNavigationBarColor()
        return
      }

      const systemTheme = this.getSystemTheme()

      if (!this.hasUserSet || this.followSystem) {
        this.theme = systemTheme
        if (!this.hasUserSet) {
          this.followSystem = true
        }
      }

      this.setNavigationBarColor()
    },
  },
})
