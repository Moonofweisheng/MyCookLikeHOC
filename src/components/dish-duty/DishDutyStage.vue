<script setup lang="ts">
import BuddySticker from './BuddySticker.vue'
import { createLottieController, type LottieController } from '@/features/dish-duty/lottie'
import revealAnimation from '@/static/dish-duty/lottie/reveal.json'
import reducedRevealAnimation from '@/static/dish-duty/lottie/reveal-reduced.json'
import {
  getParticipantMotionPath,
} from '@/features/dish-duty/motion'
import type { DishDutyMeal } from '@/features/dish-duty/types'

const props = defineProps<{
  meal: DishDutyMeal
  reducedMotion: boolean
  active: boolean
}>()

const emit = defineEmits<{
  sealed: []
  revealing: []
  reveal: []
}>()

interface FoamCloud {
  x: number
  y: number
  width: number
  height: number
  rotate: number
}

const foamClouds: FoamCloud[] = [
  { x: 25, y: 27, width: 122, height: 72, rotate: -8 },
  { x: 69, y: 25, width: 126, height: 76, rotate: 7 },
  { x: 17, y: 57, width: 112, height: 72, rotate: 4 },
  { x: 79, y: 56, width: 116, height: 74, rotate: -5 },
  { x: 50, y: 75, width: 148, height: 76, rotate: 2 },
]

const finishingReveal = ref(false)
const revealRequested = ref(false)
const lottieHost = ref<unknown>(null)
let lottieController: LottieController | null = null
let stageTimer: ReturnType<typeof setTimeout> | undefined
let finishTimer: ReturnType<typeof setTimeout> | undefined

const participatingMembers = computed(() => props.meal.participants.filter(item => item.status === 'participating'))
const currentAttempt = computed(() => props.meal.drawAttempts[props.meal.drawAttempts.length - 1])
const isAnimated = computed(() => ['shuffling', 'sealed', 'revealing'].includes(props.meal.stage))
const showFoam = computed(() => props.meal.stage === 'sealed' || props.meal.stage === 'revealing')
const showWinner = computed(() => props.meal.stage === 'revealed' || props.meal.stage === 'completed')
const stageLabel = computed(() => {
  if (props.meal.stage === 'shuffling') return props.reducedMotion ? '成员正在聚拢…' : '餐盘漩涡正在换位…'
  if (finishingReveal.value) return '泡沫被水流卷走…'
  if (showFoam.value) return '泡沫正在自动清场…'
  return ''
})

function participantStyle(index: number, total: number) {
  const path = getParticipantMotionPath(index, total)
  return {
    '--start-x': `${path.start.x}rpx`,
    '--start-y': `${path.start.y}rpx`,
    '--swap-x': `${path.swap.x}rpx`,
    '--swap-y': `${path.swap.y}rpx`,
    '--orbit-x': `${path.orbit.x}rpx`,
    '--orbit-y': `${path.orbit.y}rpx`,
    '--gather-x': `${path.gather.x}rpx`,
    '--gather-y': `${path.gather.y}rpx`,
    '--exit-x': `${path.exit.x}rpx`,
    '--exit-y': `${path.exit.y}rpx`,
    '--motion-delay': `${Math.round(path.delayMs * 0.35)}ms`,
  }
}

function cloudStyle(cloud: FoamCloud, index: number) {
  return {
    'left': `${cloud.x}%`,
    'top': `${cloud.y}%`,
    'width': `${cloud.width}rpx`,
    'height': `${cloud.height}rpx`,
    '--cloud-rotate': `${cloud.rotate}deg`,
    '--cloud-push-x': '0rpx',
    '--cloud-push-y': '0rpx',
  }
}

function isCloudCleared(index: number) {
  return finishingReveal.value && index % 2 === 0
}

function resetInteraction() {
  finishingReveal.value = false
  revealRequested.value = false
  clearTimeout(finishTimer)
  lottieController?.destroy()
}

function setupLottie() {
  lottieController?.destroy()
  lottieController = null
  lottieController = createLottieController(
    lottieHost.value,
    props.reducedMotion ? reducedRevealAnimation : revealAnimation,
    () => requestStandardReveal(),
    props.reducedMotion ? 350 : 620,
  )
}

function scheduleStage() {
  clearTimeout(stageTimer)
  if (!props.active || props.meal.stage !== 'shuffling' || revealRequested.value) return
  if (props.reducedMotion) {
    stageTimer = setTimeout(() => requestSkipReveal(), 360)
    return
  }
  stageTimer = setTimeout(() => emit('sealed'), 1120)
}

function requestStandardReveal() {
  if (revealRequested.value) return
  revealRequested.value = true
  finishingReveal.value = true
  clearTimeout(finishTimer)
  finishTimer = setTimeout(() => emit('reveal'), 520)
}

function startAutomaticReveal() {
  if (revealRequested.value || finishingReveal.value || !showFoam.value || !props.active) return
  if (props.meal.stage === 'sealed') emit('revealing')
  finishingReveal.value = true
  setupLottie()
  lottieController?.play()
}

function requestSkipReveal() {
  if (revealRequested.value || !isAnimated.value) return
  revealRequested.value = true
  finishingReveal.value = true
  clearTimeout(stageTimer)
  clearTimeout(finishTimer)
  emit('reveal')
}

watch(() => `${props.meal.id}:${currentAttempt.value?.id || ''}`, () => resetInteraction(), { immediate: true })

watch(() => [props.meal.stage, props.reducedMotion, props.active], () => {
  if (!props.active) {
    clearTimeout(stageTimer)
    lottieController?.stop()
    return
  }
  if (props.meal.stage === 'shuffling') scheduleStage()
  if (showFoam.value) nextTick(() => startAutomaticReveal())
  if (showWinner.value) {
    finishingReveal.value = false
    clearTimeout(stageTimer)
    clearTimeout(finishTimer)
    lottieController?.destroy()
    lottieController = null
  }
}, { immediate: true })

onUnmounted(() => {
  clearTimeout(stageTimer)
  clearTimeout(finishTimer)
  lottieController?.destroy()
})
</script>

<template>
  <view class="dish-stage" :class="[`stage-${meal.stage}`, { 'is-reduced': reducedMotion, 'is-paused': !active, 'is-finishing': finishingReveal }]">
    <view class="stage-glow" />
    <view class="water-ring water-ring-one" />
    <view class="water-ring water-ring-two" />
    <view class="vortex-dash vortex-dash-one" />
    <view class="vortex-dash vortex-dash-two" />

    <view class="plate-wrap">
      <image
        class="plate-image"
        :src="meal.stage === 'completed' ? '/static/dish-duty/plate-clean.svg' : '/static/dish-duty/plate-dirty.svg'"
        mode="aspectFit"
      />
    </view>

    <view
      v-for="(participant, index) in participatingMembers"
      :key="participant.participantId"
      class="stage-buddy"
      :class="{
        'is-shuffling': meal.stage === 'shuffling',
        'is-loser': showWinner && participant.participantId !== currentAttempt?.selectedParticipantId,
        'is-winner': showWinner && participant.participantId === currentAttempt?.selectedParticipantId,
      }"
      :style="participantStyle(index, participatingMembers.length)"
    >
      <BuddySticker
        :nickname="participant.nickname"
        :role="participant.role"
        :tone="participant.tone"
        :temporary="participant.temporary"
        :show-name="!showWinner || participant.participantId !== currentAttempt?.selectedParticipantId"
        compact
      />
    </view>

    <view v-if="showFoam" class="foam-zone">
      <view ref="lottieHost" class="lottie-host" />
      <view class="foam-cloud-layer">
        <view
          v-for="(cloud, index) in foamClouds"
          :key="`cloud-${index}`"
          class="foam-cloud"
          :class="{ 'is-cleared': isCloudCleared(index) }"
          :style="cloudStyle(cloud, index)"
        >
          <view class="cloud-lobe cloud-lobe-one" />
          <view class="cloud-lobe cloud-lobe-two" />
          <view class="cloud-lobe cloud-lobe-three" />
        </view>
        <view class="foam-bubble foam-bubble-one" />
        <view class="foam-bubble foam-bubble-two" />
        <view class="foam-bubble foam-bubble-three" />
        <view class="foam-bubble foam-bubble-four" />
      </view>
    </view>

    <view v-if="showWinner" class="winner-burst">
      <view v-for="n in 8" :key="n" class="burst-ray" :style="{ transform: `rotate(${n * 45}deg)` }" />
      <view v-for="n in 5" :key="`drop-${n}`" class="water-drop" :style="{ transform: `rotate(${n * 72 + 18}deg) translateY(-118rpx)` }" />
    </view>

    <view v-if="stageLabel" class="stage-status">
      <view class="status-spark" />
      <text>{{ stageLabel }}</text>
    </view>

    <view v-if="isAnimated" class="skip-action cook-pressable" @click="requestSkipReveal">
      跳过动效
    </view>
  </view>
</template>

<style scoped>
.dish-stage { position: relative; box-sizing: border-box; height: 650rpx; overflow: hidden; border: 5rpx solid var(--cook-ink); border-radius: 32rpx; background: linear-gradient(180deg, #eaf4ff 0%, #f8ffed 100%); box-shadow: var(--cook-shadow-pop); isolation: isolate; transition: height .32s cubic-bezier(.2,.82,.28,1); }
.dish-stage.stage-revealed,
.dish-stage.stage-completed { height: 500rpx; }
.stage-glow { position: absolute; left: 50%; top: 43%; z-index: 0; width: 390rpx; height: 330rpx; border-radius: 999rpx; background: radial-gradient(circle, rgba(255,255,255,.92) 0%, rgba(219,241,255,.5) 45%, rgba(219,241,255,0) 72%); transform: translate(-50%, -50%); }
.plate-wrap { position: absolute; left: 50%; top: 45%; z-index: 3; width: 310rpx; height: 220rpx; transform: translate(-50%, -44%); }
.plate-image { width: 100%; height: 100%; }
.stage-shuffling .plate-wrap { animation: plate-vortex 1.06s cubic-bezier(.2,.82,.28,1) both; }
.is-reduced.stage-shuffling .plate-wrap { animation: plate-gather-reduced .35s ease-out both; }
.stage-completed .plate-image { animation: plate-clean-pop .65s cubic-bezier(.2, 1.35, .4, 1) both; }
.water-ring { position: absolute; left: 50%; top: 44%; z-index: 1; box-sizing: border-box; border: 7rpx solid #88c9ff; border-radius: 999rpx; opacity: .25; transform: translate(-50%, -50%); }
.water-ring-one { width: 370rpx; height: 270rpx; }
.water-ring-two { width: 500rpx; height: 405rpx; border-style: dashed; opacity: .16; }
.stage-shuffling .water-ring-one { animation: vortex-ring 1.04s cubic-bezier(.12,.74,.22,1) both; }
.stage-shuffling .water-ring-two { animation: vortex-ring 1.04s cubic-bezier(.12,.74,.22,1) .03s both reverse; }
.vortex-dash { position: absolute; z-index: 2; width: 58rpx; height: 15rpx; border-radius: 999rpx; background: #88c9ff; opacity: 0; }
.vortex-dash-one { left: 13%; top: 35%; transform: rotate(-18deg); }
.vortex-dash-two { right: 12%; top: 58%; transform: rotate(19deg); }
.stage-shuffling .vortex-dash { animation: dash-flash .42s ease-out .2s 2 both; }
.stage-buddy { position: absolute; left: 50%; top: 43%; z-index: 5; transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y)); transition: opacity .32s ease, filter .32s ease, transform .44s cubic-bezier(.2,.9,.32,1); will-change: transform, opacity; }
.stage-buddy.is-shuffling { animation: buddy-vortex 1.04s cubic-bezier(.15,.78,.18,1) var(--motion-delay) both; }
.stage-sealed .stage-buddy,
.stage-revealing .stage-buddy { z-index: 14; opacity: .76; transform: translate(-50%, -50%) translate(var(--gather-x), var(--gather-y)) scale(.86); }
.stage-buddy.is-loser { z-index: 2; opacity: 0; filter: saturate(.55); transform: translate(-50%, -50%) translate(var(--exit-x), var(--exit-y)) scale(.48); }
.stage-buddy.is-winner { z-index: 11; transform: translate(-50%, -50%) scale(1.24); animation: winner-pop .72s cubic-bezier(.2, 1.4, .4, 1) both; }
.stage-revealed .plate-wrap,
.stage-completed .plate-wrap { top: 61%; opacity: .42; transform: translate(-50%, -44%) scale(.88); }
.stage-revealed .stage-buddy.is-winner,
.stage-completed .stage-buddy.is-winner { top: 42%; z-index: 15; transform: translate(-50%, -50%) scale(1.48); }
.is-reduced .stage-buddy.is-shuffling { animation: buddy-gather-reduced .35s ease-out var(--motion-delay) both; }
.foam-zone { position: absolute; left: 50%; top: 44%; z-index: 12; width: 440rpx; height: 340rpx; transform: translate(-50%, -50%); }
.lottie-host { position: absolute; inset: -12%; z-index: 5; pointer-events: none; }
.foam-cloud-layer { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.foam-cloud { position: absolute; opacity: .96; transform: translate(-50%, -50%) translate(var(--cloud-push-x), var(--cloud-push-y)) rotate(var(--cloud-rotate)) scale(1); transition: opacity .24s ease, transform .28s cubic-bezier(.2,.9,.35,1); }
.cloud-lobe { position: absolute; border: 2rpx solid rgba(126,183,222,.52); border-radius: 999rpx; background: rgba(255,255,255,.94); box-shadow: inset 0 -6rpx 0 rgba(197,231,250,.55), 0 5rpx 0 rgba(75,147,194,.12); }
.cloud-lobe-one { left: 0; bottom: 0; width: 58%; height: 68%; }
.cloud-lobe-two { left: 25%; top: 0; width: 52%; height: 82%; }
.cloud-lobe-three { right: 0; bottom: 3%; width: 48%; height: 62%; }
.foam-cloud.is-cleared { opacity: .06; transform: translate(-50%, -50%) translate(var(--cloud-push-x), var(--cloud-push-y)) rotate(var(--cloud-rotate)) scaleX(1.28) scaleY(.55); }
.foam-bubble { position: absolute; border: 2rpx solid rgba(103,174,218,.6); border-radius: 999rpx; background: rgba(255,255,255,.78); }
.foam-bubble-one { left: 47%; top: 13%; width: 19rpx; height: 19rpx; }
.foam-bubble-two { left: 43%; top: 50%; width: 12rpx; height: 12rpx; }
.foam-bubble-three { right: 9%; top: 18%; width: 16rpx; height: 16rpx; }
.foam-bubble-four { left: 9%; bottom: 12%; width: 15rpx; height: 15rpx; }
.is-finishing .foam-cloud { animation: foam-sweep-away .36s cubic-bezier(.4,0,.8,.25) both; }
.is-finishing .foam-cloud:nth-child(2n) { animation-delay: .04s; }
.is-finishing .foam-bubble { animation: foam-sweep-away .3s ease-in both; }
.stage-status { position: absolute; bottom: 18rpx; left: 50%; z-index: 19; display: flex; max-width: 390rpx; align-items: center; justify-content: center; gap: 9rpx; border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: rgba(255,254,249,.94); padding: 9rpx 17rpx; box-shadow: 3rpx 4rpx 0 rgba(47,47,45,.86); color: var(--cook-ink); font-size: 20rpx; font-weight: 900; transform: translateX(-50%); }
.status-spark { width: 11rpx; height: 11rpx; border-radius: 999rpx; background: #54b9ec; }
.skip-action { position: absolute; right: 20rpx; top: 18rpx; z-index: 20; border: 2rpx solid rgba(47,47,45,.72); border-radius: 999rpx; background: rgba(255,254,249,.78); padding: 7rpx 14rpx; color: var(--cook-text-soft); font-size: 19rpx; font-weight: 900; box-shadow: 2rpx 3rpx 0 rgba(47,47,45,.55); }
.winner-burst { position: absolute; left: 50%; top: 43%; z-index: 7; width: 30rpx; height: 30rpx; }
.stage-revealed .winner-burst,
.stage-completed .winner-burst { top: 42%; }
.stage-revealed .water-ring,
.stage-completed .water-ring,
.stage-revealed .vortex-dash,
.stage-completed .vortex-dash { opacity: 0; }
.burst-ray { position: absolute; left: 10rpx; top: -135rpx; width: 12rpx; height: 96rpx; border: 4rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-yellow); opacity: 0; transform-origin: 6rpx 150rpx; animation: ray-burst .58s ease-out .06s both; }
.water-drop { position: absolute; left: 6rpx; top: 4rpx; width: 18rpx; height: 28rpx; border: 3rpx solid var(--cook-ink); border-radius: 999rpx 999rpx 999rpx 3rpx; background: #88c9ff; opacity: 0; transform-origin: 9rpx 9rpx; animation: water-drop-pop .65s ease-out .18s both; }
.stage-completed { background: linear-gradient(180deg, #f0ffd9 0%, #fffef9 100%); }
.is-paused .plate-wrap,
.is-paused .plate-image,
.is-paused .water-ring,
.is-paused .vortex-dash,
.is-paused .stage-buddy,
.is-paused .foam-cloud,
.is-paused .foam-bubble,
.is-paused .burst-ray,
.is-paused .water-drop { animation-play-state: paused !important; }
@keyframes buddy-vortex {
  0% { transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y)) rotate(-5deg) scale(.94); }
  22% { transform: translate(-50%, -50%) translate(var(--orbit-x), var(--orbit-y)) rotate(8deg) scale(1.02); }
  58% { transform: translate(-50%, -50%) translate(var(--swap-x), var(--swap-y)) rotate(-7deg) scale(1.06); }
  80% { transform: translate(-50%, -50%) translate(var(--orbit-x), var(--orbit-y)) rotate(5deg) scale(.98); }
  100% { transform: translate(-50%, -50%) translate(var(--gather-x), var(--gather-y)) rotate(0) scale(.86); }
}
@keyframes buddy-gather-reduced {
  0% { opacity: .55; transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y)) scale(.9); }
  100% { opacity: 1; transform: translate(-50%, -50%) translate(var(--gather-x), var(--gather-y)) scale(.9); }
}
@keyframes plate-vortex { 0% { transform: translate(-50%, -44%) rotate(0) scale(.9); } 72% { transform: translate(-50%, -44%) rotate(300deg) scale(1.04); } 100% { transform: translate(-50%, -44%) rotate(360deg) scale(1); } }
@keyframes plate-gather-reduced { from { opacity: .7; transform: translate(-50%, -44%) scale(.9); } to { opacity: 1; transform: translate(-50%, -44%) scale(1); } }
@keyframes vortex-ring { 0% { opacity: .08; transform: translate(-50%, -50%) rotate(0) scale(.75); } 62% { opacity: .42; transform: translate(-50%, -50%) rotate(250deg) scale(1.08); } 100% { opacity: .2; transform: translate(-50%, -50%) rotate(360deg) scale(.96); } }
@keyframes dash-flash { 0% { opacity: 0; transform: translateX(20rpx) scaleX(.5); } 45% { opacity: .7; } 100% { opacity: 0; transform: translateX(-36rpx) scaleX(1.25); } }
@keyframes foam-sweep-away { 0% { opacity: .96; } 55% { opacity: .46; transform: translate(-50%, -50%) translate(36rpx, -5rpx) scaleX(1.22) scaleY(.68); } 100% { opacity: 0; transform: translate(-50%, -50%) translate(170rpx, -18rpx) scaleX(.4) scaleY(.18); } }
@keyframes winner-pop { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.5) rotate(-8deg); } 65% { opacity: 1; transform: translate(-50%, -50%) scale(1.38) rotate(4deg); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1.24); } }
@keyframes ray-burst { 0% { height: 24rpx; opacity: 0; } 48% { opacity: 1; } 100% { height: 96rpx; opacity: .82; } }
@keyframes plate-clean-pop { 0% { opacity: .5; transform: scale(.82) rotate(-5deg); } 70% { opacity: 1; transform: scale(1.08) rotate(2deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes water-drop-pop { 0% { opacity: 0; } 35% { opacity: .92; } 100% { opacity: 0; } }
</style>
