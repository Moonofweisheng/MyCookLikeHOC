<script setup lang="ts">
// 骨架屏组件 - 纯展示组件，不包含业务逻辑
</script>

<template>
  <view class="pb-40rpx">
    <!-- 顶部大图骨架屏 -->
    <wd-skeleton
      :loading="true"
      :rows="0"
      avatar
      avatar-size="100%"
      avatar-shape="square"
      class="h-500rpx w-full"
    />

    <!-- 菜谱基本信息骨架屏 -->
    <view class="bg-white px-32rpx py-24rpx mt-0">
      <wd-skeleton
        :loading="true"
        :rows="2"
        title
        title-width="60%"
        row-width="30%"
      />
    </view>

    <!-- 配料清单骨架屏 -->
    <view class="mt-24rpx bg-white">
      <view class="border-b border-gray-100 px-32rpx py-24rpx">
        <wd-skeleton
          :loading="true"
          :rows="0"
          title
          title-width="25%"
        />
      </view>
      <view class="px-32rpx pb-24rpx">
        <wd-skeleton
          :loading="true"
          :rows="2"
          row-width="80%"
        />
      </view>
    </view>

    <!-- 制作步骤骨架屏 -->
    <view class="mt-24rpx bg-white">
      <view class="border-b border-gray-100 px-32rpx py-24rpx">
        <wd-skeleton
          :loading="true"
          :rows="0"
          title
          title-width="20%"
        />
      </view>
      <view class="px-32rpx pb-24rpx">
        <view v-for="i in 2" :key="i" class="flex py-32rpx border-b border-gray-50 last:border-b-0">
          <wd-skeleton
            :loading="true"
            :rows="0"
            avatar
            avatar-size="48rpx"
            avatar-shape="round"
            class="mr-24rpx"
          />
          <view class="flex-1">
            <wd-skeleton
              :loading="true"
              :rows="1"
              row-width="90%"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 小贴士骨架屏 -->
    <view class="mt-24rpx bg-white">
      <view class="border-b border-gray-100 px-32rpx py-24rpx">
        <wd-skeleton
          :loading="true"
          :rows="0"
          title
          title-width="30%"
        />
      </view>
      <view class="px-32rpx py-24rpx">
        <wd-skeleton
          :loading="true"
          :rows="2"
          row-width="95%"
        />
      </view>
    </view>

    <!-- 相关推荐骨架屏 -->
    <view class="mt-24rpx bg-white">
      <view class="border-b border-gray-100 px-32rpx py-24rpx">
        <wd-skeleton
          :loading="true"
          :rows="0"
          title
          title-width="25%"
        />
      </view>
      <view class="px-32rpx py-24rpx">
        <scroll-view scroll-x class="whitespace-nowrap">
          <view class="flex space-x-20rpx">
            <view v-for="i in 2" :key="i" class="inline-block w-240rpx flex-shrink-0">
              <wd-skeleton
                :loading="true"
                :rows="1"
                avatar
                avatar-size="100%"
                avatar-shape="square"
                class="h-160rpx"
              />
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped></style>