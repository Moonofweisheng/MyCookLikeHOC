<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDishDutyStore } from '@/store/dishDutyStore'

const emit = defineEmits<{ select: [] }>()
const store = useDishDutyStore()
const { homeStatus, currentWinner } = storeToRefs(store)

const title = computed(() => {
  if (homeStatus.value === 'completed') return '今日厨房已恢复和平'
  if (homeStatus.value === 'revealed') return `今天轮到${currentWinner.value?.nickname || '饭搭子'}刷碗`
  if (homeStatus.value === 'empty') return '今天谁刷碗？'
  return '饭吃好了，谁来收尾？'
})

const description = computed(() => {
  if (homeStatus.value === 'completed') return '已经打卡，可查看记录或再开一局'
  if (homeStatus.value === 'revealed') return '结果已经出炉，去查看或完成打卡'
  if (homeStatus.value === 'empty') return '添加至少两位饭搭子，开始今天的决定'
  return '按今天到场的人组局，再公平洗牌'
})
</script>

<template>
  <view class="dish-duty-home-card cook-illo-card cook-pressable" @click="emit('select')">
    <view class="dish-duty-copy">
      <text class="dish-duty-kicker">
        饭后分工
      </text>
      <text class="dish-duty-title">
        {{ title }}
      </text>
      <text class="dish-duty-desc">
        {{ description }}
      </text>
    </view>
    <view class="dish-duty-visual">
      <image src="/static/dish-duty/sponge.svg" class="dish-duty-sponge" mode="aspectFit" />
      <view class="dish-duty-arrow">
        <wd-icon name="arrow-right" size="26rpx" color="var(--cook-ink)" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.dish-duty-home-card { display: flex; min-height: 190rpx; align-items: center; justify-content: space-between; overflow: hidden; padding: 24rpx 26rpx; background: linear-gradient(135deg, #eaf4ff 0%, #fff8d9 100%); }
.dish-duty-copy { min-width: 0; flex: 1; }
.dish-duty-kicker { display: inline-block; border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-primary); padding: 5rpx 13rpx; color: var(--cook-ink); font-size: 20rpx; font-weight: 900; }
.dish-duty-title { display: block; margin-top: 13rpx; color: var(--cook-text); font-size: 31rpx; font-weight: 900; }
.dish-duty-desc { display: block; margin-top: 7rpx; color: var(--cook-text-soft); font-size: 22rpx; line-height: 1.5; }
.dish-duty-visual { position: relative; width: 142rpx; height: 126rpx; flex-shrink: 0; }
.dish-duty-sponge { position: absolute; left: 5rpx; top: 4rpx; width: 112rpx; height: 82rpx; transform: rotate(-9deg); }
.dish-duty-arrow { position: absolute; right: 0; bottom: 0; display: flex; width: 48rpx; height: 48rpx; align-items: center; justify-content: center; border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-paper); box-shadow: 3rpx 4rpx 0 var(--cook-ink); }
</style>
