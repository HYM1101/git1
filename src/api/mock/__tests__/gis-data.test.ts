import { describe, expect, it } from 'vitest'
import { REGIONS, REGION_CENTERS } from '@/constants'
import { mockProblems } from '@/api/mock/problemData'

describe('GIS mock 数据空间有效性', () => {
  const regionNames = new Set(REGIONS.map((item) => item.name))

  it('所有问题均归属百色市12县区', () => {
    expect(mockProblems.length).toBeGreaterThan(0)
    mockProblems.forEach((problem) => {
      expect(regionNames.has(problem.regionName)).toBe(true)
      expect(REGIONS.some((item) => item.code === problem.regionCode)).toBe(true)
    })
  })

  it('所有坐标均位于百色市行政范围包络内', () => {
    mockProblems.forEach((problem) => {
      expect(problem.lng).toBeGreaterThanOrEqual(104.450853)
      expect(problem.lng).toBeLessThanOrEqual(107.884294)
      expect(problem.lat).toBeGreaterThanOrEqual(22.855544)
      expect(problem.lat).toBeLessThanOrEqual(25.099322)
    })
  })

  it('每个问题点位位于所属县区展示中心附近', () => {
    mockProblems.forEach((problem) => {
      const center = REGION_CENTERS[problem.regionName]
      const lng = problem.lng
      const lat = problem.lat
      expect(center).toBeDefined()
      expect(lng).toBeTypeOf('number')
      expect(lat).toBeTypeOf('number')
      if (!center || lng === undefined || lat === undefined) return
      expect(Math.abs(lng - center.lng)).toBeLessThan(0.04)
      expect(Math.abs(lat - center.lat)).toBeLessThan(0.04)
    })
  })
})
