/**
 * useECharts —— ECharts 按需引入封装（BD-03）
 *
 * 仅注册用到的图表：散点/饼图/柱状/折线 + 网格/提示/图例 + Canvas 渲染器
 * 处理：容器初始化、自适应 resize、组件卸载销毁
 *
 * @example
 * const { chartRef, setOption } = useECharts()
 * onMounted(() => setOption({ ... }))
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { ScatterChart, PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

// 按需注册（BD-03：仅打包用到的模块）
echarts.use([
  ScatterChart,
  PieChart,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  CanvasRenderer,
])

export function useECharts() {
  const chartRef = ref<HTMLDivElement>()
  let chart: echarts.ECharts | null = null
  let resizeObserver: ResizeObserver | null = null

  /** 渲染/更新图表配置 */
  function setOption(option: EChartsCoreOption): void {
    if (!chartRef.value) return
    if (!chart) {
      chart = echarts.init(chartRef.value)
      // 容器尺寸变化自适应
      resizeObserver = new ResizeObserver(() => chart?.resize())
      resizeObserver.observe(chartRef.value)
    }
    chart.setOption(option)
  }

  /** 手动触发 resize（父容器显示延迟时兜底） */
  function resize(): void {
    chart?.resize()
  }

  onMounted(() => {
    // 延迟一帧，确保容器有宽高
    requestAnimationFrame(() => chart?.resize())
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    chart?.dispose()
    chart = null
  })

  return { chartRef, setOption, resize }
}

export { echarts }
