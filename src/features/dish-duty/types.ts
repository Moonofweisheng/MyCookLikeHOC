export const DISH_DUTY_STORAGE_VERSION = 1
export const DISH_DUTY_STORAGE_KEY = 'dish-duty'

export const BUDDY_ROLES = ['egg', 'tomato', 'rice', 'fish', 'mushroom', 'broccoli', 'chili', 'bread'] as const
export type BuddyRole = typeof BUDDY_ROLES[number]

export const BUDDY_TONES = ['green', 'yellow', 'blue', 'red', 'purple', 'orange'] as const
export type BuddyTone = typeof BUDDY_TONES[number]

export type ParticipantStatus = 'participating' | 'resting' | 'absent'
export type DrawMode = 'fair-history' | 'equal-random'
export type MealStage = 'editing' | 'committing' | 'shuffling' | 'sealed' | 'revealing' | 'revealed' | 'completed'
export type RedrawReason = 'not-here' | 'other-task' | 'unwell'

export interface DishDutyMember {
  id: string
  nickname: string
  role: BuddyRole
  tone: BuddyTone
  createdAt: string
  archivedAt: string | null
}

export interface MealParticipant {
  participantId: string
  memberId: string | null
  nickname: string
  role: BuddyRole
  tone: BuddyTone
  status: ParticipantStatus
  temporary: boolean
}

export interface RuleExplanation {
  key: 'equal-random' | 'least-completions' | 'all-tied' | 'temporary-random'
  windowDays: number
  selectedCompletionCount: number | null
}

export interface DrawAttempt {
  id: string
  mode: DrawMode
  candidateParticipantIds: string[]
  selectedParticipantId: string
  explanation: RuleExplanation
  createdAt: string
  excludedParticipantId: string | null
  redrawReason: RedrawReason | null
}

export interface DishDutyMeal {
  id: string
  dateKey: string
  participants: MealParticipant[]
  drawAttempts: DrawAttempt[]
  stage: MealStage
  createdAt: string
  revealedAt: string | null
  completedAt: string | null
}

export interface DishDutyDraft {
  dateKey: string
  participants: MealParticipant[]
  isDemo: boolean
}

export interface DishDutyState {
  version: number
  members: DishDutyMember[]
  meals: DishDutyMeal[]
  draft: DishDutyDraft | null
  reducedMotion: boolean
  reducedMotionInitialized: boolean
}

export interface DrawResult {
  mode: DrawMode
  candidateParticipantIds: string[]
  selectedParticipantId: string
  explanation: RuleExplanation
}

export interface ActionResult<T = undefined> {
  ok: boolean
  data?: T
  error?: string
}

export function createEmptyDishDutyState(): DishDutyState {
  return {
    version: DISH_DUTY_STORAGE_VERSION,
    members: [],
    meals: [],
    draft: null,
    reducedMotion: false,
    reducedMotionInitialized: false,
  }
}
