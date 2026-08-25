/**
 * 状态机 —— 全生命周期流转测试
 * 合法流转 + 非法流转（抛错/返回 false）
 */
import { describe, it, expect } from 'vitest'
import {
  transition,
  canTransition,
  STATUS_LABELS,
  type ProblemStatus,
  type ProblemAction,
} from '../status'

describe('transition — 合法状态流转', () => {
  it('待交办 → 整改中 (assign)', () => {
    expect(transition('pending', 'assign')).toBe('inProgress')
  })
  it('整改中 → 待验收 (submit)', () => {
    expect(transition('inProgress', 'submit')).toBe('verify')
  })
  it('待验收 → 已销号 (accept)', () => {
    expect(transition('verify', 'accept')).toBe('closed')
  })
  it('待验收 → 已驳回 (reject)', () => {
    expect(transition('verify', 'reject')).toBe('rejected')
  })
  it('已驳回 → 整改中 (rework)', () => {
    expect(transition('rejected', 'rework')).toBe('inProgress')
  })
})

describe('transition — 非法流转应抛错', () => {
  it('待交办 → submit 应抛错', () => {
    expect(() => transition('pending', 'submit')).toThrow()
  })
  it('待交办 → accept 应抛错', () => {
    expect(() => transition('pending', 'accept')).toThrow()
  })
  it('已销号 → assign 应抛错（终态不可流转）', () => {
    expect(() => transition('closed', 'assign')).toThrow()
  })
  it('已销号 → reject 应抛错', () => {
    expect(() => transition('closed', 'reject')).toThrow()
  })
  it('整改中 → accept 应抛错（不能跳过验收）', () => {
    expect(() => transition('inProgress', 'accept')).toThrow()
  })
  it('已驳回 → submit 应抛错（需先 rework 回整改中）', () => {
    expect(() => transition('rejected', 'submit')).toThrow()
  })
})

describe('canTransition — 不抛错版本', () => {
  it('待交办 + assign → true', () => {
    expect(canTransition('pending', 'assign')).toBe(true)
  })
  it('已销号 + 任何操作 → false', () => {
    const actions: ProblemAction[] = ['assign', 'progress', 'submit', 'accept', 'reject', 'rework']
    actions.forEach((action) => {
      expect(canTransition('closed', action)).toBe(false)
    })
  })
  it('整改中 + submit → true', () => {
    expect(canTransition('inProgress', 'submit')).toBe(true)
  })
  it('整改中 + accept → false', () => {
    expect(canTransition('inProgress', 'accept')).toBe(false)
  })
})

describe('STATUS_LABELS — 中文标签', () => {
  it('全部状态都有标签', () => {
    const statuses: ProblemStatus[] = ['pending', 'inProgress', 'verify', 'rejected', 'closed']
    statuses.forEach((s) => {
      expect(STATUS_LABELS[s]).toBeTruthy()
      expect(typeof STATUS_LABELS[s]).toBe('string')
    })
  })
})
