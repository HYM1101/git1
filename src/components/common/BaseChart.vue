<template>
  <div ref="chartRef" class="base-chart" :style="{ height }" />
</template>

<script setup lang="ts">
/**
 * ECharts 按需封装（BD-03）
 * 仅注册用到的图表/组件，避免全量 echarts 打包
 * @props option ECharts option
 * @props height 容器高度（默认 320px）
 * @props autoresize 窗口变化自适应（默认 true）
 */
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart, MapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GeoComponent,
  VisualMapComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECharts, EChartsCoreOption } from 'echarts/core'

// 按需注册（BD-03：仅 bar/line/pie/scatter/map + 用到的组件）
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  MapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GeoComponent,
  VisualMapComponent,
  TitleComponent,
  DataZoomComponent,
  CanvasRenderer,
])

const props = withDefaults(
  defineProps<{
    option: EChartsCoreOption
    height?: string
    autoresize?: boolean
  }>(),
  { height: '320px', autoresize: true },
)

const chartRef = ref<HTMLDivElement>()
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let renderFrame = 0
let resizeFrame = 0

function render(): void {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  chart.setOption(props.option, true)
}

function handleResize(): void {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => chart?.resize())
}

function scheduleRender(): void {
  cancelAnimationFrame(renderFrame)
  renderFrame = requestAnimationFrame(render)
}

onMounted(async () => {
  await nextTick()
  render()
  if (props.autoresize) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartRef.value!)
  }
})

watch(() => props.option, scheduleRender, { deep: true })

onBeforeUnmount(() => {
  cancelAnimationFrame(renderFrame)
  cancelAnimationFrame(resizeFrame)
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})

defineExpose({ getInstance: () => chart })
</script>

<style scoped lang="scss">
.base-chart {
  width: 100%;
}
</style>
