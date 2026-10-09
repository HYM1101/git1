<template>
  <AppShell>
    <section class="map-wrap" aria-label="GIS 问题点位地图">
      <div ref="mapElement" class="map-area" />
      <div class="location-badge" aria-label="当前地图范围">
        <span class="location-dot" />
        <strong>广西壮族自治区 · 百色市</strong>
        <template v-if="drilldownArea">
          <span class="location-separator">/</span>
          <strong>{{ drilldownArea }}</strong>
          <template v-if="activeProblemId">
            <span class="location-separator">/</span>
            <strong>问题点位</strong>
          </template>
          <button
            v-if="activeProblemId || !userStore.isResponsible"
            type="button"
            @click="activeProblemId ? returnToArea() : returnToCity()"
          >
            {{ activeProblemId ? `返回${drilldownArea}` : '返回百色市' }}
          </button>
        </template>
      </div>
      <div class="filter-bar">
        <label
          >区域：<select
            v-model="filters.area"
            :disabled="userStore.isResponsible"
            @change="handleAreaChange"
          >
            <option value="">全部区域</option>
            <option v-for="r in REGIONS" :key="r.code" :value="r.name">{{ r.name }}</option>
          </select></label
        >
        <label
          >污染类型：<select v-model="filters.type" @change="renderMarkers">
            <option value="">全部类型</option>
            <option v-for="t in POLLUTION_TYPES" :key="t" :value="t">{{ t }}污染</option>
          </select></label
        >
        <label
          >重要等级：<select v-model="filters.level" @change="renderMarkers">
            <option value="">全部等级</option>
            <option value="red">红色重大</option>
            <option value="orange">橙色较大</option>
            <option value="green">绿色常规</option>
          </select></label
        >
        <label
          >状态：<select v-model="filters.status" @change="renderMarkers">
            <option value="">全部状态</option>
            <option v-if="!userStore.isResponsible" value="pending">待交办</option>
            <option value="inProgress">整改中</option>
            <option value="verify">待验收</option>
            <option value="rejected">已驳回</option>
            <option value="closed">已销号</option>
          </select></label
        >
      </div>
      <article
        v-if="selectedPoint"
        class="problem-card"
        :style="problemCardStyle"
        aria-label="问题详情卡片"
      >
        <header>
          <i :style="{ background: warningSolidColors[selectedPoint.warningLevel] }" />
          <strong>{{ selectedPoint.title }}</strong>
          <button type="button" aria-label="关闭问题卡片" @click="closeProblemCard">×</button>
        </header>
        <div class="problem-card-body">
          <dl>
            <div>
              <dt>所属区域</dt>
              <dd>{{ selectedPoint.area || '百色市' }}</dd>
            </div>
            <div>
              <dt>污染类型</dt>
              <dd>{{ selectedPoint.type || '未分类' }}污染</dd>
            </div>
            <div>
              <dt>固有等级</dt>
              <dd :style="{ color: importantColors[selectedPoint.level] }">
                {{ importantLabels[selectedPoint.level] }}
              </dd>
            </div>
            <div>
              <dt>当前预警</dt>
              <dd :style="{ color: warningSolidColors[selectedPoint.warningLevel] }">
                {{ warningLabels[selectedPoint.warningLevel] }}
              </dd>
            </div>
            <div>
              <dt>时限状态</dt>
              <dd class="time-status">{{ timeStatus(selectedPoint) }}</dd>
            </div>
          </dl>
        </div>
        <footer>
          <span class="status-chip">{{ statusLabels[selectedPoint.status] }}</span>
          <span
            class="level-chip"
            :style="{
              color: importantColors[selectedPoint.level],
              borderColor: `${importantColors[selectedPoint.level]}80`,
              background: `${importantColors[selectedPoint.level]}20`,
            }"
            >{{ importantLabels[selectedPoint.level] }}</span
          >
          <button type="button" @click="openProblemDetail(selectedPoint.id)">查看详情 →</button>
        </footer>
      </article>
      <aside class="legend">
        <strong>图例说明</strong><small>圆点 = 预警等级</small>
        <span><i class="red" />红色三级预警</span>
        <span><i class="orange" />橙色二级预警</span>
        <span><i class="yellow" />黄色一级预警</span>
        <span><i class="green" />正常推进</span>
        <small class="legend-section">三角 = 重要等级</small>
        <span><i class="triangle red-triangle" />红色重大</span>
        <span><i class="triangle orange-triangle" />橙色较大</span>
        <span><i class="triangle green-triangle" />绿色常规</span>
        <span><i class="city-boundary" />百色市界</span>
        <span><i class="district-boundary" />县区边界</span>
      </aside>
      <div class="bottom-bar">
        <div>
          <b class="red-text">{{ stats.red }}</b
          ><span>红色问题</span>
        </div>
        <div>
          <b class="orange-text">{{ stats.orange }}</b
          ><span>橙色问题</span>
        </div>
        <div>
          <b class="green-text">{{ stats.green }}</b
          ><span>绿色问题</span>
        </div>
        <div>
          <b>{{ filtered.length }}</b
          ><span>问题总数</span>
        </div>
        <div>
          <b class="blue-text">{{ stats.rate }}%</b><span>整改完成率</span>
        </div>
      </div>
      <div v-if="loadError" class="map-error">
        <p>{{ loadError }}</p>
        <button type="button" @click="initialize">重新加载</button>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any -- 天地图 4.0 浏览器 SDK 未提供可安装的 TypeScript 类型，仅在 SDK 边界使用 any。 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { gisApi } from '@/api'
import baiseGeoJson from '@/assets/baise.json'
import {
  IMPORTANT_LEVEL_COLORS,
  IMPORTANT_LEVEL_LABELS,
  POLLUTION_TYPES,
  REGIONS,
  REGION_CENTERS,
  WARNING_LEVEL_LABELS,
} from '@/constants'
import AppShell from '@/layouts/AppShell.vue'
import { useUserStore } from '@/stores/user'
import { STATUS_LABELS, type ProblemStatus } from '@/utils/status'
import type { WarningLevel } from '@/utils/warning'
import { calculateProblemCardPosition } from '@/utils/gis-layout'

interface GisPoint {
  id: string
  lng: number
  lat: number
  level: 'red' | 'orange' | 'green'
  warningLevel: WarningLevel
  title: string
  area?: string
  type?: string
  status: ProblemStatus
  deadline?: string
  overdueDays?: number
  progress?: number
}

type Position = [number, number]

interface DistrictFeature {
  properties: { name: string }
  geometry: {
    type: 'MultiPolygon'
    coordinates: Position[][][]
  }
}

interface MapInstance {
  centerAndZoom(point: { lng: number; lat: number }, zoom: number): void
  getZoom(): number
  enableScrollWheelZoom(enabled: boolean): void
  addOverLay(overlay: { addEventListener(event: string, handler: () => void): void }): void
  clearOverLays(): void
  addControl(control: object): void
  addEventListener(event: string, handler: () => void): void
  lngLatToContainerPoint?(point: { lng: number; lat: number }): { x: number; y: number }
  setMapType(type: unknown): void
}
const mapElement = ref<HTMLElement>()
const userStore = useUserStore()
const router = useRouter()
const points = ref<GisPoint[]>([])
const loadError = ref('')
const drilldownArea = ref('')
const selectedPoint = ref<GisPoint | null>(null)
const activeProblemId = ref('')
const cardPosition = reactive({ left: 280, top: 180 })
const filters = reactive({ area: '', type: '', level: '', status: '' })
let map: MapInstance | undefined
let zoomChangeTimer: ReturnType<typeof setTimeout> | undefined

// 由百色行政区 GeoJSON 范围中心计算，确保初始视野定位到百色全域。
const BAISE_VIEW = { lng: 106.1676, lat: 23.9774, zoom: 8 }
const DETAIL_ZOOM = 11
const PROBLEM_ZOOM = 15
const CLUSTER_ZOOM = 10
const importantColors = IMPORTANT_LEVEL_COLORS
const importantLabels = IMPORTANT_LEVEL_LABELS
const warningLabels = WARNING_LEVEL_LABELS
const statusLabels = STATUS_LABELS
const warningSolidColors: Record<WarningLevel, string> = {
  red: '#ef3b3b',
  orange: '#fb8c00',
  yellow: '#eab308',
  green: '#43a047',
}
const problemCardStyle = computed(() => ({
  left: `${cardPosition.left}px`,
  top: `${cardPosition.top}px`,
}))

function normalizeAreaName(area: string): string {
  return area === '隆林各族自治县' ? '隆林县' : area
}

function getAreaCenter(area: string, areaPoints: GisPoint[] = []): { lng: number; lat: number } {
  const calibrated = REGION_CENTERS[normalizeAreaName(area)]
  if (calibrated) return calibrated
  if (areaPoints.length) {
    return {
      lng: areaPoints.reduce((sum, item) => sum + item.lng, 0) / areaPoints.length,
      lat: areaPoints.reduce((sum, item) => sum + item.lat, 0) / areaPoints.length,
    }
  }
  return { lng: BAISE_VIEW.lng, lat: BAISE_VIEW.lat }
}
const filtered = computed(() =>
  points.value.filter(
    (p) =>
      (!filters.area || p.area === filters.area || p.title.includes(filters.area)) &&
      (!filters.type || p.type === filters.type) &&
      (!filters.level || p.level === filters.level) &&
      (!filters.status || p.status === filters.status),
  ),
)
const stats = computed(() => {
  const list = filtered.value
  const count = (level: string) => list.filter((p) => p.level === level).length
  return {
    red: count('red'),
    orange: count('orange'),
    green: count('green'),
    rate: list.length
      ? Math.round((list.filter((p) => p.status === 'closed').length / list.length) * 100)
      : 0,
  }
})

function markerIcon(point: GisPoint): object | undefined {
  const api = (window as any).T as any
  if (!api) return undefined
  const warningColor = warningSolidColors[point.warningLevel]
  const importantColor = importantColors[point.level]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
    <defs><filter id="s" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-opacity=".35"/></filter></defs>
    <g filter="url(#s)"><circle cx="14" cy="22" r="11" fill="${warningColor}" stroke="#fff" stroke-width="2"/>
    <path d="M25 4h11L30.5 14z" fill="${importantColor}" stroke="#fff" stroke-width="1"/></g>
  </svg>`
  return new api.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: new api.Point(38, 38),
  })
}

function svgIcon(svg: string, width: number, height: number): object | undefined {
  const api = (window as any).T as any
  if (!api) return undefined
  return new api.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: new api.Point(width, height),
  })
}

/** 低缩放县区聚合图标：县区名称和问题总数同时呈现。 */
function clusterIcon(area: string, count: number): object | undefined {
  const safeArea = escapeHtml(area)
  const countText = `${count}个问题`
  const width = Math.max(92, area.length * 16 + 48)
  return svgIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="58" viewBox="0 0 ${width} 58">
      <defs><filter id="s" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".28"/></filter></defs>
      <g filter="url(#s)"><rect x="2" y="2" width="${width - 4}" height="48" rx="14" fill="#1a5f2a" stroke="#fff" stroke-width="2"/>
      <path d="M${width / 2 - 7} 49h14l-7 8z" fill="#1a5f2a"/></g>
      <text x="${width / 2}" y="21" fill="#fff" font-size="14" font-family="Microsoft YaHei, sans-serif" font-weight="700" text-anchor="middle">${safeArea}</text>
      <text x="${width / 2}" y="40" fill="#e8f5e9" font-size="12" font-family="Microsoft YaHei, sans-serif" text-anchor="middle">${countText}</text>
    </svg>`,
    width,
    58,
  )
}

/** 高缩放县区名称标签，弥补卫星底图无行政区名称的问题。 */
function regionLabelIcon(area: string): object | undefined {
  const safeArea = escapeHtml(area)
  const width = Math.max(60, area.length * 15 + 20)
  return svgIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28">
      <rect x="1" y="1" width="${width - 2}" height="24" rx="12" fill="#ffffff" fill-opacity=".88" stroke="#1a5f2a" stroke-opacity=".5"/>
      <text x="${width / 2}" y="18" fill="#0d3b1a" font-size="12" font-family="Microsoft YaHei, sans-serif" font-weight="700" text-anchor="middle">${safeArea}</text>
    </svg>`,
    width,
    28,
  )
}

/**
 * 绘制百色市域及 12 县区边界。
 * 第一层使用较粗品牌绿形成市域轮廓，第二层使用白色细线明确县区分界。
 */
function renderAdministrativeBoundaries(): void {
  const api = (window as any).T as any
  if (!map || !api) return
  const features = (baiseGeoJson.features || []) as unknown as DistrictFeature[]

  const addBoundaryLayer = (
    strokeColor: string,
    strokeWeight: number,
    strokeOpacity: number,
    interactive = false,
  ): void => {
    features.forEach((feature) => {
      const area = normalizeAreaName(feature.properties.name)
      const isSelected = drilldownArea.value === area
      feature.geometry.coordinates.forEach((polygon) => {
        const outerRing = polygon[0]
        if (!outerRing?.length) return
        const path = outerRing.map(([lng, lat]) => new api.LngLat(lng, lat))
        const boundary = new api.Polygon(path, {
          color: isSelected && interactive ? '#fdd835' : strokeColor,
          weight: isSelected && interactive ? 4 : strokeWeight,
          opacity: strokeOpacity,
          fillColor: isSelected ? '#fdd835' : '#1a5f2a',
          fillOpacity: isSelected ? 0.14 : 0.035,
          lineStyle: 'solid',
        })
        if (interactive) boundary.addEventListener('click', () => drillToArea(area))
        map?.addOverLay(boundary)
      })
    })
  }

  addBoundaryLayer('#1a5f2a', 5, 0.78)
  addBoundaryLayer('#ffffff', 1.5, 0.9, true)
}

function drillToArea(area: string): void {
  const api = (window as any).T as any
  if (!map || !api) return
  const normalizedArea = normalizeAreaName(area)
  const areaPoints = points.value.filter((item) => item.area === normalizedArea)
  const center = getAreaCenter(normalizedArea, areaPoints)
  activeProblemId.value = ''
  selectedPoint.value = null
  drilldownArea.value = normalizedArea
  filters.area = normalizedArea
  map.centerAndZoom(new api.LngLat(center.lng, center.lat), DETAIL_ZOOM)
  renderMarkers()
}

function returnToCity(): void {
  const api = (window as any).T as any
  if (!map || !api) return
  activeProblemId.value = ''
  selectedPoint.value = null
  drilldownArea.value = ''
  filters.area = ''
  map.centerAndZoom(new api.LngLat(BAISE_VIEW.lng, BAISE_VIEW.lat), BAISE_VIEW.zoom)
  renderMarkers()
}

function returnToArea(): void {
  const api = (window as any).T as any
  if (!map || !api || !drilldownArea.value) return
  activeProblemId.value = ''
  selectedPoint.value = null
  const areaPoints = points.value.filter((item) => item.area === drilldownArea.value)
  const center = getAreaCenter(drilldownArea.value, areaPoints)
  map.centerAndZoom(new api.LngLat(center.lng, center.lat), DETAIL_ZOOM)
  renderMarkers()
}

function handleAreaChange(): void {
  if (filters.area) drillToArea(filters.area)
  else returnToCity()
}

function timeStatus(point: GisPoint): string {
  if (point.status === 'closed') return '已完成'
  if ((point.overdueDays || 0) > 0) return `超期${point.overdueDays}天`
  if (!point.deadline) return '未设置时限'
  const remaining = Math.ceil((new Date(point.deadline).getTime() - Date.now()) / 86_400_000)
  return remaining >= 0 ? `剩余${remaining}天` : `超期${Math.abs(remaining)}天`
}

function showProblemCard(point: GisPoint, lngLat: { lng: number; lat: number }): void {
  selectedPoint.value = point
  const container = mapElement.value
  const pixel = map?.lngLatToContainerPoint?.(lngLat)
  if (!container || !pixel) {
    cardPosition.left = 280
    cardPosition.top = 150
    return
  }
  const position = calculateProblemCardPosition(pixel, {
    width: container.clientWidth,
    height: container.clientHeight,
  })
  cardPosition.left = position.left
  cardPosition.top = position.top
}

function drillToProblem(point: GisPoint): void {
  const api = (window as any).T as any
  if (!map || !api) return
  const area = normalizeAreaName(point.area || '')
  if (area) {
    drilldownArea.value = area
    filters.area = area
  }
  activeProblemId.value = point.id
  selectedPoint.value = point
  const lngLat = new api.LngLat(point.lng, point.lat)
  map.centerAndZoom(lngLat, PROBLEM_ZOOM)
  showProblemCard(point, lngLat)
}

function closeProblemCard(): void {
  activeProblemId.value = ''
  selectedPoint.value = null
}

function openProblemDetail(id: string): void {
  void router.push(`/problem/${encodeURIComponent(id)}`)
}

/** 天地图信息窗接收 HTML 字符串，动态字段必须转义，避免标题或区域注入标签。 */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkers(): void {
  const api = (window as any).T as any
  if (!map || !api) return
  if (!activeProblemId.value) selectedPoint.value = null
  map.clearOverLays()
  renderAdministrativeBoundaries()
  const zoom = map.getZoom()
  if (zoom < CLUSTER_ZOOM && !drilldownArea.value) {
    const groups = new Map<string, GisPoint[]>()
    filtered.value.forEach((item) => {
      const area = item.area || '未标注地区'
      groups.set(area, [...(groups.get(area) || []), item])
    })
    groups.forEach((items, area) => {
      const center = getAreaCenter(area, items)
      const point = new api.LngLat(center.lng, center.lat)
      const cluster = new api.Marker(point, { icon: clusterIcon(area, items.length) })
      cluster.addEventListener('click', () => drillToArea(area))
      map?.addOverLay(cluster)
    })
    return
  }

  const visibleAreas = new Set(filtered.value.map((item) => item.area).filter(Boolean))
  visibleAreas.forEach((area) => {
    const center = REGION_CENTERS[area as string]
    if (!center) return
    const label = new api.Marker(new api.LngLat(center.lng, center.lat), {
      icon: regionLabelIcon(area as string),
    })
    map?.addOverLay(label)
  })

  filtered.value.forEach((item) => {
    const point = new api.LngLat(item.lng, item.lat)
    const marker = new api.Marker(point, { icon: markerIcon(item) })
    marker.addEventListener('click', () => drillToProblem(item))
    map?.addOverLay(marker)
  })

  if (activeProblemId.value) {
    const active = filtered.value.find((item) => item.id === activeProblemId.value)
    if (active) showProblemCard(active, new api.LngLat(active.lng, active.lat))
    else closeProblemCard()
  }
}
async function initialize(): Promise<void> {
  loadError.value = ''
  try {
    const T = (window as any).T as any
    if (!T || !mapElement.value) throw new Error('天地图 API 未加载，请检查网络或 Key 是否有效')
    const data = (await gisApi.getPoints({})) as GisPoint[]
    points.value = Array.isArray(data)
      ? data
          .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat))
          .map((p) => ({
            ...p,
            warningLevel: ['red', 'orange', 'yellow', 'green'].includes(p.warningLevel)
              ? p.warningLevel
              : 'green',
            status: ['pending', 'inProgress', 'verify', 'rejected', 'closed'].includes(p.status)
              ? p.status
              : 'pending',
          }))
      : []
    if (userStore.isResponsible) {
      const ownRegion = REGIONS.find((item) => item.code === userStore.regionCode)
      filters.area = ownRegion?.name || points.value[0]?.area || ''
      drilldownArea.value = filters.area
      if (filters.status === 'pending') filters.status = ''
    }
    map?.clearOverLays()
    const createdMap = new T.Map(mapElement.value) as MapInstance
    map = createdMap
    createdMap.centerAndZoom(new T.LngLat(BAISE_VIEW.lng, BAISE_VIEW.lat), BAISE_VIEW.zoom)
    createdMap.enableScrollWheelZoom(true)
    const zoomControl = new T.Control.Zoom({
      position: (window as any).T_ANCHOR_TOP_LEFT,
      offset: new T.Point(18, 146),
    })
    createdMap.addControl(zoomControl)
    if ((window as any).TMAP_SATELLITE_MAP) {
      createdMap.setMapType((window as any).TMAP_SATELLITE_MAP)
    }
    createdMap.addEventListener('zoomend', () => {
      if (zoomChangeTimer) clearTimeout(zoomChangeTimer)
      zoomChangeTimer = setTimeout(() => {
        const zoom = createdMap.getZoom()
        if (zoom < PROBLEM_ZOOM && activeProblemId.value) {
          activeProblemId.value = ''
          selectedPoint.value = null
        }
        if (zoom < CLUSTER_ZOOM && drilldownArea.value && !userStore.isResponsible) {
          drilldownArea.value = ''
          filters.area = ''
        }
        renderMarkers()
      }, 80)
    })
    if (drilldownArea.value) {
      const center = getAreaCenter(drilldownArea.value, points.value)
      createdMap.centerAndZoom(new T.LngLat(center.lng, center.lat), DETAIL_ZOOM)
    }
    renderMarkers()
    if (!points.value.length) ElMessage.warning('当前条件下没有可展示的点位')
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '地图加载失败，请稍后重试'
    ElMessage.error(loadError.value)
  }
}
onMounted(initialize)
onBeforeUnmount(() => {
  if (zoomChangeTimer) clearTimeout(zoomChangeTimer)
  map?.clearOverLays()
  map = undefined
})
</script>

<style scoped lang="scss">
.map-wrap {
  position: relative;
  height: calc(100vh - 56px);
  min-height: 560px;
  overflow: hidden;
  margin: -24px;
}

.map-area {
  position: absolute;
  z-index: 1 !important;
  inset: 0;
  background: #dfe8dc;
}

.filter-bar {
  position: absolute;
  z-index: 1100;
  top: 16px;
  left: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  width: fit-content;
  max-width: calc(100% - 32px);
  min-height: 56px;
  padding: 11px 16px;
  box-sizing: border-box;
  background: rgb(255 255 255 / 95%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
  backdrop-filter: blur(8px);
}

.location-badge {
  position: absolute;
  z-index: 1100;
  top: 92px;
  left: 72px;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 13px;
  color: #0d3b1a;
  font-size: 13px;
  background: rgb(255 255 255 / 94%);
  border: 1px solid rgb(26 95 42 / 18%);
  border-radius: 8px;
  box-shadow: 0 3px 12px rgb(0 0 0 / 10%);
  backdrop-filter: blur(8px);
}

/* 天地图部分版本不会应用 Zoom 构造参数中的 offset，使用样式确保控件稳定避开筛选栏。 */
.map-area :deep(.tdt-top.tdt-left) {
  top: 92px !important;
  left: 16px !important;
}

.map-area :deep(.tdt-top.tdt-left .tdt-control) {
  margin: 0 !important;
}

.location-dot {
  width: 8px;
  height: 8px;
  background: #43a047;
  border: 2px solid #e8f5e9;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgb(67 160 71 / 25%);
}

.location-separator {
  color: #94a3b8;
}

.location-badge button {
  padding: 3px 8px;
  margin-left: 4px;
  color: #1a5f2a;
  font-size: 12px;
  background: #fff;
  border: 1px solid rgb(26 95 42 / 24%);
  border-radius: 6px;
  cursor: pointer;
}

.location-badge button:hover,
.location-badge button:focus-visible {
  background: #e8f5e9;
  outline: 2px solid rgb(26 95 42 / 20%);
  outline-offset: 1px;
}

.filter-bar label {
  display: flex;
  gap: 6px;
  align-items: center;
  color: #6b7280;
  font-size: 13px;
}

.filter-bar select {
  min-width: 112px;
  height: 32px;
  padding: 0 9px;
  color: #1a1a2e;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.filter-bar select:disabled {
  color: #526057;
  background: #eef2ee;
  cursor: not-allowed;
}

.legend {
  position: absolute;
  z-index: 1100;
  right: 16px;
  bottom: 72px;
  display: flex;
  min-width: 174px;
  padding: 14px 16px;
  background: rgb(255 255 255 / 95%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
  flex-direction: column;
  gap: 7px;
}

.legend strong {
  font-size: 13px;
}

.legend small {
  color: #6b7280;
  font-size: 10px;
}

.legend span {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #6b7280;
  font-size: 12px;
}

.legend i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.red {
  background: #e53935;
}

.orange {
  background: #fb8c00;
}

.green {
  background: #43a047;
}

.yellow {
  background: #eab308;
}

.legend-section {
  padding-top: 7px;
  margin-top: 3px;
  border-top: 1px solid #e5e7eb;
}

.legend .triangle {
  width: 0;
  height: 0;
  background: transparent;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid;
  border-radius: 0;
}

.legend .red-triangle {
  border-left-color: #e53935;
}

.legend .orange-triangle {
  border-left-color: #fb8c00;
}

.legend .green-triangle {
  border-left-color: #43a047;
}

.problem-card {
  position: absolute;
  z-index: 1200;
  width: 396px;
  overflow: hidden;
  color: #fff;
  background: rgb(3 32 18 / 96%);
  border: 1px solid rgb(24 174 93 / 65%);
  border-radius: 16px;
  box-shadow: 0 14px 36px rgb(0 0 0 / 38%);
}

.problem-card header {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 58px;
  padding: 0 18px;
  border-bottom: 1px solid rgb(53 211 125 / 25%);
}

.problem-card header i {
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 12px currentcolor;
}

.problem-card header strong {
  flex: 1;
  overflow: hidden;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.problem-card header button {
  color: rgb(255 255 255 / 52%);
  font-size: 24px;
  line-height: 1;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.problem-card header button:hover,
.problem-card header button:focus-visible {
  color: #fff;
  outline: 2px solid rgb(53 211 125 / 45%);
  outline-offset: 2px;
}

.problem-card-body {
  padding: 15px 20px 8px;
}

.problem-card dl {
  margin: 0;
}

.problem-card dl div {
  display: flex;
  align-items: center;
  min-height: 41px;
  border-bottom: 1px dashed rgb(53 211 125 / 14%);
}

.problem-card dt {
  flex: 1;
  color: rgb(205 235 216 / 70%);
  font-size: 14px;
}

.problem-card dd {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.problem-card .time-status {
  color: #28df79;
}

.problem-card footer {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 62px;
  padding: 0 20px;
  border-top: 1px solid rgb(53 211 125 / 18%);
}

.problem-card footer span {
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.status-chip {
  color: #31e985;
  background: rgb(19 151 78 / 22%);
  border: 1px solid rgb(49 233 133 / 42%);
}

.level-chip {
  color: #ff8c8c;
  background: rgb(229 57 53 / 15%);
  border: 1px solid rgb(229 57 53 / 45%);
}

.problem-card footer button {
  padding: 6px 10px;
  margin-left: auto;
  color: #31e985;
  font-size: 12px;
  background: transparent;
  border: 1px solid rgb(49 233 133 / 35%);
  border-radius: 8px;
  cursor: pointer;
}

.problem-card footer button:hover,
.problem-card footer button:focus-visible {
  background: rgb(49 233 133 / 12%);
  outline: none;
}

.legend .city-boundary,
.legend .district-boundary {
  width: 18px;
  height: 0;
  background: transparent;
  border-radius: 0;
}

.legend .city-boundary {
  border-top: 4px solid #1a5f2a;
}

.legend .district-boundary {
  border-top: 2px solid #94a3b8;
}

.bottom-bar {
  position: absolute;
  z-index: 1050;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  height: 56px;
  background: rgb(255 255 255 / 96%);
  border-top: 1px solid #e5e7eb;
}

.bottom-bar div {
  display: grid;
  flex: 1;
  text-align: center;
  border-right: 1px solid #e5e7eb;
  place-content: center;
}

.bottom-bar b {
  font-size: 18px;
  line-height: 22px;
}

.bottom-bar span {
  color: #6b7280;
  font-size: 11px;
}

.red-text {
  color: #e53935;
}

.orange-text {
  color: #fb8c00;
}

.green-text {
  color: #43a047;
}

.blue-text {
  color: #2563eb;
}

.map-error {
  position: absolute;
  z-index: 1300;
  inset: 0;
  display: grid;
  color: #6b7280;
  text-align: center;
  background: rgb(255 255 255 / 88%);
  place-content: center;
}

.map-error button {
  padding: 8px 16px;
  color: #fff;
  background: #1a5f2a;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

@media (width <= 900px) {
  .filter-bar {
    right: 16px;
    width: auto;
  }

  .map-wrap {
    margin: -16px;
  }

  .legend {
    right: 8px;
  }

  .location-badge {
    left: 64px;
  }

  .map-area :deep(.tdt-top.tdt-left) {
    left: 8px !important;
  }
}
</style>
