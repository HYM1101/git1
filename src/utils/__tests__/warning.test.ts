/**
 * 预警等级计算 —— 边界值测试
 * 阈值：到期黄色、30 天橙色、90 天红色
 */
import { describe, it, expect } from 'vitest'
import { calcWarningLevel, calcOverdueDays, calcWarningByDeadline } from '../warning'
import { WARNING_THRESHOLDS } from '../warning'

describe('calcWarningLevel — 超期天数 → 预警等级', () => {
  it('0 天（当天到期）→ yellow', () => {
    expect(calcWarningLevel(0, 'inProgress')).toBe('yellow')
  })
  it('-10 天（剩余 10 天）→ green', () => {
    expect(calcWarningLevel(-10, 'inProgress')).toBe('green')
  })

  // ── 到期边界 ──
  it(`到期前一天 → green`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.yellow - 1, 'inProgress')).toBe('green')
  })
  it(`到期当天 → yellow`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.yellow, 'inProgress')).toBe('yellow')
  })
  it(`超期一天 → yellow`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.yellow + 1, 'inProgress')).toBe('yellow')
  })

  // ── 30 天边界 ──
  it(`超期 29 天 → yellow`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.orange - 1, 'inProgress')).toBe('yellow')
  })
  it(`超期 30 天 → orange`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.orange, 'inProgress')).toBe('orange')
  })
  it(`超期 31 天 → orange`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.orange + 1, 'inProgress')).toBe('orange')
  })

  // ── 90 天边界 ──
  it(`超期 89 天 → orange`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.red - 1, 'inProgress')).toBe('orange')
  })
  it(`超期 90 天 → red`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.red, 'inProgress')).toBe('red')
  })
  it(`超期 91 天 → red`, () => {
    expect(calcWarningLevel(WARNING_THRESHOLDS.red + 1, 'inProgress')).toBe('red')
  })
  it(`365 天 → red（一年超期）`, () => {
    expect(calcWarningLevel(365, 'inProgress')).toBe('red')
  })
})

describe('calcWarningLevel — 已销号固定绿色', () => {
  it('已销号 + 超 365 天 → 仍然 green', () => {
    expect(calcWarningLevel(365, 'closed')).toBe('green')
  })
  it('已销号 + 0 天 → green', () => {
    expect(calcWarningLevel(0, 'closed')).toBe('green')
  })
})

describe('calcWarningLevel — 待交办固定绿色', () => {
  it('待交办尚未形成整改期限，不产生超期预警', () => {
    expect(calcWarningLevel(365, 'pending')).toBe('green')
  })
})

describe('calcOverdueDays — 超期天数计算', () => {
  it('截止日期为今天 → 0', () => {
    const today = '2026-08-24'
    expect(calcOverdueDays('2026-08-24', today)).toBe(0)
  })
  it('截止日期为昨天 → 1', () => {
    const today = '2026-08-24'
    expect(calcOverdueDays('2026-08-23', today)).toBe(1)
  })
  it('截止日期为明天 → -1', () => {
    const today = '2026-08-24'
    expect(calcOverdueDays('2026-08-25', today)).toBe(-1)
  })
  it('截止日期 29 天前 → 29', () => {
    const today = '2026-08-24'
    expect(calcOverdueDays('2026-07-26', today)).toBe(29)
  })
  it('截止日期 30 天前 → 30', () => {
    const today = '2026-08-24'
    expect(calcOverdueDays('2026-07-25', today)).toBe(30)
  })
  it('空截止日期 → 0', () => {
    expect(calcOverdueDays('', '2026-08-24')).toBe(0)
  })
  it('非法日期 → 0', () => {
    expect(calcOverdueDays('invalid', '2026-08-24')).toBe(0)
  })
})

describe('calcWarningByDeadline — 便捷入口', () => {
  it('已销号问题 → green + overdueDays', () => {
    const result = calcWarningByDeadline('2026-01-01', 'closed', '2026-08-24')
    expect(result.level).toBe('green')
    expect(result.overdueDays).toBeGreaterThan(0)
  })
  it('超期 30 天 → orange', () => {
    const result = calcWarningByDeadline('2026-07-25', 'inProgress', '2026-08-24')
    expect(result.level).toBe('orange')
    expect(result.overdueDays).toBe(30)
  })
  it('超期 180 天 → red', () => {
    const result = calcWarningByDeadline('2026-02-25', 'inProgress', '2026-08-24')
    expect(result.level).toBe('red')
  })
})
