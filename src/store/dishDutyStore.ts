import { defineStore } from 'pinia'
import { buddyRoleOptions, buddyToneOptions } from '@/features/dish-duty/catalog'
import { getLocalDateKey } from '@/features/dish-duty/date'
import { calculateDishDutyDraw } from '@/features/dish-duty/draw'
import {
  BUDDY_ROLES,
  BUDDY_TONES,
  DISH_DUTY_STORAGE_KEY,
  DISH_DUTY_STORAGE_VERSION,
  createEmptyDishDutyState,
  type ActionResult,
  type BuddyRole,
  type BuddyTone,
  type DishDutyDraft,
  type DishDutyMeal,
  type DishDutyMember,
  type DishDutyState,
  type DrawAttempt,
  type MealParticipant,
  type ParticipantStatus,
  type RedrawReason,
} from '@/features/dish-duty/types'

function uniqueId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isRole(value: unknown): value is BuddyRole {
  return typeof value === 'string' && (BUDDY_ROLES as readonly string[]).includes(value)
}

function isTone(value: unknown): value is BuddyTone {
  return typeof value === 'string' && (BUDDY_TONES as readonly string[]).includes(value)
}

function cleanParticipant(value: unknown): MealParticipant | null {
  if (!isRecord(value) || typeof value.participantId !== 'string' || typeof value.nickname !== 'string') {
    return null
  }
  const status: ParticipantStatus = value.status === 'resting' || value.status === 'absent' ? value.status : 'participating'
  return {
    participantId: value.participantId,
    memberId: typeof value.memberId === 'string' ? value.memberId : null,
    nickname: value.nickname.slice(0, 12),
    role: isRole(value.role) ? value.role : 'egg',
    tone: isTone(value.tone) ? value.tone : 'green',
    status,
    temporary: Boolean(value.temporary),
  }
}

export function sanitizeDishDutyState(value: unknown): DishDutyState {
  const empty = createEmptyDishDutyState()
  if (!isRecord(value) || value.version !== DISH_DUTY_STORAGE_VERSION) {
    return empty
  }

  const members: DishDutyMember[] = Array.isArray(value.members)
    ? value.members.flatMap((item) => {
        if (!isRecord(item) || typeof item.id !== 'string' || typeof item.nickname !== 'string') {
          return []
        }
        return [{
          id: item.id,
          nickname: item.nickname.slice(0, 12),
          role: isRole(item.role) ? item.role : 'egg',
          tone: isTone(item.tone) ? item.tone : 'green',
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date(0).toISOString(),
          archivedAt: typeof item.archivedAt === 'string' ? item.archivedAt : null,
        }]
      })
    : []

  const meals: DishDutyMeal[] = Array.isArray(value.meals)
    ? value.meals.flatMap((item) => {
        if (!isRecord(item) || typeof item.id !== 'string' || typeof item.dateKey !== 'string' || !Array.isArray(item.participants)) {
          return []
        }
        const participants = item.participants.map(cleanParticipant).filter((participant): participant is MealParticipant => Boolean(participant))
        const attempts: DrawAttempt[] = Array.isArray(item.drawAttempts)
          ? item.drawAttempts.flatMap((attempt) => {
              if (!isRecord(attempt) || typeof attempt.id !== 'string' || typeof attempt.selectedParticipantId !== 'string' || !Array.isArray(attempt.candidateParticipantIds)) {
                return []
              }
              const explanationRecord = isRecord(attempt.explanation) ? attempt.explanation : null
              const explanation = explanationRecord?.key === 'equal-random'
                ? { key: 'equal-random' as const, windowDays: 0, selectedCompletionCount: null }
                : explanationRecord?.key === 'temporary-random'
                  ? { key: 'temporary-random' as const, windowDays: 7, selectedCompletionCount: null }
                  : {
                      key: explanationRecord?.key === 'least-completions' ? 'least-completions' as const : 'all-tied' as const,
                      windowDays: 7,
                      selectedCompletionCount: typeof explanationRecord?.selectedCompletionCount === 'number' ? explanationRecord.selectedCompletionCount : 0,
                    }
              return [{
                id: attempt.id,
                mode: attempt.mode === 'equal-random' ? 'equal-random' : 'fair-history',
                candidateParticipantIds: attempt.candidateParticipantIds.filter((id): id is string => typeof id === 'string'),
                selectedParticipantId: attempt.selectedParticipantId,
                explanation,
                createdAt: typeof attempt.createdAt === 'string' ? attempt.createdAt : new Date(0).toISOString(),
                excludedParticipantId: typeof attempt.excludedParticipantId === 'string' ? attempt.excludedParticipantId : null,
                redrawReason: attempt.redrawReason === 'not-here' || attempt.redrawReason === 'other-task' || attempt.redrawReason === 'unwell' ? attempt.redrawReason : null,
              }]
            })
          : []
        const validStages = ['editing', 'committing', 'shuffling', 'sealed', 'revealing', 'revealed', 'completed']
        return [{
          id: item.id,
          dateKey: item.dateKey,
          participants,
          drawAttempts: attempts,
          stage: validStages.includes(String(item.stage)) ? item.stage as DishDutyMeal['stage'] : 'editing',
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date(0).toISOString(),
          revealedAt: typeof item.revealedAt === 'string' ? item.revealedAt : null,
          completedAt: typeof item.completedAt === 'string' ? item.completedAt : null,
        }]
      })
    : []

  const draft = isRecord(value.draft) && typeof value.draft.dateKey === 'string' && Array.isArray(value.draft.participants)
    ? {
        dateKey: value.draft.dateKey,
        participants: value.draft.participants.map(cleanParticipant).filter((participant): participant is MealParticipant => Boolean(participant)),
        isDemo: Boolean(value.draft.isDemo),
      }
    : null

  return {
    version: DISH_DUTY_STORAGE_VERSION,
    members,
    meals,
    draft,
    reducedMotion: Boolean(value.reducedMotion),
    reducedMotionInitialized: Boolean(value.reducedMotionInitialized),
  }
}

function loadInitialState() {
  try {
    return sanitizeDishDutyState(uni.getStorageSync(DISH_DUTY_STORAGE_KEY))
  }
  catch {
    return createEmptyDishDutyState()
  }
}

function cloneState(state: DishDutyState): DishDutyState {
  return JSON.parse(JSON.stringify(state)) as DishDutyState
}

function memberToParticipant(member: DishDutyMember, status: ParticipantStatus = 'participating'): MealParticipant {
  return {
    participantId: `member:${member.id}`,
    memberId: member.id,
    nickname: member.nickname,
    role: member.role,
    tone: member.tone,
    status,
    temporary: false,
  }
}

function sortMealsNewest(meals: DishDutyMeal[]) {
  return meals
    .map((meal, index) => ({ meal, index }))
    .sort((a, b) => b.meal.createdAt.localeCompare(a.meal.createdAt) || b.index - a.index)
    .map(item => item.meal)
}

export const useDishDutyStore = defineStore('dish-duty', {
  state: (): DishDutyState => loadInitialState(),

  getters: {
    activeMembers: state => state.members.filter(member => !member.archivedAt),
    archivedMembers: state => state.members.filter(member => Boolean(member.archivedAt)),
    todayMeal: state => sortMealsNewest(state.meals.filter(meal => meal.dateKey === getLocalDateKey()))[0] || null,
    currentMeal(): DishDutyMeal | null {
      if (this.draft?.dateKey === getLocalDateKey()) return null
      const todayMeals = sortMealsNewest(this.meals.filter(meal => meal.dateKey === getLocalDateKey()))
      return todayMeals.find(meal => meal.stage !== 'completed') || todayMeals[0] || null
    },
    currentAttempt(): DrawAttempt | null {
      return this.currentMeal?.drawAttempts[this.currentMeal.drawAttempts.length - 1] || null
    },
    currentWinner(): MealParticipant | null {
      return this.currentMeal?.participants.find(participant => participant.participantId === this.currentAttempt?.selectedParticipantId) || null
    },
    recentMeals: state => sortMealsNewest(state.meals).slice(0, 30),
    homeStatus(): 'empty' | 'ready' | 'revealed' | 'completed' {
      if (this.draft?.dateKey === getLocalDateKey()) return 'ready'
      if (this.currentMeal?.stage === 'completed') return 'completed'
      if (this.currentMeal?.drawAttempts.length) return 'revealed'
      if (this.activeMembers.length === 0) return 'empty'
      return 'ready'
    },
  },

  actions: {
    persist(nextState?: DishDutyState): ActionResult {
      try {
        uni.setStorageSync(DISH_DUTY_STORAGE_KEY, cloneState(nextState || this.$state))
        return { ok: true }
      }
      catch {
        return { ok: false, error: '本地保存失败，请检查设备存储后重试' }
      }
    },

    replaceAndPersist(nextState: DishDutyState): ActionResult {
      const result = this.persist(nextState)
      if (result.ok) this.$state = nextState
      return result
    },

    validateNickname(nickname: string, excludingMemberId?: string): ActionResult<string> {
      const normalized = nickname.trim()
      if (!normalized) return { ok: false, error: '请先给饭搭子起个名字' }
      if ([...normalized].length > 6) return { ok: false, error: '昵称最多 6 个字' }
      if (this.members.some(member => member.id !== excludingMemberId && !member.archivedAt && member.nickname === normalized)) {
        return { ok: false, error: '已有同名饭搭子，请换一个名字' }
      }
      return { ok: true, data: normalized }
    },

    addMember(nickname: string, role?: BuddyRole, tone?: BuddyTone): ActionResult<DishDutyMember> {
      const validation = this.validateNickname(nickname)
      if (!validation.ok || !validation.data) return { ok: false, error: validation.error }
      const activeRoles = new Set(this.activeMembers.map(member => member.role))
      const activeTones = new Set(this.activeMembers.map(member => member.tone))
      const member: DishDutyMember = {
        id: uniqueId('buddy'),
        nickname: validation.data,
        role: role || buddyRoleOptions.find(option => !activeRoles.has(option.key))?.key || buddyRoleOptions[this.activeMembers.length % buddyRoleOptions.length].key,
        tone: tone || buddyToneOptions.find(option => !activeTones.has(option.key))?.key || buddyToneOptions[this.activeMembers.length % buddyToneOptions.length].key,
        createdAt: new Date().toISOString(),
        archivedAt: null,
      }
      const next = cloneState(this.$state)
      next.members.push(member)
      if (next.draft?.dateKey === getLocalDateKey()) {
        next.draft.participants.push(memberToParticipant(member))
      }
      else {
        next.draft = null
      }
      const result = this.replaceAndPersist(next)
      return result.ok ? { ok: true, data: member } : { ok: false, error: result.error }
    },

    updateMember(memberId: string, patch: { nickname?: string, role?: BuddyRole, tone?: BuddyTone }): ActionResult {
      const member = this.members.find(item => item.id === memberId)
      if (!member) return { ok: false, error: '没有找到这位饭搭子' }
      const validation = patch.nickname === undefined ? { ok: true, data: member.nickname } : this.validateNickname(patch.nickname, memberId)
      if (!validation.ok) return { ok: false, error: validation.error }
      const next = cloneState(this.$state)
      const target = next.members.find(item => item.id === memberId) as DishDutyMember
      target.nickname = validation.data as string
      if (patch.role) target.role = patch.role
      if (patch.tone) target.tone = patch.tone
      next.draft?.participants.forEach((participant) => {
        if (participant.memberId === memberId) {
          participant.nickname = target.nickname
          participant.role = target.role
          participant.tone = target.tone
        }
      })
      return this.replaceAndPersist(next)
    },

    archiveMember(memberId: string): ActionResult {
      const next = cloneState(this.$state)
      const target = next.members.find(item => item.id === memberId)
      if (!target) return { ok: false, error: '没有找到这位饭搭子' }
      target.archivedAt = new Date().toISOString()
      next.draft = null
      return this.replaceAndPersist(next)
    },

    deleteMember(memberId: string): ActionResult {
      return this.archiveMember(memberId)
    },

    purgeMember(memberId: string): ActionResult {
      const target = this.members.find(member => member.id === memberId)
      if (!target) return { ok: false, error: '没有找到这位饭搭子' }
      if (!target.archivedAt) return { ok: false, error: '请先删除这位饭搭子，再进行彻底删除' }

      const next = cloneState(this.$state)
      next.members = next.members.filter(member => member.id !== memberId)
      if (next.draft) {
        next.draft.participants = next.draft.participants.filter(participant => participant.memberId !== memberId)
      }
      return this.replaceAndPersist(next)
    },

    restoreMember(memberId: string): ActionResult {
      const next = cloneState(this.$state)
      const target = next.members.find(item => item.id === memberId)
      if (!target) return { ok: false, error: '没有找到这位饭搭子' }
      target.archivedAt = null
      next.draft = null
      return this.replaceAndPersist(next)
    },

    ensureDraft(): DishDutyDraft {
      const dateKey = getLocalDateKey()
      if (this.draft?.dateKey === dateKey) return this.draft

      const latestMeal = sortMealsNewest(this.meals)[0]
      const previousStatuses = new Map(latestMeal?.participants.filter(item => item.memberId).map(item => [item.memberId as string, item.status]) || [])
      let participatingCount = 0
      const draft: DishDutyDraft = {
        dateKey,
        participants: this.activeMembers.map((member) => {
          const preferredStatus = previousStatuses.get(member.id) || 'participating'
          const status = preferredStatus === 'participating' && participatingCount >= 8 ? 'resting' : preferredStatus
          if (status === 'participating') participatingCount++
          return memberToParticipant(member, status)
        }),
        isDemo: false,
      }
      const next = cloneState(this.$state)
      next.draft = draft
      const result = this.replaceAndPersist(next)
      if (!result.ok) throw new Error(result.error || '本地保存失败，请重试')
      return this.draft as DishDutyDraft
    },

    startNewMeal(): ActionResult<DishDutyDraft> {
      const dateKey = getLocalDateKey()
      if (this.draft?.dateKey === dateKey) return { ok: true, data: this.draft }
      const sourceMeal = this.currentMeal
      if (sourceMeal && sourceMeal.stage !== 'completed') return { ok: false, error: '当前饭局还没完成，不能再开一局' }

      const activeMemberMap = new Map(this.activeMembers.map(member => [member.id, member]))
      const sourceParticipants = sourceMeal?.participants || []
      const copiedMemberIds = new Set<string>()
      let participatingCount = 0
      const participants = sourceParticipants.flatMap((participant) => {
        if (participant.memberId) {
          const member = activeMemberMap.get(participant.memberId)
          if (!member || copiedMemberIds.has(member.id)) return []
          copiedMemberIds.add(member.id)
          const status = participant.status === 'participating' && participatingCount >= 8 ? 'resting' : participant.status
          if (status === 'participating') participatingCount++
          return [memberToParticipant(member, status)]
        }
        return []
      })
      this.activeMembers.forEach((member) => {
        if (copiedMemberIds.has(member.id)) return
        const status: ParticipantStatus = participatingCount >= 8 ? 'resting' : 'participating'
        if (status === 'participating') participatingCount++
        participants.push(memberToParticipant(member, status))
      })

      const draft: DishDutyDraft = { dateKey, participants, isDemo: false }
      const next = cloneState(this.$state)
      next.draft = draft
      const result = this.replaceAndPersist(next)
      return result.ok ? { ok: true, data: this.draft as DishDutyDraft } : { ok: false, error: result.error }
    },

    setParticipantStatus(participantId: string, status: ParticipantStatus): ActionResult {
      const next = cloneState(this.$state)
      if (!next.draft) return { ok: false, error: '当前没有可编辑的饭局' }
      const participant = next.draft.participants.find(item => item.participantId === participantId)
      if (!participant) return { ok: false, error: '没有找到这位参与者' }
      if (status === 'participating' && participant.status !== 'participating' && next.draft.participants.filter(item => item.status === 'participating').length >= 8) {
        return { ok: false, error: '一局最多 8 人参与，请先让一位饭搭子休息' }
      }
      participant.status = status
      return this.replaceAndPersist(next)
    },

    startDraw(random: () => number = Math.random): ActionResult<DishDutyMeal> {
      const existing = sortMealsNewest(this.meals.filter(meal => meal.dateKey === getLocalDateKey() && meal.stage !== 'completed'))[0]
      if (existing) return { ok: true, data: existing }
      try {
        const draft = this.ensureDraft()
        if (draft.participants.filter(item => item.status === 'participating').length > 8) throw new Error('一局最多选择 8 名参与者')
        const result = calculateDishDutyDraw(draft.participants, random)
        const now = new Date().toISOString()
        const attempt: DrawAttempt = {
          id: uniqueId('draw'),
          ...result,
          createdAt: now,
          excludedParticipantId: null,
          redrawReason: null,
        }
        const meal: DishDutyMeal = {
          id: uniqueId('meal'),
          dateKey: draft.dateKey,
          participants: cloneState({ ...createEmptyDishDutyState(), draft }).draft?.participants || [],
          drawAttempts: [attempt],
          stage: 'shuffling',
          createdAt: now,
          revealedAt: null,
          completedAt: null,
        }
        const next = cloneState(this.$state)
        next.meals.push(meal)
        next.draft = null
        const persisted = this.replaceAndPersist(next)
        return persisted.ok ? { ok: true, data: meal } : { ok: false, error: persisted.error }
      }
      catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : '抽签失败，请重试' }
      }
    },

    setMealStage(stage: DishDutyMeal['stage']): ActionResult {
      const mealId = this.currentMeal?.id
      const next = cloneState(this.$state)
      const meal = next.meals.find(item => item.id === mealId)
      if (!meal) return { ok: false, error: '没有找到今天的饭局' }
      meal.stage = stage
      if (stage === 'revealed' && !meal.revealedAt) meal.revealedAt = new Date().toISOString()
      return this.replaceAndPersist(next)
    },

    revealResult(): ActionResult {
      return this.setMealStage('revealed')
    },

    completeMeal(): ActionResult {
      const mealId = this.currentMeal?.id
      const next = cloneState(this.$state)
      const meal = next.meals.find(item => item.id === mealId)
      if (!meal || !meal.drawAttempts.length) return { ok: false, error: '今天还没有抽签结果' }
      if (meal.completedAt) return { ok: true }
      meal.stage = 'completed'
      meal.completedAt = new Date().toISOString()
      if (!meal.revealedAt) meal.revealedAt = meal.completedAt
      return this.replaceAndPersist(next)
    },

    deleteMeal(mealId: string): ActionResult {
      const target = this.meals.find(meal => meal.id === mealId)
      if (!target) return { ok: false, error: '没有找到这条饭局记录' }

      const next = cloneState(this.$state)
      next.meals = next.meals.filter(meal => meal.id !== mealId)
      return this.replaceAndPersist(next)
    },

    redraw(reason: RedrawReason, random: () => number = Math.random): ActionResult<DrawAttempt> {
      const mealId = this.currentMeal?.id
      const next = cloneState(this.$state)
      const meal = next.meals.find(item => item.id === mealId)
      const previous = meal?.drawAttempts[meal.drawAttempts.length - 1]
      if (!meal || !previous) return { ok: false, error: '今天还没有抽签结果' }
      if (meal.completedAt) return { ok: false, error: '已经完成的饭局不能再换签' }
      const remaining = meal.participants.filter(participant => participant.status === 'participating' && participant.participantId !== previous.selectedParticipantId)
      if (remaining.length < 1) return { ok: false, error: '没有其他候选人了，请调整饭局成员' }

      let result
      if (remaining.length === 1) {
        const only = remaining[0]
        result = {
          mode: 'equal-random' as const,
          candidateParticipantIds: [only.participantId],
          selectedParticipantId: only.participantId,
          explanation: { key: 'equal-random' as const, windowDays: 0, selectedCompletionCount: null },
        }
      }
      else {
        result = calculateDishDutyDraw(remaining, random)
      }
      const attempt: DrawAttempt = {
        id: uniqueId('draw'),
        ...result,
        createdAt: new Date().toISOString(),
        excludedParticipantId: previous.selectedParticipantId,
        redrawReason: reason,
      }
      meal.drawAttempts.push(attempt)
      meal.stage = 'shuffling'
      meal.revealedAt = null
      const persisted = this.replaceAndPersist(next)
      return persisted.ok ? { ok: true, data: attempt } : { ok: false, error: persisted.error }
    },

    saveTemporaryAsMember(participantId: string, nickname?: string): ActionResult<DishDutyMember> {
      const participant = this.meals.flatMap(meal => meal.participants).find(item => item.participantId === participantId && item.temporary)
      if (!participant) return { ok: false, error: '没有找到这位饭搭子' }
      return this.addMember(nickname || participant.nickname, participant.role, participant.tone)
    },

    setReducedMotion(value: boolean): ActionResult {
      const next = cloneState(this.$state)
      next.reducedMotion = value
      next.reducedMotionInitialized = true
      return this.replaceAndPersist(next)
    },
  },
})
