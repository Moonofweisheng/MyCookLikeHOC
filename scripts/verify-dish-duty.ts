import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { addLocalDays, getLocalDateKey, isDateInPreviousWindow, isDateInWindowIncludingReference } from '../src/features/dish-duty/date'
import { calculateDishDutyDraw } from '../src/features/dish-duty/draw'
import {
  DISH_DUTY_REVEAL_THRESHOLD,
  getMotionTemplateKey,
  getParticipantMotionPath,
  hasReachedRevealThreshold,
  interpolateMotionPoints,
  normalizeMotionPoint,
} from '../src/features/dish-duty/motion'
import { createEmptyDishDutyState, type DishDutyMeal, type MealParticipant } from '../src/features/dish-duty/types'
import { sanitizeDishDutyState, useDishDutyStore } from '../src/store/dishDutyStore'

let storage: Record<string, unknown> = {}
let shouldFailStorage = false

Object.assign(globalThis, {
  uni: {
    getStorageSync(key: string) {
      return storage[key]
    },
    setStorageSync(key: string, value: unknown) {
      if (shouldFailStorage) throw new Error('storage full')
      storage[key] = value
    },
  },
})

function participant(id: string, memberId: string | null = id): MealParticipant {
  return {
    participantId: id,
    memberId,
    nickname: id,
    role: 'egg',
    tone: 'green',
    status: 'participating',
    temporary: memberId === null,
  }
}

function completedMeal(dateKey: string, winner: MealParticipant, suffix = 'one', createdAt = `${dateKey}T12:00:00.000Z`): DishDutyMeal {
  return {
    id: `meal-${dateKey}-${winner.participantId}-${suffix}`,
    dateKey,
    participants: [winner],
    drawAttempts: [{
      id: 'attempt',
      mode: 'fair-history',
      candidateParticipantIds: [winner.participantId],
      selectedParticipantId: winner.participantId,
      explanation: { key: 'least-completions', windowDays: 7, selectedCompletionCount: 0 },
      createdAt,
      excludedParticipantId: null,
      redrawReason: null,
    }],
    stage: 'completed',
    createdAt,
    revealedAt: createdAt,
    completedAt: createdAt,
  }
}

function pendingMeal(dateKey: string, winner: MealParticipant, suffix: string, createdAt: string): DishDutyMeal {
  const meal = completedMeal(dateKey, winner, suffix, createdAt)
  meal.stage = 'revealed'
  meal.completedAt = null
  return meal
}

function verifyDates() {
  const date = new Date(2026, 7, 19, 23, 59)
  assert.equal(getLocalDateKey(date), '2026-08-19')
  assert.equal(addLocalDays('2026-08-19', 1), '2026-08-20')
  assert.equal(isDateInPreviousWindow('2026-08-12', '2026-08-19'), true)
  assert.equal(isDateInPreviousWindow('2026-08-11', '2026-08-19'), false)
  assert.equal(isDateInPreviousWindow('2026-08-19', '2026-08-19'), false)
  assert.equal(isDateInWindowIncludingReference('2026-08-19', '2026-08-19'), true)
  assert.equal(isDateInWindowIncludingReference('2026-08-13', '2026-08-19'), true)
  assert.equal(isDateInWindowIncludingReference('2026-08-12', '2026-08-19'), false)
}

function verifyMotionModel() {
  assert.equal(getMotionTemplateKey(2), 'duo')
  assert.equal(getMotionTemplateKey(3), 'trio')
  assert.equal(getMotionTemplateKey(4), 'quad')
  assert.equal(getMotionTemplateKey(8), 'crowd')

  for (const total of [2, 3, 4, 5, 8]) {
    const paths = Array.from({ length: total }, (_, index) => getParticipantMotionPath(index, total))
    assert.equal(paths.length, total)
    paths.forEach((path) => {
      assert.notDeepEqual(path.start, path.swap)
      assert.notDeepEqual(path.swap, path.gather)
      assert.notDeepEqual(path.gather, path.exit)
    })
    const startPositions = new Set(paths.map(path => `${path.start.x},${path.start.y}`))
    const swapPositions = new Set(paths.map(path => `${path.swap.x},${path.swap.y}`))
    assert.equal(startPositions.size, total)
    assert.equal(swapPositions.size, total)
  }
  const duoFirst = getParticipantMotionPath(0, 2)
  const duoSecond = getParticipantMotionPath(1, 2)
  assert.equal(Math.sign(duoFirst.start.x), -Math.sign(duoFirst.swap.x))
  assert.equal(Math.sign(duoSecond.start.x), -Math.sign(duoSecond.swap.x))

  assert.deepEqual(normalizeMotionPoint(150, 100, { left: 100, top: 50, width: 100, height: 100 }), { x: 50, y: 50, inside: true })
  assert.deepEqual(normalizeMotionPoint(80, 180, { left: 100, top: 50, width: 100, height: 100 }), { x: 0, y: 100, inside: false })
  const interpolated = interpolateMotionPoints({ x: 0, y: 0 }, { x: 18, y: 0 }, 6)
  assert.deepEqual(interpolated, [{ x: 6, y: 0 }, { x: 12, y: 0 }, { x: 18, y: 0 }])
  assert.equal(hasReachedRevealThreshold(8, 14, DISH_DUTY_REVEAL_THRESHOLD), false)
  assert.equal(hasReachedRevealThreshold(9, 14, DISH_DUTY_REVEAL_THRESHOLD), true)
  assert.equal(hasReachedRevealThreshold(0, 0, DISH_DUTY_REVEAL_THRESHOLD), false)
  assert.deepEqual(interpolateMotionPoints(null, { x: 4, y: 9 }), [{ x: 4, y: 9 }])
  assert.equal(normalizeMotionPoint(100, 50, { left: 100, top: 50, width: 0, height: 10 }).inside, false)
}

function verifyDrawRules() {
  const a = participant('a')
  const b = participant('b')
  const c = participant('c')
  const history = [completedMeal('2026-08-18', a), completedMeal('2026-08-17', a), completedMeal('2026-08-18', b)]
  const equal = calculateDishDutyDraw([a, b, c], () => 0)
  assert.deepEqual(equal.candidateParticipantIds, ['a', 'b', 'c'])
  assert.equal(equal.selectedParticipantId, 'a')
  assert.equal(equal.explanation.key, 'equal-random')

  const historyIgnored = calculateDishDutyDraw([a, b, c], () => 0.99)
  assert.deepEqual(historyIgnored.candidateParticipantIds, ['a', 'b', 'c'])
  assert.equal(historyIgnored.selectedParticipantId, 'c')
  assert.equal(history.length, 3)

  const guest = participant('guest', null)
  const temporary = calculateDishDutyDraw([a, guest], () => 0.99)
  assert.equal(temporary.mode, 'equal-random')
  assert.equal(temporary.selectedParticipantId, 'guest')
  assert.equal(temporary.explanation.key, 'equal-random')

  assert.throws(() => calculateDishDutyDraw([a], () => 0), /至少需要两名参与者/)
}

function verifyMultipleMealsInOneDay() {
  storage = {}
  setActivePinia(createPinia())
  const store = useDishDutyStore()
  const today = getLocalDateKey()

  const firstMember = store.addMember('早饭搭子', 'egg', 'yellow')
  const secondMember = store.addMember('晚饭搭子', 'tomato', 'red')
  assert.equal(firstMember.ok, true)
  assert.equal(secondMember.ok, true)

  store.ensureDraft()
  const firstDraw = store.startDraw(() => 0)
  assert.equal(firstDraw.ok, true)
  assert.equal(store.revealResult().ok, true)
  assert.equal(store.completeMeal().ok, true)
  const firstMealId = firstDraw.data?.id as string
  const firstWinnerId = store.currentWinner?.memberId
  assert.equal(store.meals.length, 1)

  const firstNewDraft = store.startNewMeal()
  const duplicateNewDraft = store.startNewMeal()
  assert.equal(firstNewDraft.ok, true)
  assert.equal(duplicateNewDraft.ok, true)
  assert.deepEqual(duplicateNewDraft.data, firstNewDraft.data)
  assert.equal(store.meals.length, 1)
  assert.equal(store.draft?.dateKey, today)
  assert.equal(store.draft?.participants.length, 2)

  const secondDraw = store.startDraw(() => 0)
  assert.equal(secondDraw.ok, true)
  assert.notEqual(secondDraw.data?.id, firstMealId)
  assert.equal(store.meals.length, 2)
  assert.equal(store.meals.find(meal => meal.id === firstMealId)?.stage, 'completed')
  assert.equal(store.currentMeal?.id, secondDraw.data?.id)
  assert.equal(store.currentMeal?.completedAt, null)
  assert.equal(secondDraw.data?.drawAttempts[0].mode, 'equal-random')
  assert.equal(secondDraw.data?.drawAttempts[0].candidateParticipantIds.length, 2)
  assert.equal(firstWinnerId !== undefined, true)

  assert.equal(store.revealResult().ok, true)
  assert.equal(store.completeMeal().ok, true)
  assert.equal(store.meals.filter(meal => meal.dateKey === today && meal.completedAt).length, 2)
}

function verifyMealRecoveryAndMidnightBoundary() {
  storage = {}
  setActivePinia(createPinia())
  const store = useDishDutyStore()
  const today = getLocalDateKey()
  const yesterday = addLocalDays(today, -1)
  const a = participant('a')
  const b = participant('b')

  store.meals = [
    completedMeal(today, a, 'completed-latest', `${today}T20:00:00.000Z`),
    pendingMeal(today, a, 'pending-older', `${today}T18:00:00.000Z`),
    pendingMeal(today, b, 'pending-newer', `${today}T19:00:00.000Z`),
  ]
  assert.equal(store.currentMeal?.id, `meal-${today}-b-pending-newer`)
  assert.equal(store.startNewMeal().ok, false)

  store.meals = [pendingMeal(yesterday, a, 'yesterday', `${yesterday}T23:00:00.000Z`)]
  assert.equal(store.currentMeal, null)
  const draft = store.ensureDraft()
  assert.equal(draft.dateKey, today)
  assert.equal(store.meals.length, 1)
  assert.equal(store.meals[0].dateKey, yesterday)
}

function verifyStore() {
  storage = {}
  setActivePinia(createPinia())
  const store = useDishDutyStore()

  const first = store.addMember('小明', 'egg', 'yellow')
  const second = store.addMember('小红', 'tomato', 'red')
  assert.equal(first.ok, true)
  assert.equal(second.ok, true)
  store.ensureDraft()
  const addedDuringSetup = store.addMember('现场搭子', 'rice', 'blue')
  assert.equal(addedDuringSetup.ok, true)
  assert.equal(store.draft?.participants.some(item => item.memberId === addedDuringSetup.data?.id), true)
  assert.equal(store.draft?.participants.find(item => item.memberId === addedDuringSetup.data?.id)?.temporary, false)
  const firstId = first.data?.id as string
  assert.equal(store.updateMember(firstId, { nickname: '明哥' }).ok, true)
  assert.equal(store.members.find(item => item.id === firstId)?.nickname, '明哥')
  assert.equal(store.deleteMember(firstId).ok, true)
  assert.equal(store.activeMembers.some(member => member.id === firstId), false)
  assert.equal(store.archivedMembers.some(member => member.id === firstId), true)
  assert.equal(store.restoreMember(firstId).ok, true)
  assert.equal(store.members.find(item => item.id === firstId)?.id, firstId)

  store.ensureDraft()
  const draw = store.startDraw(() => 0)
  assert.equal(draw.ok, true)
  const drawAgain = store.startDraw(() => 0.99)
  assert.equal(drawAgain.data?.id, draw.data?.id)
  assert.equal(drawAgain.data?.drawAttempts[0].selectedParticipantId, draw.data?.drawAttempts[0].selectedParticipantId)
  assert.equal(store.revealResult().ok, true)
  assert.equal(store.completeMeal().ok, true)
  assert.equal(store.currentMeal?.stage, 'completed')

  const temporaryParticipant = participant('阿宾', null)
  const temporaryMeal = completedMeal('2000-01-03', temporaryParticipant, 'save-test', '2000-01-03T12:00:00.000Z')
  store.$state.meals.push(temporaryMeal)
  assert.equal(store.saveTemporaryAsMember(temporaryParticipant.participantId).ok, true)
  assert.equal(store.activeMembers.some(member => member.nickname === temporaryParticipant.nickname), true)
  assert.equal(store.meals.find(meal => meal.id === temporaryMeal.id)?.participants[0].temporary, true)

  const removableMeal = completedMeal('2000-01-01', participant('removable'), 'delete-test', '2000-01-01T12:00:00.000Z')
  const pendingDeleteMeal = pendingMeal('2000-01-02', participant('pending-delete'), 'delete-pending-test', '2000-01-02T12:00:00.000Z')
  store.$state.meals.push(removableMeal, pendingDeleteMeal)
  assert.equal(store.deleteMeal(removableMeal.id).ok, true)
  assert.equal(store.meals.some(meal => meal.id === removableMeal.id), false)
  assert.equal(store.deleteMeal(pendingDeleteMeal.id).ok, true)
  assert.equal(store.meals.some(meal => meal.id === pendingDeleteMeal.id), false)

  assert.equal(store.purgeMember(second.data?.id as string).ok, false)
  assert.equal(store.deleteMember(firstId).ok, true)
  store.$state.draft = {
    dateKey: getLocalDateKey(),
    participants: [{
      participantId: `member:${firstId}`,
      memberId: firstId,
      nickname: '明哥',
      role: 'egg',
      tone: 'yellow',
      status: 'participating',
      temporary: false,
    }],
    isDemo: false,
  }
  assert.equal(store.purgeMember(firstId).ok, true)
  assert.equal(store.members.some(member => member.id === firstId), false)
  assert.equal(store.draft?.participants.some(participant => participant.memberId === firstId), false)
  assert.equal(store.recentMeals[0]?.participants.some(participant => participant.nickname === '明哥'), true)
  assert.equal(store.purgeMember(firstId).ok, false)

  const sixCharacters = store.addMember('六个字符昵称')
  assert.equal(sixCharacters.ok, true)
  assert.equal(sixCharacters.data?.nickname, '六个字符昵称')
  const sevenCharacters = store.addMember('七个字符昵称超')
  assert.equal(sevenCharacters.ok, false)
  assert.match(sevenCharacters.error || '', /最多 6 个字/)
  const blankNickname = store.addMember('   ')
  assert.equal(blankNickname.ok, false)
  assert.match(blankNickname.error || '', /起个名字/)
  const duplicateNickname = store.addMember('六个字符昵称')
  assert.equal(duplicateNickname.ok, false)
  assert.match(duplicateNickname.error || '', /同名饭搭子/)
  assert.equal(store.updateMember(sixCharacters.data?.id as string, { nickname: '编辑后昵称' }).ok, true)
  assert.equal(store.members.find(member => member.id === sixCharacters.data?.id)?.nickname, '编辑后昵称')

  shouldFailStorage = true
  assert.equal(store.addMember('失败成员').ok, false)
  shouldFailStorage = false

  const cleaned = sanitizeDishDutyState({ version: 999, members: [{ id: 'bad' }] })
  assert.deepEqual(cleaned, createEmptyDishDutyState())

  storage = {}
  setActivePinia(createPinia())
  const redrawStore = useDishDutyStore()
  redrawStore.addMember('甲', 'egg', 'yellow')
  redrawStore.addMember('乙', 'tomato', 'red')
  redrawStore.addMember('丙', 'rice', 'blue')
  redrawStore.ensureDraft()
  assert.equal(redrawStore.startDraw(() => 0).ok, true)
  assert.equal(redrawStore.revealResult().ok, true)
  assert.equal(redrawStore.redraw('other-task', () => 0).ok, true)
  const secondWinner = redrawStore.currentAttempt?.selectedParticipantId
  assert.equal(redrawStore.revealResult().ok, true)
  assert.equal(redrawStore.redraw('unwell', () => 0).ok, true)
  assert.notEqual(redrawStore.currentAttempt?.selectedParticipantId, secondWinner)
  assert.equal(redrawStore.currentAttempt?.candidateParticipantIds.length, 2)

  storage = {}
  setActivePinia(createPinia())
  const capacityStore = useDishDutyStore()
  for (let index = 0; index < 9; index++) capacityStore.addMember(`成员${index}`)
  const capacityDraft = capacityStore.ensureDraft()
  assert.equal(capacityDraft.participants.filter(item => item.status === 'participating').length, 8)
  const ninth = capacityDraft.participants.find(item => item.status !== 'participating') as MealParticipant
  assert.equal(capacityStore.setParticipantStatus(ninth.participantId, 'participating').ok, false)
}

verifyDates()
verifyMotionModel()
verifyDrawRules()
verifyStore()
verifyMultipleMealsInOneDay()
verifyMealRecoveryAndMidnightBoundary()
console.log('Dish duty verification passed')
