import type { DrawResult, MealParticipant } from './types'

export type RandomSource = () => number

function choose<T>(items: T[], random: RandomSource): T {
  const normalized = Math.min(Math.max(random(), 0), 0.999999999)
  return items[Math.floor(normalized * items.length)]
}

export function calculateDishDutyDraw(
  participants: MealParticipant[],
  random: RandomSource = Math.random,
): DrawResult {
  const eligible = participants.filter(participant => participant.status === 'participating')
  if (eligible.length < 2) {
    throw new Error('至少需要两名参与者')
  }

  const selected = choose(eligible, random)
  return {
    mode: 'equal-random',
    candidateParticipantIds: eligible.map(item => item.participantId),
    selectedParticipantId: selected.participantId,
    explanation: {
      key: 'equal-random',
      windowDays: 0,
      selectedCompletionCount: null,
    },
  }
}
