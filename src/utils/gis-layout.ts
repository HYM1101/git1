export interface MapPixel {
  x: number
  y: number
}

export interface MapSize {
  width: number
  height: number
}

export interface CardPosition {
  left: number
  top: number
}

const CARD_WIDTH = 396
const CARD_HEIGHT = 358
const LEFT_SAFE_AREA = 72
const RIGHT_SAFE_AREA = 210
const TOP_SAFE_AREA = 142
const BOTTOM_SAFE_AREA = 72

/** 计算问题卡片位置，避开缩放控件、顶部浮层、右侧图例和底部统计栏。 */
export function calculateProblemCardPosition(point: MapPixel, container: MapSize): CardPosition {
  const rightCandidate = point.x + 18
  const leftCandidate = point.x - CARD_WIDTH - 18
  const maxLeft = Math.max(LEFT_SAFE_AREA, container.width - CARD_WIDTH - RIGHT_SAFE_AREA)
  const preferredLeft = rightCandidate <= maxLeft ? rightCandidate : leftCandidate
  return {
    left: Math.max(LEFT_SAFE_AREA, Math.min(preferredLeft, maxLeft)),
    top: Math.max(
      TOP_SAFE_AREA,
      Math.min(point.y - 72, container.height - CARD_HEIGHT - BOTTOM_SAFE_AREA),
    ),
  }
}
