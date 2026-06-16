<script lang="ts" setup>
const router = useRouter()

const route = useRoute()

const { activeTabbar, getTabbarItemValue, setTabbarItemActive, tabbarList } = useTabbar()

function syncActiveTabbar(routeName: unknown) {
  if (typeof routeName !== 'string') {
    return
  }

  const hasTabbarItem = tabbarList.value.some(item => item.name === routeName)
  if (hasTabbarItem && routeName !== activeTabbar.value.name) {
    setTabbarItemActive(routeName)
  }
}

function handleTabbarChange({ value }: { value: string }) {
  setTabbarItemActive(value)
  router.pushTab({ name: value })
}

watch(
  () => route.name,
  (routeName) => {
    syncActiveTabbar(routeName)
  },
  { immediate: true },
)

onMounted(() => {
  // #ifdef APP-PLUS
  uni.hideTabBar()
  // #endif
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
    safe-area-inset-bottom
    placeholder
    fixed
    active-color="var(--cook-primary-strong)"
    inactive-color="var(--cook-text-muted)"
    custom-class="cook-tabbar"
    @change="handleTabbarChange"
  >
    <wd-tabbar-item
      v-for="(item, index) in tabbarList" :key="index" :name="item.name"
      :value="getTabbarItemValue(item.name)" :title="item.title"
      :custom-class="`cook-tabbar-item ${item.name === activeTabbar.name ? 'is-cook-active' : ''}`"
    >
      <template #icon="{ active }">
        <view class="tabbar-icon-shell">
          <image
            class="tabbar-icon-image"
            :src="active && item.activeIcon ? item.activeIcon : item.icon"
            mode="aspectFit"
          />
        </view>
      </template>
    </wd-tabbar-item>
  </wd-tabbar>
</template>

<style scoped>
:deep(.cook-tabbar) {
  --wot-tabbar-height: 50px;
  --wot-tabbar-bg: var(--cook-paper);
  --wot-tabbar-item-title-font-size: 20rpx;
  --wot-tabbar-item-title-line-height: 24rpx;
  box-sizing: border-box;
  border-top: 4rpx solid var(--cook-ink);
  background: rgba(255, 254, 249, 0.98);
  box-shadow: 0 -4rpx 0 rgba(47, 47, 45, 0.08);
}

:deep(.cook-tabbar .wd-tabbar-item) {
  box-sizing: border-box;
  height: 100%;
  padding: 5px 8rpx 4px;
}

:deep(.cook-tabbar .wd-tabbar-item__body) {
  box-sizing: border-box;
  width: 128rpx;
  height: 41px;
  padding: 0;
  gap: 2rpx;
}

:deep(.cook-tabbar .wd-tabbar-item__body-title) {
  max-width: 100%;
  overflow: hidden;
  color: var(--cook-text-muted);
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.16s ease;
}

:deep(.cook-tabbar .cook-tabbar-item.is-cook-active .wd-tabbar-item__body-title) {
  color: var(--cook-primary-strong) !important;
}

.tabbar-icon-shell {
  box-sizing: border-box;
  width: 23px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabbar-icon-image {
  width: 22px;
  height: 22px;
  display: block;
}
</style>
