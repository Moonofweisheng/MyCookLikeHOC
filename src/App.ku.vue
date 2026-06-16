<script setup lang="ts">
import type { ConfigProviderProps } from '@wot-ui/ui/components/wd-config-provider/types'
import { useManualTheme } from '@/composables/useManualTheme'

const { themeVars, theme } = useManualTheme()

const buttonConfig: ConfigProviderProps['button'] = {
  size: 'large',
}
</script>

<template>
  <wd-config-provider :theme-vars="themeVars" :theme="theme" :button="buttonConfig" :custom-class="`page-wraper ${theme}`">
    <ku-root-view />
    <wd-notify />
    <wd-dialog />
    <wd-toast />
    <global-loading />
    <global-toast />
    <global-dialog />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </wd-config-provider>
</template>
