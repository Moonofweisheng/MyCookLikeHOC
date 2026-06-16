<script setup lang="ts">
import pkg from '../../../package.json'
import { useGlobalDialog } from '@/composables/useGlobalDialog'

definePage({
  name: 'about',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '关于',
  },
})
const appName = '像老乡鸡那样做饭'
const appDesc = '本菜谱数据来自于开源项目 CookLikeHOC ，基于 uni-app 快速上手项目 wot-starter 全程由 TRAE SOLO 开发'
const version = pkg.version
const { show: showToast } = useGlobalToast()
const { show: showDialog } = useGlobalDialog()

// 简洁版仅保留必要信息与功能入口

// 检查更新
function checkUpdate() {
  showToast({
    msg: '已是最新版本',
  })
}

// 隐私政策
function showPrivacyPolicy() {
  showDialog({
    title: '隐私政策',
    msg: '我们重视您的隐私，不会收集您的个人敏感信息。',
  })
}
</script>

<template>
  <view class="cook-illo-page min-h-100% px-24rpx pb-152rpx pt-28rpx">
    <view class="about-card cook-illo-card flex flex-col items-center px-28rpx py-34rpx text-center">
      <view class="logo-wrap h-132rpx w-132rpx flex items-center justify-center rounded-full">
        <image src="@/static/logo.png" class="h-96rpx w-96rpx" mode="aspectFit" />
      </view>
      <text class="mt-24rpx text-38rpx text-[var(--cook-text)] font-900 leading-tight">
        {{ appName }}
      </text>
      <text class="cook-illo-tag mt-16rpx px-14rpx py-5rpx text-22rpx font-900">
        v{{ version }}
      </text>
      <text class="mt-22rpx text-26rpx text-[var(--cook-text-soft)] font-600 leading-relaxed">
        {{ appDesc }}
      </text>
    </view>

    <view class="mt-30rpx space-y-18rpx">
      <view class="about-action cook-illo-card-soft cook-pressable flex items-center justify-between px-24rpx py-22rpx" @click="showPrivacyPolicy">
        <view>
          <text class="block text-30rpx text-[var(--cook-text)] font-900">
            隐私政策
          </text>
          <text class="mt-6rpx block text-23rpx text-[var(--cook-text-muted)]">
            查看隐私政策
          </text>
        </view>
        <wd-icon name="arrow-right" size="30rpx" color="var(--cook-ink)" />
      </view>
      <view class="about-action cook-illo-card-soft cook-pressable flex items-center justify-between px-24rpx py-22rpx" @click="checkUpdate">
        <view>
          <text class="block text-30rpx text-[var(--cook-text)] font-900">
            更新日志
          </text>
          <text class="mt-6rpx block text-23rpx text-[var(--cook-text-muted)]">
            版本更新信息
          </text>
        </view>
        <wd-icon name="arrow-right" size="30rpx" color="var(--cook-ink)" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.about-card {
  background:
    linear-gradient(135deg, rgba(255, 254, 249, 0.98) 0%, rgba(240, 255, 217, 0.9) 100%);
}

.logo-wrap {
  border: 5rpx solid var(--cook-ink);
  background: var(--cook-paper);
  box-shadow: 6rpx 7rpx 0 rgba(47, 47, 45, 0.96);
}

.about-action {
  background: var(--cook-paper);
}
</style>
