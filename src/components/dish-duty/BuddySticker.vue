<script setup lang="ts">
import { getBuddyRoleOption, getBuddyToneOption } from '@/features/dish-duty/catalog'
import type { BuddyRole, BuddyTone, ParticipantStatus } from '@/features/dish-duty/types'

const props = withDefaults(defineProps<{
  nickname: string
  role: BuddyRole
  tone: BuddyTone
  status?: ParticipantStatus
  temporary?: boolean
  selected?: boolean
  compact?: boolean
  showName?: boolean
}>(), {
  status: 'participating',
  temporary: false,
  selected: false,
  compact: false,
  showName: true,
})

const roleOption = computed(() => getBuddyRoleOption(props.role))
const toneOption = computed(() => getBuddyToneOption(props.tone))
const statusLabel = computed(() => {
  if (props.status === 'resting') return '本轮休息'
  if (props.status === 'absent') return '今晚不在'
  return '参与抽签'
})
</script>

<template>
  <view
    class="buddy-sticker"
    :class="{
      'is-muted': status !== 'participating',
      'is-selected': selected,
      'is-compact': compact,
    }"
    :style="{ '--buddy-tone': toneOption.color }"
  >
    <view class="buddy-avatar">
      <image class="buddy-image" :src="roleOption.src" mode="aspectFit" />
    </view>
    <text v-if="showName" class="buddy-name">
      {{ nickname }}
    </text>
    <text v-if="!compact" class="buddy-status">
      {{ statusLabel }}
    </text>
  </view>
</template>

<style scoped>
.buddy-sticker { display: flex; min-width: 116rpx; align-items: center; flex-direction: column; color: var(--cook-text); }
.buddy-avatar { position: relative; box-sizing: border-box; width: 104rpx; height: 104rpx; border: 5rpx solid var(--cook-ink); border-radius: 34rpx; background: var(--buddy-tone); box-shadow: 5rpx 6rpx 0 var(--cook-ink); transform: rotate(-2deg); transition: transform .18s ease, opacity .18s ease; }
.buddy-image { width: 100%; height: 100%; }
.buddy-name { max-width: 132rpx; overflow: hidden; margin-top: 12rpx; font-size: 25rpx; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
.buddy-status { margin-top: 4rpx; color: var(--cook-text-muted); font-size: 19rpx; font-weight: 700; }
.is-muted { opacity: .46; filter: grayscale(.6); }
.is-muted .buddy-avatar { transform: rotate(4deg) scale(.92); box-shadow: 3rpx 4rpx 0 var(--cook-ink); }
.is-selected .buddy-avatar { transform: rotate(0) scale(1.08); box-shadow: 8rpx 9rpx 0 var(--cook-ink); }
.is-compact { min-width: 90rpx; }
.is-compact .buddy-avatar { width: 78rpx; height: 78rpx; border-width: 4rpx; border-radius: 26rpx; box-shadow: 4rpx 5rpx 0 var(--cook-ink); }
.is-compact .buddy-name { max-width: 98rpx; margin-top: 8rpx; font-size: 21rpx; }
</style>
