<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import BuddySticker from '@/components/dish-duty/BuddySticker.vue'
import DishDutyStage from '@/components/dish-duty/DishDutyStage.vue'
import { buddyRoleOptions, buddyToneOptions, redrawReasonOptions } from '@/features/dish-duty/catalog'
import { formatDateKey, formatMealTime } from '@/features/dish-duty/date'
import type { BuddyRole, BuddyTone, DishDutyMeal, DishDutyMember, MealParticipant, ParticipantStatus, RedrawReason } from '@/features/dish-duty/types'
import { useDishDutyStore } from '@/store/dishDutyStore'

definePage({
  name: 'dish-duty',
  style: {
    navigationBarTitleText: '今天谁刷碗',
  },
})

const store = useDishDutyStore()
const { activeMembers, archivedMembers, currentAttempt, currentMeal, currentWinner, draft, recentMeals, reducedMotion } = storeToRefs(store)
const { show: showToast } = useGlobalToast()

const memberEditorVisible = ref(false)
const editingMemberId = ref<string | null>(null)
const memberForm = reactive({ nickname: '', role: 'egg' as BuddyRole, tone: 'green' as BuddyTone })
const redrawVisible = ref(false)
const deleteMemberTarget = ref<DishDutyMember | null>(null)
const purgeMemberTarget = ref<DishDutyMember | null>(null)
const deleteMealTarget = ref<DishDutyMeal | null>(null)
const memberManagerOpen = ref(false)
const completing = ref(false)
const pageActive = ref(true)
const openingNewMeal = ref(false)

const participatingDraft = computed(() => draft.value?.participants.filter(item => item.status === 'participating') || [])
const canDraw = computed(() => participatingDraft.value.length >= 2)
const isFirstUse = computed(() => !currentMeal.value && activeMembers.value.length === 0 && !draft.value)
const showSetup = computed(() => !currentMeal.value && !isFirstUse.value)
const showResult = computed(() => currentMeal.value?.stage === 'revealed' || currentMeal.value?.stage === 'completed')
const currentRuleText = computed(() => {
  return '本轮所有参与者机会均等，每个人被选中的概率相同。'
})
const resultRuleText = computed(() => {
  const attempt = currentAttempt.value
  if (!attempt) return ''
  if (attempt.explanation.key === 'equal-random') return `本轮 ${attempt.candidateParticipantIds.length} 人等概率随机，每个人机会相同。`
  if (attempt.explanation.key === 'temporary-random') return '本局所有参与者等概率随机产生。'
  if (attempt.explanation.key === 'all-tied') return `参与者近 ${attempt.explanation.windowDays} 天完成次数相同，本次随机产生。`
  return `近 ${attempt.explanation.windowDays} 天完成 ${attempt.explanation.selectedCompletionCount} 次，属于参与者中最少。`
})
const resultTitle = computed(() => {
  if (!currentWinner.value) return ''
  return currentMeal.value?.stage === 'completed'
    ? `${currentWinner.value.nickname}，今天已完成`
    : `${currentWinner.value.nickname}，轮到你啦`
})

function ensurePageDraft() {
  if (!currentMeal.value && activeMembers.value.length > 0) {
    try {
      store.ensureDraft()
    }
    catch (error) {
      showToast({ msg: error instanceof Error ? error.message : '本地保存失败，请重试', iconName: 'warning' })
    }
  }
}

function initializeReducedMotion() {
  if (store.reducedMotionInitialized) return
  let prefersReducedMotion = false
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    const info = uni.getSystemInfoSync() as any
    prefersReducedMotion = prefersReducedMotion || info?.reducedMotion === true
  }
  catch {}
  store.setReducedMotion(prefersReducedMotion)
}

function openNewMember() {
  editingMemberId.value = null
  memberForm.nickname = ''
  memberForm.role = buddyRoleOptions[activeMembers.value.length % buddyRoleOptions.length].key
  memberForm.tone = buddyToneOptions[activeMembers.value.length % buddyToneOptions.length].key
  memberEditorVisible.value = true
}

function closeMemberEditor() {
  memberEditorVisible.value = false
  editingMemberId.value = null
}

function openEditMember(member: DishDutyMember) {
  editingMemberId.value = member.id
  memberForm.nickname = member.nickname
  memberForm.role = member.role
  memberForm.tone = member.tone
  memberEditorVisible.value = true
}

function saveMember() {
  const result = editingMemberId.value
    ? store.updateMember(editingMemberId.value, { ...memberForm })
    : store.addMember(memberForm.nickname, memberForm.role, memberForm.tone)
  if (!result.ok) {
    showToast({ msg: result.error || '保存失败', iconName: 'warning' })
    return
  }
  memberEditorVisible.value = false
  ensurePageDraft()
  showToast({ msg: editingMemberId.value ? '饭搭子已更新，历史仍然保留' : '饭搭子加入成功', iconName: 'success' })
}

function requestDeleteMember(member: DishDutyMember) {
  deleteMemberTarget.value = member
}

function cancelDeleteMember() {
  deleteMemberTarget.value = null
}

function confirmDeleteMember() {
  const member = deleteMemberTarget.value
  if (!member) return
  const result = store.deleteMember(member.id)
  deleteMemberTarget.value = null
  if (!result.ok) {
    showToast({ msg: result.error || '删除失败', iconName: 'warning' })
  }
  else {
    ensurePageDraft()
    showToast({ msg: '饭搭子已删除，历史记录仍然保留' })
  }
}

function restoreMember(memberId: string) {
  const result = store.restoreMember(memberId)
  if (!result.ok) {
    showToast({ msg: result.error || '恢复失败', iconName: 'warning' })
  }
  else {
    ensurePageDraft()
    showToast({ msg: '饭搭子已恢复', iconName: 'success' })
  }
}

function requestPurgeMember(member: DishDutyMember) {
  purgeMemberTarget.value = member
}

function cancelPurgeMember() {
  purgeMemberTarget.value = null
}

function confirmPurgeMember() {
  const member = purgeMemberTarget.value
  if (!member) return
  const result = store.purgeMember(member.id)
  purgeMemberTarget.value = null
  if (!result.ok) {
    showToast({ msg: result.error || '彻底删除失败', iconName: 'warning' })
  }
  else {
    ensurePageDraft()
    showToast({ msg: '饭搭子已彻底删除，历史记录仍然保留' })
  }
}

function requestDeleteMeal(meal: DishDutyMeal) {
  deleteMealTarget.value = meal
}

function cancelDeleteMeal() {
  deleteMealTarget.value = null
}

function confirmDeleteMeal() {
  const meal = deleteMealTarget.value
  if (!meal) return
  const result = store.deleteMeal(meal.id)
  deleteMealTarget.value = null
  if (!result.ok) {
    showToast({ msg: result.error || '饭局删除失败', iconName: 'warning' })
  }
  else {
    ensurePageDraft()
    showToast({ msg: '饭局记录已删除' })
  }
}

const statusOrder: ParticipantStatus[] = ['participating', 'resting', 'absent']
function cycleParticipantStatus(participant: MealParticipant) {
  const currentIndex = statusOrder.indexOf(participant.status)
  const result = store.setParticipantStatus(participant.participantId, statusOrder[(currentIndex + 1) % statusOrder.length])
  if (!result.ok) showToast({ msg: result.error || '无法切换参与状态', iconName: 'warning' })
}

function participantStatusAction(participant: MealParticipant) {
  if (participant.status === 'participating') return '点一下：本轮休息'
  if (participant.status === 'resting') return '点一下：今晚不在'
  return '点一下：重新参与'
}

function requestDraw() {
  if (!canDraw.value) {
    showToast({ msg: '至少选择两名参与者', iconName: 'warning' })
    return
  }
  commitDraw()
}

function commitDraw() {
  const result = store.startDraw()
  if (!result.ok) showToast({ msg: result.error || '抽签失败', iconName: 'warning' })
}

function handleSealed() {
  store.setMealStage('sealed')
}

function handleRevealing() {
  if (currentMeal.value?.stage === 'sealed') store.setMealStage('revealing')
}

function handleReveal() {
  store.revealResult()
  try {
    uni.vibrateShort({ type: 'light' })
  }
  catch {}
}

function completeDuty() {
  const result = store.completeMeal()
  if (!result.ok) {
    showToast({ msg: result.error || '打卡失败', iconName: 'warning' })
    return
  }
  completing.value = true
  setTimeout(() => completing.value = false, 850)
  showToast({ msg: '厨房和平已恢复！', iconName: 'success' })
}

function startAnotherMeal() {
  if (openingNewMeal.value) return
  openingNewMeal.value = true
  const result = store.startNewMeal()
  if (!result.ok) {
    openingNewMeal.value = false
    showToast({ msg: result.error || '暂时不能再开一局', iconName: 'warning' })
    return
  }
  setTimeout(() => openingNewMeal.value = false, 450)
  showToast({ msg: '新饭局已开好，确认这次谁在场吧', iconName: 'success' })
}

function doRedraw(reason: RedrawReason) {
  const result = store.redraw(reason)
  redrawVisible.value = false
  if (!result.ok) showToast({ msg: result.error || '无法重新抽取', iconName: 'warning' })
}

function attemptWinnerName(meal: typeof currentMeal.value) {
  const attempt = meal?.drawAttempts[meal.drawAttempts.length - 1]
  return meal?.participants.find(item => item.participantId === attempt?.selectedParticipantId)?.nickname || '未知'
}

function reasonLabel(reason: RedrawReason | null) {
  return redrawReasonOptions.find(item => item.key === reason)?.label || ''
}

function historyRuleText(meal: NonNullable<typeof currentMeal.value>) {
  const attempt = meal.drawAttempts[meal.drawAttempts.length - 1]
  if (attempt?.mode === 'equal-random') return '全员等概率随机'
  if (attempt?.explanation.key === 'all-tied') return `近 ${attempt.explanation.windowDays} 天次数相同后随机`
  return `近 ${attempt?.explanation.windowDays || 7} 天完成次数最少者中随机`
}

onLoad(() => {
  initializeReducedMotion()
  ensurePageDraft()
})

onShow(() => {
  pageActive.value = true
  ensurePageDraft()
})

onHide(() => {
  pageActive.value = false
})

onUnload(() => {
  pageActive.value = false
})

onShareAppMessage(() => ({
  title: currentWinner.value ? `今天轮到${currentWinner.value.nickname}刷碗` : '今天谁刷碗？来公平抽一个',
  path: '/pages/dish-duty/index',
}))

onShareTimeline(() => ({
  title: showResult.value && currentWinner.value
    ? `今天轮到${currentWinner.value.nickname}刷碗`
    : '今天谁刷碗？来公平抽一个',
}))
</script>

<template>
  <view class="dish-duty-page cook-illo-page min-h-screen px-24rpx pb-80rpx pt-24rpx" :class="{ 'is-opening-new-meal': openingNewMeal }">
    <view class="dish-duty-hero cook-illo-card relative overflow-hidden px-28rpx py-28rpx">
      <view class="hero-bubble hero-bubble-one" />
      <view class="hero-bubble hero-bubble-two" />
      <view class="relative z-1 flex items-center justify-between gap-20rpx">
        <view class="min-w-0 flex-1">
          <text class="cook-illo-tag inline-block px-14rpx py-5rpx text-21rpx font-900">
            饭后分工
          </text>
          <text class="mt-13rpx block text-40rpx text-[var(--cook-text)] font-900">
            今天谁刷碗？
          </text>
          <text class="mt-8rpx block text-23rpx text-[var(--cook-text-soft)] leading-relaxed">
            饭搭子随时复用，每顿饭按实际到场的人重新组局。
          </text>
        </view>
        <image src="/static/dish-duty/sponge.svg" class="h-106rpx w-144rpx shrink-0 rotate--8" mode="aspectFit" />
      </view>
    </view>

    <view v-if="isFirstUse" class="mt-36rpx">
      <EmptyState title="还没有饭搭子" description="先添加至少两位饭搭子，就可以开始今天的决定" icon="user" />
      <view class="mt-24rpx">
        <view class="cook-illo-button cook-pressable py-18rpx text-center text-25rpx font-900" @click="openNewMember">
          添加饭搭子
        </view>
      </view>
    </view>

    <template v-else-if="showSetup">
      <view class="mt-40rpx">
        <AppSectionHeader title="今天有谁吃饭" subtitle="点击角色切换：参与 → 休息 → 不在场" />
        <view class="participant-grid grid grid-cols-3 gap-x-18rpx gap-y-26rpx">
          <view
            v-for="participant in draft?.participants"
            :key="participant.participantId"
            class="participant-cell cook-pressable"
            @click="cycleParticipantStatus(participant)"
          >
            <BuddySticker v-bind="participant" />
            <text class="mt-8rpx block text-center text-18rpx text-[var(--cook-text-muted)] font-700">
              {{ participantStatusAction(participant) }}
            </text>
          </view>
          <view class="add-participant cook-pressable" @click="openNewMember">
            <view class="add-circle">
              ＋
            </view>
            <text class="mt-12rpx text-23rpx font-900">
              添加饭搭子
            </text>
            <text class="mt-4rpx text-18rpx text-[var(--cook-text-muted)]">
              加入当前饭局
            </text>
          </view>
        </view>
      </view>

      <view class="rule-card cook-illo-card-soft mt-36rpx px-24rpx py-22rpx">
        <view class="flex items-center gap-12rpx">
          <text class="rule-icon">
            公
          </text><text class="text-27rpx font-900">
            本局规则
          </text>
        </view>
        <text class="mt-12rpx block text-23rpx text-[var(--cook-text-soft)] leading-relaxed">
          {{ currentRuleText }}
        </text>
        <text class="mt-9rpx block text-20rpx text-[var(--cook-text-muted)]">
          当前 {{ participatingDraft.length }} 人参与，休息和不在场成员不会进入候选。
        </text>
      </view>

      <view class="draw-button cook-illo-button cook-pressable mt-28rpx py-22rpx text-center" :class="{ 'is-disabled': !canDraw }" @click="requestDraw">
        <text class="text-29rpx text-[var(--cook-ink)] font-900">
          出来吧！洗碗君
        </text>
      </view>
    </template>

    <template v-if="currentMeal">
      <view class="mt-36rpx">
        <DishDutyStage :meal="currentMeal" :reduced-motion="reducedMotion" :active="pageActive" @sealed="handleSealed" @revealing="handleRevealing" @reveal="handleReveal" />
      </view>

      <view v-if="showResult && currentWinner" class="result-card cook-illo-card mt-30rpx px-28rpx pb-28rpx pt-26rpx text-center" :class="{ 'is-completing': completing }">
        <text class="block text-37rpx text-[var(--cook-text)] font-900">
          {{ resultTitle }}
        </text>
        <text class="mt-10rpx block text-23rpx text-[var(--cook-text-soft)] leading-relaxed">
          {{ resultRuleText }}
        </text>
        <template v-if="currentMeal.stage !== 'completed'">
          <view class="cook-illo-button cook-pressable mt-26rpx py-19rpx text-28rpx font-900" @click="completeDuty">
            洗完打卡
          </view>
          <view class="mt-18rpx text-23rpx text-[var(--cook-text-soft)] font-900" @click="redrawVisible = true">
            今天有情况
          </view>
        </template>
        <template v-else>
          <view class="completed-stamp mt-24rpx">
            厨房和平已恢复
          </view>
          <view class="another-meal-button cook-pressable mt-24rpx py-19rpx text-28rpx font-900" @click="startAnotherMeal">
            再开一局
          </view>
          <text class="mt-11rpx block text-19rpx text-[var(--cook-text-muted)]">
            适合夜宵、加餐或同一天的下一顿，上一局会完整保留。
          </text>
        </template>
      </view>
    </template>

    <view class="mt-44rpx">
      <AppSectionHeader title="饭搭子" subtitle="改名或换角色不会丢失历史" :action-text="memberManagerOpen ? '收起' : '管理'" @action="memberManagerOpen = !memberManagerOpen" />
      <view v-if="activeMembers.length" class="grid grid-cols-3 gap-x-18rpx gap-y-26rpx">
        <view v-for="member in activeMembers" :key="member.id" class="member-manage-card cook-illo-card-soft px-8rpx pb-14rpx pt-14rpx text-center">
          <BuddySticker v-bind="member" compact />
          <view v-if="memberManagerOpen" class="mt-10rpx flex justify-center gap-10rpx">
            <text class="member-mini-action" @click="openEditMember(member)">
              编辑
            </text>
            <text class="member-mini-action is-danger" @click="requestDeleteMember(member)">
              删除
            </text>
          </view>
        </view>
      </view>
      <view class="add-member-row cook-pressable mt-20rpx py-17rpx text-center" @click="openNewMember">
        ＋ 添加饭搭子
      </view>
      <view v-if="memberManagerOpen && archivedMembers.length" class="mt-24rpx">
        <text class="block text-22rpx text-[var(--cook-text-soft)] font-900">
          已删除 · 历史仍保留
        </text>
        <view class="mt-12rpx space-y-12rpx">
          <view v-for="member in archivedMembers" :key="member.id" class="archived-member-row">
            <text class="archived-member-name">
              {{ member.nickname }}
            </text>
            <view class="flex gap-10rpx">
              <text class="member-mini-action cook-pressable" @click="restoreMember(member.id)">
                恢复
              </text>
              <text class="member-mini-action is-danger is-purge cook-pressable" @click="requestPurgeMember(member)">
                彻底删除
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="mt-44rpx">
      <AppSectionHeader title="最近饭局" subtitle="结果、换签和完成状态都留在当前设备" />
      <EmptyState v-if="recentMeals.length === 0" title="还没有饭局记录" description="组建今天的饭局，第一条记录就会出现在这里" icon="time" />
      <view v-else class="space-y-18rpx">
        <view v-for="meal in recentMeals" :key="meal.id" class="history-card cook-illo-card-soft px-22rpx py-20rpx">
          <view class="flex items-center justify-between gap-16rpx">
            <view>
              <text class="text-26rpx font-900">
                {{ formatDateKey(meal.dateKey) }}
              </text><text class="ml-8rpx text-20rpx text-[var(--cook-text-muted)]">
                {{ formatMealTime(meal.createdAt) }}
              </text><text class="ml-8rpx text-20rpx text-[var(--cook-text-muted)]">
                {{ meal.stage === 'completed' ? '已完成' : '待打卡' }}
              </text>
            </view>
            <view class="flex items-center gap-10rpx">
              <text class="history-winner">
                {{ attemptWinnerName(meal) }}
              </text>
              <text class="history-delete-action cook-pressable" @click="requestDeleteMeal(meal)">
                删除
              </text>
            </view>
          </view>
          <text class="mt-10rpx block text-21rpx text-[var(--cook-text-soft)]">
            参与：{{ meal.participants.filter(item => item.status === 'participating').map(item => item.nickname).join('、') }}
          </text>
          <text class="mt-6rpx block text-20rpx text-[var(--cook-text-muted)]">
            规则：{{ historyRuleText(meal) }}
          </text>
          <view v-if="meal.drawAttempts.length > 1" class="mt-11rpx">
            <text v-for="attempt in meal.drawAttempts.slice(1)" :key="attempt.id" class="block text-19rpx text-[var(--cook-text-muted)]">
              换签：{{ reasonLabel(attempt.redrawReason) }} → {{ meal.participants.find(item => item.participantId === attempt.selectedParticipantId)?.nickname }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="data-note cook-illo-status mt-38rpx px-22rpx py-19rpx">
      <text class="block text-23rpx text-[var(--cook-text)] font-900">
        关于公平与数据
      </text>
      <text class="mt-8rpx block text-20rpx text-[var(--cook-text-soft)] leading-relaxed">
        每顿饭只在本轮参与者中等概率决定，历史次数不会改变概率。成员和历史只保存在当前设备，不跨设备同步，也不提供防篡改保证。
      </text>
    </view>

    <view v-if="memberEditorVisible" class="sheet-mask" @click="closeMemberEditor">
      <view class="editor-sheet cook-illo-card px-26rpx pb-34rpx pt-26rpx" @click.stop>
        <view class="sheet-heading">
          <text class="text-31rpx font-900">
            {{ editingMemberId ? '编辑饭搭子' : '添加饭搭子' }}
          </text>
          <text class="sheet-close cook-pressable" @click="closeMemberEditor">
            ×
          </text>
        </view>
        <view class="form-input mt-22rpx">
          <input v-model="memberForm.nickname" :maxlength="6" placeholder="输入昵称，最多6个字">
        </view>
        <text class="form-label">
          领一个专属角色
        </text>
        <scroll-view scroll-x class="role-scroll">
          <view class="flex gap-15rpx py-8rpx">
            <view v-for="role in buddyRoleOptions" :key="role.key" class="role-option" :class="{ 'is-active': memberForm.role === role.key }" @click="memberForm.role = role.key">
              <image :src="role.src" mode="aspectFit" /><text>{{ role.label }}</text>
            </view>
          </view>
        </scroll-view>
        <text class="form-label">
          角色底色
        </text>
        <view class="flex flex-wrap gap-16rpx">
          <view v-for="tone in buddyToneOptions" :key="tone.key" class="tone-option" :class="{ 'is-active': memberForm.tone === tone.key }" :style="{ background: tone.color }" @click="memberForm.tone = tone.key" />
        </view>
        <view class="cook-illo-button cook-pressable mt-28rpx py-18rpx text-center text-27rpx font-900" @click="saveMember">
          确认保存
        </view>
      </view>
    </view>

    <view v-if="deleteMemberTarget" class="sheet-mask" @click="cancelDeleteMember">
      <view class="confirm-card cook-illo-card px-28rpx py-28rpx text-center" @click.stop>
        <text class="block text-31rpx font-900">
          删除这位饭搭子？
        </text>
        <text class="mt-13rpx block text-23rpx text-[var(--cook-text-soft)] leading-relaxed">
          {{ deleteMemberTarget?.nickname }} 会从饭搭子列表中移除，但历史饭局仍会保留，也可以稍后恢复。
        </text>
        <view class="delete-button cook-pressable mt-24rpx py-17rpx text-26rpx font-900" @click="confirmDeleteMember">
          确认删除
        </view>
        <view class="mt-18rpx text-22rpx font-900" @click="cancelDeleteMember">
          先不删除
        </view>
      </view>
    </view>

    <view v-if="purgeMemberTarget" class="sheet-mask" @click="cancelPurgeMember">
      <view class="confirm-card cook-illo-card px-28rpx py-28rpx text-center" @click.stop>
        <text class="block text-31rpx font-900">
          彻底删除这位饭搭子？
        </text>
        <text class="mt-13rpx block text-23rpx text-[var(--cook-text-soft)] leading-relaxed">
          {{ purgeMemberTarget?.nickname }} 的成员资料将从本机永久移除，之后无法恢复；历史饭局中的昵称、角色和结果仍会保留。
        </text>
        <view class="delete-button purge-button cook-pressable mt-24rpx py-17rpx text-26rpx font-900" @click="confirmPurgeMember">
          确认彻底删除
        </view>
        <view class="mt-18rpx text-22rpx font-900" @click="cancelPurgeMember">
          先保留资料
        </view>
      </view>
    </view>

    <view v-if="deleteMealTarget" class="sheet-mask" @click="cancelDeleteMeal">
      <view class="confirm-card cook-illo-card px-28rpx py-28rpx text-center" @click.stop>
        <text class="block text-31rpx font-900">
          删除这条饭局记录？
        </text>
        <text class="mt-13rpx block text-23rpx text-[var(--cook-text-soft)] leading-relaxed">
          只会移除这条饭局，不影响饭搭子成员、其他饭局或完成统计；删除后无法恢复。
        </text>
        <view class="delete-button cook-pressable mt-24rpx py-17rpx text-26rpx font-900" @click="confirmDeleteMeal">
          确认删除记录
        </view>
        <view class="mt-18rpx text-22rpx font-900" @click="cancelDeleteMeal">
          先保留记录
        </view>
      </view>
    </view>

    <view v-if="redrawVisible" class="sheet-mask" @click="redrawVisible = false">
      <view class="editor-sheet cook-illo-card px-26rpx pb-34rpx pt-26rpx" @click.stop>
        <view class="sheet-heading">
          <text class="text-31rpx font-900">
            今天有情况
          </text>
          <text class="sheet-close cook-pressable" @click="redrawVisible = false">
            ×
          </text>
        </view>
        <text class="mt-8rpx block text-21rpx text-[var(--cook-text-muted)]">
          选择原因后会保留原结果，并从剩余成员中重新抽取。
        </text>
        <view class="mt-22rpx space-y-14rpx">
          <view v-for="reason in redrawReasonOptions" :key="reason.key" class="reason-row cook-pressable" @click="doRedraw(reason.key)">
            {{ reason.label }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.dish-duty-page { overflow-x: hidden; }
.dish-duty-page.is-opening-new-meal { pointer-events: none; }
.dish-duty-hero { background: linear-gradient(135deg, #fffef9 0%, #eaf4ff 58%, #f0ffd9 100%); }
.hero-bubble { position: absolute; border: 4rpx solid var(--cook-ink); border-radius: 999rpx; background: rgba(255,255,255,.72); }
.hero-bubble-one { right: 176rpx; top: 28rpx; width: 32rpx; height: 32rpx; }
.hero-bubble-two { right: 144rpx; top: 70rpx; width: 18rpx; height: 18rpx; }
.secondary-button { border: 4rpx solid var(--cook-ink); border-radius: 18rpx; background: var(--cook-blue-soft); box-shadow: var(--cook-shadow-pop-sm); }
.participant-cell { min-height: 205rpx; border-radius: 24rpx; padding: 12rpx 5rpx; }
.add-participant { display: flex; min-height: 190rpx; align-items: center; flex-direction: column; justify-content: center; border: 4rpx dashed var(--cook-ink); border-radius: 24rpx; background: rgba(255,254,249,.72); }
.add-circle { display: flex; width: 76rpx; height: 76rpx; align-items: center; justify-content: center; border: 4rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-primary); box-shadow: 4rpx 5rpx 0 var(--cook-ink); font-size: 42rpx; font-weight: 900; }
.rule-card { background: var(--cook-paper); }
.rule-icon { display: flex; width: 48rpx; height: 48rpx; align-items: center; justify-content: center; border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-yellow); font-size: 22rpx; font-weight: 900; }
.draw-button.is-disabled { opacity: .42; }
.result-card { background: linear-gradient(180deg, #fffef9 0%, #fff8d9 100%); animation: result-card-land .45s cubic-bezier(.2, 1.1, .4, 1) both; }
.result-card.is-completing { animation: complete-bounce .8s ease; }
.completed-stamp { display: inline-block; border: 5rpx solid var(--cook-ink); border-radius: 16rpx; background: var(--cook-primary); padding: 12rpx 20rpx; color: var(--cook-ink); font-size: 25rpx; font-weight: 900; box-shadow: 4rpx 5rpx 0 var(--cook-ink); transform: rotate(-2deg); }
.another-meal-button { border: 4rpx solid var(--cook-ink); border-radius: 18rpx; background: var(--cook-blue-soft); box-shadow: var(--cook-shadow-pop-sm); color: var(--cook-ink); }
.save-demo-pill { border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-primary-soft); padding: 7rpx 13rpx; font-size: 19rpx; font-weight: 900; box-shadow: 3rpx 4rpx 0 var(--cook-ink); }
.member-manage-card { display: flex; min-height: 188rpx; align-items: center; flex-direction: column; background: var(--cook-paper); }
.member-mini-action { border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-blue-soft); padding: 5rpx 10rpx; font-size: 18rpx; font-weight: 900; }
.member-mini-action.is-danger { background: var(--cook-danger-soft); }
.add-member-row { border: 4rpx dashed var(--cook-ink); border-radius: 20rpx; background: rgba(255,254,249,.78); font-size: 24rpx; font-weight: 900; }
.archived-pill { border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-paper); padding: 8rpx 14rpx; font-size: 20rpx; font-weight: 900; box-shadow: 3rpx 4rpx 0 var(--cook-ink); }
.archived-member-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; border: 3rpx dashed var(--cook-ink); border-radius: 18rpx; background: rgba(255,254,249,.78); padding: 12rpx 14rpx; }
.archived-member-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 22rpx; font-weight: 900; }
.member-mini-action.is-purge { background: var(--cook-danger-soft); color: var(--cook-danger); }
.history-card { background: var(--cook-paper); }
.history-winner { border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-yellow); padding: 5rpx 13rpx; font-size: 21rpx; font-weight: 900; }
.history-delete-action { border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-danger-soft); padding: 5rpx 11rpx; color: var(--cook-danger); font-size: 19rpx; font-weight: 900; }
.data-note { background: rgba(255,254,249,.92); }
.sheet-mask { position: fixed; inset: 0; z-index: 120; display: flex; align-items: flex-end; justify-content: center; background: rgba(47,47,45,.42); padding: 24rpx; }
.editor-sheet { box-sizing: border-box; width: 100%; max-height: 86vh; overflow-y: auto; background: var(--cook-paper); }
.sheet-heading { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.sheet-close { display: flex; width: 52rpx; height: 52rpx; align-items: center; justify-content: center; border: 3rpx solid var(--cook-ink); border-radius: 999rpx; background: var(--cook-yellow); box-shadow: 3rpx 4rpx 0 var(--cook-ink); color: var(--cook-ink); font-size: 36rpx; font-weight: 900; line-height: 1; }
.confirm-card { width: 100%; margin-bottom: 28vh; background: var(--cook-paper); }
.delete-button { border: 4rpx solid var(--cook-ink); border-radius: 18rpx; background: var(--cook-danger-soft); box-shadow: 4rpx 5rpx 0 var(--cook-ink); color: var(--cook-ink); }
.purge-button { background: var(--cook-danger); color: #fff; }
.form-input { border: 4rpx solid var(--cook-ink); border-radius: 18rpx; background: #fff; padding: 17rpx 19rpx; box-shadow: 4rpx 5rpx 0 var(--cook-ink); }
.form-input input { font-size: 26rpx; }
.form-label { display: block; margin-bottom: 12rpx; margin-top: 24rpx; color: var(--cook-text); font-size: 23rpx; font-weight: 900; }
.role-scroll { width: 100%; white-space: nowrap; }
.role-option { display: inline-flex; width: 116rpx; flex-shrink: 0; align-items: center; flex-direction: column; border: 4rpx solid transparent; border-radius: 22rpx; background: var(--cook-surface-2); padding: 8rpx; }
.role-option.is-active { border-color: var(--cook-ink); background: var(--cook-yellow-soft); box-shadow: 3rpx 4rpx 0 var(--cook-ink); }
.role-option image { width: 86rpx; height: 86rpx; }
.role-option text { font-size: 19rpx; font-weight: 900; }
.tone-option { box-sizing: border-box; width: 54rpx; height: 54rpx; border: 4rpx solid var(--cook-ink); border-radius: 999rpx; }
.tone-option.is-active { box-shadow: 0 0 0 5rpx var(--cook-paper), 0 0 0 9rpx var(--cook-ink); }
.reason-row { border: 4rpx solid var(--cook-ink); border-radius: 18rpx; background: var(--cook-paper); padding: 17rpx 20rpx; font-size: 25rpx; font-weight: 900; box-shadow: 4rpx 5rpx 0 var(--cook-ink); }
@keyframes complete-bounce { 0% { transform: scale(1); } 45% { transform: scale(.96) rotate(-1deg); } 72% { transform: scale(1.03) rotate(1deg); } 100% { transform: scale(1); } }
@keyframes result-card-land { 0% { opacity: 0; transform: translateY(24rpx) scale(.97); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
</style>
