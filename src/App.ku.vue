<script setup lang="ts">
// 移除暗黑模式相关代码
</script>

<template>
  <wd-config-provider custom-class="page-wraper">
    <ku-root-view />
    <wd-notify />
    <wd-message-box />
    <wd-toast />
    <global-loading />
    <global-toast />
    <global-message />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </wd-config-provider>
</template>
