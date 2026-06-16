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
@use '@wot-ui/ui/styles/theme/index.scss' as *;

.page-wraper {
  min-height: calc(100vh - var(--window-top));
  box-sizing: border-box;
  background: var(--cook-bg);
}

.wot-theme-dark.page-wraper {
  background: #222;
}

page {
  --cook-bg: #fff6f7;
  --cook-surface: #fffdfa;
  --cook-surface-2: #f1fbff;
  --cook-paper: #fffef9;
  --cook-image-bg: #f1eadf;
  --cook-ink: #2f2f2d;
  --cook-text: #241f1a;
  --cook-text-soft: #51483f;
  --cook-text-muted: #877b70;
  --cook-border: #e9dfd5;
  --cook-border-bold: 5rpx solid var(--cook-ink);
  --cook-shadow-pop: 8rpx 10rpx 0 rgba(47, 47, 45, 0.96);
  --cook-shadow-pop-sm: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
  --cook-primary: #83c63f;
  --cook-primary-strong: #4f8425;
  --cook-primary-soft: #f0ffd9;
  --cook-danger: #e45f51;
  --cook-danger-soft: #ffe8e3;
  --cook-green: #4b8e2e;
  --cook-green-soft: #ecffd9;
  --cook-blue: #3f7df0;
  --cook-blue-soft: #eaf4ff;
  --cook-yellow: #ffd95c;
  --cook-yellow-soft: #fff8d9;
  --cook-radius-illo: 28rpx;
  --wot-color-theme: var(--cook-primary);
  --wot-swiper-nav-dot-active-color: rgba(131, 198, 63, 0.86);
  --wot-swiper-nav-dot-color: rgba(36, 31, 26, 0.18);
}

image {
  will-change: transform;
}

.cook-illo-card {
  box-sizing: border-box;
  border: var(--cook-border-bold);
  border-radius: var(--cook-radius-illo);
  background: var(--cook-paper);
  box-shadow: var(--cook-shadow-pop);
}

.cook-illo-card-soft {
  box-sizing: border-box;
  border: 4rpx solid var(--cook-ink);
  border-radius: 22rpx;
  background: var(--cook-paper);
  box-shadow: var(--cook-shadow-pop-sm);
}

.cook-illo-pill {
  box-sizing: border-box;
  border: 4rpx solid var(--cook-ink);
  border-radius: 999rpx;
  background: var(--cook-paper);
}

.cook-illo-page {
  min-height: 100vh;
  background:
    linear-gradient(90deg, rgba(47, 47, 45, 0.035) 1px, transparent 1px),
    linear-gradient(180deg, rgba(47, 47, 45, 0.035) 1px, transparent 1px),
    linear-gradient(135deg, #fff6f7 0%, #fffdf2 48%, #f1fbff 100%);
  background-size:
    44rpx 44rpx,
    44rpx 44rpx,
    100% 100%;
}

.cook-illo-button {
  box-sizing: border-box;
  border: 4rpx solid var(--cook-ink);
  border-radius: 18rpx;
  background: var(--cook-primary);
  box-shadow: var(--cook-shadow-pop-sm);
}

.cook-illo-tag {
  box-sizing: border-box;
  border: 3rpx solid var(--cook-ink);
  border-radius: 999rpx;
  background: var(--cook-yellow);
  color: var(--cook-ink);
}

.cook-illo-status {
  box-sizing: border-box;
  border: 4rpx solid var(--cook-ink);
  border-radius: 20rpx;
  background: rgba(255, 254, 249, 0.9);
  box-shadow: 4rpx 5rpx 0 rgba(47, 47, 45, 0.96);
}

.cook-pressable {
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.cook-pressable:active {
  transform: translate(5rpx, 6rpx);
  box-shadow: 2rpx 3rpx 0 rgba(47, 47, 45, 0.96);
}
</style>
