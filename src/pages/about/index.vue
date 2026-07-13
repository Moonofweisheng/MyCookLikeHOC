<script setup lang="ts">
import pkg from '../../../package.json'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import { useGlobalDialog } from '@/composables/useGlobalDialog'

definePage({
  name: 'about',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '关于',
  },
})

const appName = '鱼哥菜谱'
const version = pkg.version
const repositoryUrl = 'https://github.com/Moonofweisheng/MyCookLikeHOC'
const { show: showToast } = useGlobalToast()
const { show: showDialog } = useGlobalDialog()

const highlights = [
  { icon: '搜', title: '顺手找菜', description: '分类、搜索和每日推荐', tone: 'yellow' },
  { icon: '做', title: '照着就做', description: '配料、步骤清清楚楚', tone: 'green' },
  { icon: '开', title: '开放共建', description: '代码与菜谱一起分享', tone: 'blue' },
]

function openSourceRepository() {
  // #ifdef H5
  window.open(repositoryUrl, '_blank', 'noopener,noreferrer')
  // #endif

  // #ifndef H5
  uni.setClipboardData({
    data: repositoryUrl,
    success: () => showToast({ msg: '开源地址已复制，去浏览器看看吧' }),
  })
  // #endif
}

function checkUpdate() {
  showToast({ msg: `当前版本 v${version}，已是最新版本` })
}

function showPrivacyPolicy() {
  showDialog({
    title: '隐私政策',
    msg: '我们重视您的隐私，不会收集您的个人敏感信息。本项目仅用于菜谱浏览、学习与技术交流。',
  })
}

onShareAppMessage(() => ({
  title: '鱼哥菜谱：一起把家常菜做得更简单',
  path: '/pages/about/index',
}))
</script>

<template>
  <view class="about-page cook-illo-page min-h-screen px-24rpx pb-164rpx pt-24rpx">
    <view class="about-card cook-illo-card about-hero relative overflow-hidden px-28rpx pb-34rpx pt-30rpx">
      <view class="hero-dot hero-dot-yellow" />
      <view class="hero-dot hero-dot-blue" />

      <view class="relative z-1 flex items-center gap-24rpx">
        <view class="logo-wrap h-138rpx w-138rpx flex shrink-0 items-center justify-center">
          <image src="@/static/logo-illustration.svg" class="h-122rpx w-122rpx" mode="aspectFit" />
        </view>
        <view class="min-w-0 flex-1">
          <text class="hero-kicker cook-illo-tag inline-block px-14rpx py-5rpx text-21rpx font-900">
            OPEN SOURCE · v{{ version }}
          </text>
          <text class="mt-14rpx block text-44rpx text-[var(--cook-text)] font-900 leading-tight">
            {{ appName }}
          </text>
          <text class="mt-8rpx block text-24rpx text-[var(--cook-text-soft)] font-700">
            像老乡鸡那样，把饭好好做
          </text>
        </view>
      </view>

      <view class="hero-copy relative z-1 mt-28rpx px-22rpx py-20rpx">
        <text class="block text-28rpx text-[var(--cook-text)] font-900 leading-relaxed">
          今天吃什么，不该是一道难题。
        </text>
        <text class="mt-8rpx block text-24rpx text-[var(--cook-text-soft)] leading-relaxed">
          我们把散落的家常菜谱整理成随手能查、照着能做的数字厨房，让每一顿饭都更有把握。
        </text>
      </view>
    </view>

    <view class="mt-42rpx px-8rpx">
      <AppSectionHeader title="这个项目在做什么" subtitle="从找灵感到端上桌，少绕一点路" />
      <view class="grid grid-cols-3 gap-16rpx">
        <view
          v-for="item in highlights"
          :key="item.title"
          class="feature-card cook-illo-card-soft flex flex-col items-center px-10rpx pb-20rpx pt-18rpx text-center"
        >
          <view :class="`feature-icon feature-icon-${item.tone}`" class="h-68rpx w-68rpx flex items-center justify-center rounded-full">
            <text class="text-27rpx text-[var(--cook-ink)] font-900">
              {{ item.icon }}
            </text>
          </view>
          <text class="mt-14rpx block text-25rpx text-[var(--cook-text)] font-900">
            {{ item.title }}
          </text>
          <text class="mt-7rpx block text-20rpx text-[var(--cook-text-muted)] leading-snug">
            {{ item.description }}
          </text>
        </view>
      </view>
    </view>

    <view class="mt-44rpx px-8rpx">
      <AppSectionHeader title="一起开源做饭" subtitle="欢迎提建议、修问题，也欢迎添一道拿手菜" />
      <view class="repo-card cook-illo-card overflow-hidden">
        <view class="repo-top px-26rpx pb-24rpx pt-26rpx">
          <view class="flex items-start justify-between gap-18rpx">
            <view class="repo-mark h-76rpx w-76rpx flex shrink-0 items-center justify-center rounded-20rpx">
              <text class="text-26rpx text-[var(--cook-paper)] font-900">
                GH
              </text>
            </view>
            <view class="min-w-0 flex-1">
              <text class="text-22rpx text-[var(--cook-text-muted)] font-800">
                GitHub Repository
              </text>
              <text class="repo-name mt-5rpx block text-28rpx text-[var(--cook-text)] font-900 leading-tight">
                Moonofweisheng/MyCookLikeHOC
              </text>
            </view>
            <view class="license-badge cook-illo-pill shrink-0 px-12rpx py-5rpx">
              <text class="text-19rpx text-[var(--cook-ink)] font-900">
                MIT
              </text>
            </view>
          </view>
          <text class="mt-20rpx block text-23rpx text-[var(--cook-text-soft)] leading-relaxed">
            基于 uni-app、Vue 3、TypeScript 与 Supabase 构建。代码、数据脚本和部署方式全部公开。
          </text>
        </view>
        <view class="repo-action cook-pressable flex items-center justify-between px-26rpx py-21rpx" @click="openSourceRepository">
          <view class="flex items-center gap-12rpx">
            <wd-icon name="link" size="29rpx" color="var(--cook-ink)" />
            <text class="text-27rpx text-[var(--cook-ink)] font-900">
              访问开源仓库
            </text>
          </view>
          <view class="arrow-chip h-44rpx w-44rpx flex items-center justify-center rounded-full">
            <wd-icon name="arrow-right" size="27rpx" color="var(--cook-ink)" />
          </view>
        </view>
      </view>
    </view>

    <view class="mt-44rpx px-8rpx">
      <AppSectionHeader title="更多信息" />
      <view class="space-y-18rpx">
        <view class="about-action cook-illo-card-soft cook-pressable flex items-center justify-between px-24rpx py-22rpx" @click="showPrivacyPolicy">
          <view>
            <text class="block text-28rpx text-[var(--cook-text)] font-900">
              隐私与声明
            </text>
            <text class="mt-5rpx block text-22rpx text-[var(--cook-text-muted)]">
              了解数据与使用说明
            </text>
          </view>
          <wd-icon name="arrow-right" size="29rpx" color="var(--cook-ink)" />
        </view>
        <view class="about-action cook-illo-card-soft cook-pressable flex items-center justify-between px-24rpx py-22rpx" @click="checkUpdate">
          <view>
            <text class="block text-28rpx text-[var(--cook-text)] font-900">
              当前版本
            </text>
            <text class="mt-5rpx block text-22rpx text-[var(--cook-text-muted)]">
              v{{ version }} · 保持新鲜出锅
            </text>
          </view>
          <view class="version-dot" />
        </view>
      </view>
    </view>

    <view class="mt-42rpx flex flex-col items-center">
      <text class="text-24rpx text-[var(--cook-text)] font-900">
        好好吃饭，认真开源。
      </text>
      <text class="mt-7rpx text-20rpx text-[var(--cook-text-muted)]">
        Made with appetite & code
      </text>
    </view>
  </view>
</template>

<style scoped>
.about-page { overflow: hidden; }
.about-hero { background: linear-gradient(145deg, #fffef9 0%, #f0ffd9 100%); }
.hero-dot { position: absolute; border: 4rpx solid var(--cook-ink); border-radius: 999rpx; }
.hero-dot-yellow { width: 96rpx; height: 96rpx; right: -28rpx; top: -28rpx; background: var(--cook-yellow); }
.hero-dot-blue { width: 42rpx; height: 42rpx; right: 32rpx; bottom: 26rpx; background: var(--cook-blue-soft); }
.logo-wrap { border: 5rpx solid var(--cook-ink); border-radius: 32rpx; background: var(--cook-paper); box-shadow: 6rpx 7rpx 0 var(--cook-ink); transform: rotate(-3deg); }
.hero-kicker { letter-spacing: 1rpx; }
.hero-copy { border: 3rpx dashed var(--cook-ink); border-radius: 20rpx; background: rgba(255, 254, 249, 0.78); }
.feature-card { min-height: 196rpx; background: var(--cook-paper); }
.feature-icon { border: 4rpx solid var(--cook-ink); box-shadow: 3rpx 4rpx 0 var(--cook-ink); }
.feature-icon-yellow { background: var(--cook-yellow); }
.feature-icon-green { background: var(--cook-primary); }
.feature-icon-blue { background: var(--cook-blue-soft); }
.repo-card { background: var(--cook-paper); }
.repo-top { background: linear-gradient(135deg, var(--cook-paper) 0%, var(--cook-blue-soft) 100%); }
.repo-mark { border: 4rpx solid var(--cook-ink); background: var(--cook-ink); box-shadow: 4rpx 5rpx 0 var(--cook-yellow); transform: rotate(-4deg); }
.repo-name { overflow-wrap: anywhere; }
.license-badge { background: var(--cook-yellow); }
.repo-action { border-top: 4rpx solid var(--cook-ink); background: var(--cook-primary); }
.arrow-chip { border: 3rpx solid var(--cook-ink); background: var(--cook-paper); }
.about-action { background: var(--cook-paper); }
.version-dot { width: 24rpx; height: 24rpx; border: 4rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-primary); box-shadow: 3rpx 3rpx 0 var(--cook-ink); }
</style>
