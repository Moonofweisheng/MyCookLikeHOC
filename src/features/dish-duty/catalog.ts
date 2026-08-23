import type { BuddyRole, BuddyTone, RedrawReason } from './types'

export interface BuddyRoleOption {
  key: BuddyRole
  label: string
  src: string
}

export interface BuddyToneOption {
  key: BuddyTone
  label: string
  color: string
}

export const buddyRoleOptions: BuddyRoleOption[] = [
  { key: 'egg', label: '煎蛋仔', src: '/static/dish-duty/characters/buddy-egg.svg' },
  { key: 'tomato', label: '番茄君', src: '/static/dish-duty/characters/buddy-tomato.svg' },
  { key: 'rice', label: '饭团团', src: '/static/dish-duty/characters/buddy-rice.svg' },
  { key: 'fish', label: '小鱼干', src: '/static/dish-duty/characters/buddy-fish.svg' },
  { key: 'mushroom', label: '香菇头', src: '/static/dish-duty/characters/buddy-mushroom.svg' },
  { key: 'broccoli', label: '西兰花', src: '/static/dish-duty/characters/buddy-broccoli.svg' },
  { key: 'chili', label: '辣椒妹', src: '/static/dish-duty/characters/buddy-chili.svg' },
  { key: 'bread', label: '面包君', src: '/static/dish-duty/characters/buddy-bread.svg' },
]

export const buddyToneOptions: BuddyToneOption[] = [
  { key: 'green', label: '青苹果', color: '#83c63f' },
  { key: 'yellow', label: '蛋黄', color: '#ffd95c' },
  { key: 'blue', label: '气泡蓝', color: '#88c9ff' },
  { key: 'red', label: '番茄红', color: '#ef7668' },
  { key: 'purple', label: '葡萄紫', color: '#c5a4f3' },
  { key: 'orange', label: '烤橙', color: '#f2a85c' },
]

export const redrawReasonOptions: Array<{ key: RedrawReason, label: string }> = [
  { key: 'not-here', label: 'TA 今天不在' },
  { key: 'other-task', label: 'TA 已承担其他任务' },
  { key: 'unwell', label: '临时身体不适' },
]

export function getBuddyRoleOption(role: BuddyRole) {
  return buddyRoleOptions.find(option => option.key === role) || buddyRoleOptions[0]
}

export function getBuddyToneOption(tone: BuddyTone) {
  return buddyToneOptions.find(option => option.key === tone) || buddyToneOptions[0]
}
