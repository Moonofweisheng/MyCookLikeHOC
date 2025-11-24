export interface TabbarItem {
  name: string
  value: number | null
  active: boolean
  title: string
  icon: string
  activeIcon?: string
}

const tabbarItems = ref<TabbarItem[]>([
  {
    name: 'home',
    value: null,
    active: true,
    title: '首页',
    icon: '/static/tabbar/home.svg',
    activeIcon: '/static/tabbar/home-active.svg',
  },
  {
    name: 'about',
    value: null,
    active: false,
    title: '关于',
    icon: '/static/tabbar/about.svg',
    activeIcon: '/static/tabbar/about-active.svg',
  },
])

export function useTabbar() {
  const tabbarList = computed(() => tabbarItems.value)

  const activeTabbar = computed(() => {
    const item = tabbarItems.value.find(item => item.active)
    return item || tabbarItems.value[0]
  })

  const getTabbarItemValue = (name: string) => {
    const item = tabbarItems.value.find(item => item.name === name)
    return item && item.value ? item.value : null
  }

  const setTabbarItem = (name: string, value: number) => {
    const tabbarItem = tabbarItems.value.find(item => item.name === name)
    if (tabbarItem) {
      tabbarItem.value = value
    }
  }

  const setTabbarItemActive = (name: string) => {
    tabbarItems.value.forEach((item) => {
      if (item.name === name) {
        item.active = true
      }
      else {
        item.active = false
      }
    })
  }

  return {
    tabbarList,
    activeTabbar,
    getTabbarItemValue,
    setTabbarItem,
    setTabbarItemActive,
  }
}
