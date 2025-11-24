<script setup lang="ts">
import pkg from '../../../package.json'

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
const { show: showMessage } = useGlobalMessage()

// 简洁版仅保留必要信息与功能入口

// 检查更新
function checkUpdate() {
  showToast({
    msg: '已是最新版本',
  })
}

// 隐私政策
function showPrivacyPolicy() {
  showMessage({
    title: '隐私政策',
    msg: '我们重视您的隐私，不会收集您的个人敏感信息。',
  })
}
</script>

<template>
  <view class="min-h-100% bg-white py-6">
    <view class="flex flex-col items-center px-3">
      <image src="@/static/logo.png" class="h-20 w-20" mode="aspectFit" />
      <text class="mt-3 text-5 text-gray-800 font-bold">
        {{ appName }}
      </text>

      <text class="mt-3 text-3 text-gray-500">
        v{{ version }}
      </text>
    </view>

    <view class="mx-3 mt-6">
      <wd-cell-group border custom-class="rounded-2! overflow-hidden">
        <wd-cell
          title="隐私政策"
          title-width="200px"
          label="查看隐私政策"
          is-link
          @click="showPrivacyPolicy"
        />
        <wd-cell
          title="更新日志"
          title-width="200px"
          label="版本更新信息"
          is-link
          @click="checkUpdate"
        />
      </wd-cell-group>
    </view>

    <view class="mx-6 mt-8 border-t border-gray-200 pt-4">
      <text class="block text-center text-3.5 text-gray-600 leading-relaxed">
        {{ appDesc }}
      </text>
    </view>
  </view>
</template>
