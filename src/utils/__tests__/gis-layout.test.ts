import { describe, expect, it } from 'vitest'
import { calculateProblemCardPosition } from '@/utils/gis-layout'

describe('GIS 问题卡片安全区', () => {
  const viewports = [
    { width: 1126, height: 712 },
    { width: 1200, height: 844 },
    { width: 1680, height: 1024 },
  ]

  it.each(viewports)('在 $width×$height 地图内不覆盖固定组件', (viewport) => {
    const points = [
      { x: 0, y: 0 },
      { x: viewport.width / 2, y: viewport.height / 2 },
      { x: viewport.width, y: viewport.height },
    ]
    points.forEach((point) => {
      const position = calculateProblemCardPosition(point, viewport)
      expect(position.left).toBeGreaterThanOrEqual(72)
      expect(position.top).toBeGreaterThanOrEqual(142)
      expect(position.left + 396).toBeLessThanOrEqual(viewport.width - 210)
      expect(position.top + 358).toBeLessThanOrEqual(viewport.height - 72)
    })
  })
})
