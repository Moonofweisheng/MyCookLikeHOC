<script lang="ts" setup>
const router = useRouter()

const route = useRoute()

const { activeTabbar, getTabbarItemValue, setTabbarItemActive, tabbarList } = useTabbar()

function handleTabbarChange({ value }: { value: string }) {
  setTabbarItemActive(value)
  router.pushTab({ name: value })
}

onMounted(() => {
  // #ifdef APP-PLUS
  uni.hideTabBar()
  // #endif
  nextTick(() => {
    if (route.name && route.name !== activeTabbar.value.name) {
      setTabbarItemActive(route.name)
    }
  })
})
</script>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  },
}
</script>

<template>
  <slot />
  <wd-tabbar
    :model-value="activeTabbar.name"
    bordered
    safe-area-inset-bottom
    placeholder
    fixed
    active-color="var(--cook-primary)"
    inactive-color="var(--cook-text-muted)"
    custom-class="cook-tabbar"
    @change="handleTabbarChange"
  >
    <wd-tabbar-item
      v-for="(item, index) in tabbarList" :key="index" :name="item.name"
      :value="getTabbarItemValue(item.name)" :title="item.title"
      :icon="item.active && item.activeIcon ? item.activeIcon : item.icon"
    />
  </wd-tabbar>
</template>

<style scoped>
:deep(.cook-tabbar) {
  border-top: 4rpx solid var(--cook-ink);
  background: rgba(255, 254, 249, 0.96);
  box-shadow: 0 -6rpx 0 rgba(47, 47, 45, 0.12);
}
</style>
