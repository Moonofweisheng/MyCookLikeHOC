<!--
 * @Author: weisheng
 * @Date: 2025-09-25 21:15:17
 * @LastEditTime: 2025-11-24 21:10:12
 * @LastEditors: weisheng
 * @Description:
 * @FilePath: /cook-cook/src/App.vue
 * 记得注释
-->
<script setup lang="ts">
onLaunch(() => {})
</script>

<style lang="scss">
.page-wraper {
  min-height: calc(100vh - var(--window-top));
  box-sizing: border-box;
  background: #f9f9f9;
}

.wot-theme-dark.page-wraper {
  background: #222;
}

page {
  --wot-swiper-nav-dot-active-color:rgba(0, 0, 0, 0.3);
  --wot-swiper-nav-dot-color:rgba(0, 0, 0, 0.3);
}
</style>
