interface BMapPoint {
  lng: number
  lat: number
}
interface BMapOverlay {
  addEventListener(event: string, handler: () => void): void
}
interface BMapMap {
  centerAndZoom(point: BMapPoint, zoom: number): void
  enableScrollWheelZoom(enabled: boolean): void
  addOverlay(overlay: BMapOverlay): void
  clearOverlays(): void
  addControl(control: object): void
  openInfoWindow(infoWindow: object, point: BMapPoint): void
  setMapType(type: unknown): void
}
interface BMapApi {
  Map: new (element: HTMLElement) => BMapMap
  Point: new (lng: number, lat: number) => BMapPoint
  Marker: new (point: BMapPoint, options?: { icon?: object }) => BMapOverlay
  Icon: new (url: string, size: object) => object
  Size: new (width: number, height: number) => object
  InfoWindow: new (content: string, options?: Record<string, unknown>) => object
  NavigationControl: new () => object
  ScaleControl: new () => object
}
interface Window {
  BMap?: BMapApi
  BMAP_SATELLITE_MAP?: unknown
}
