/**
 * 整改进度计算 —— 三扇区公式测试（30/30/40）
 */
import { describe, it, expect } from 'vitest'
import { calcProgress, canSubmitAcceptance, PROGRESS_WEIGHTS } from '../progress'

describe('calcProgress — 三扇区进度', () => {
  it('全空 → 0', () => {
    expect(calcProgress({})).toBe(0)
  })
  it('仅措施 → 30', () => {
    expect(calcProgress({ measures: '已完成管道更换' })).toBe(PROGRESS_WEIGHTS.measures)
  })
  it('仅成效 → 30', () => {
    expect(calcProgress({ effect: '排放达标' })).toBe(PROGRESS_WEIGHTS.effect)
  })
  it('仅附件 → 40', () => {
    expect(calcProgress({ attachments: [{ name: 'photo.jpg' }] })).toBe(
      PROGRESS_WEIGHTS.attachments,
    )
  })
  it('措施 + 成效 → 60', () => {
    expect(calcProgress({ measures: '管道更换', effect: '排放达标' })).toBe(60)
  })
  it('措施 + 附件 → 70', () => {
    expect(calcProgress({ measures: '管道更换', attachments: [{}] })).toBe(70)
  })
  it('全部三项 → 100', () => {
    expect(calcProgress({ measures: '管道更换', effect: '排放达标', attachments: [{}] })).toBe(100)
  })
  it('空字符串措施不计分', () => {
    expect(calcProgress({ measures: '   ' })).toBe(0)
  })
  it('空附件数组不计分', () => {
    expect(calcProgress({ attachments: [] })).toBe(0)
  })
})

describe('canSubmitAcceptance — 可否提交验收', () => {
  it('进度 0 → 不可', () => {
    expect(canSubmitAcceptance({})).toBe(false)
  })
  it('进度 30 → 不可', () => {
    expect(canSubmitAcceptance({ measures: '措施' })).toBe(false)
  })
  it('进度 60 → 不可', () => {
    expect(canSubmitAcceptance({ measures: '措施', effect: '成效' })).toBe(false)
  })
  it('进度 100 → 可', () => {
    expect(canSubmitAcceptance({ measures: '措施', effect: '成效', attachments: [{}] })).toBe(true)
  })
})
