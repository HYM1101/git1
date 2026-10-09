import Chart from "@/components/chart";
import type { ComposeOption } from "echarts/core";
import { LineChart, type LineSeriesOption } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  type GridComponentOption,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components";

type LineOption = ComposeOption<
  | LineSeriesOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
>;

// 近12周问题趋势：新增发现 vs 完成销号
const weeks = Array.from({ length: 12 }, (_, i) => `第${i + 1}周`);

const discoveredData = [68, 72, 65, 80, 85, 78, 92, 88, 75, 70, 62, 55];
const resolvedData = [45, 52, 58, 60, 68, 72, 75, 80, 78, 72, 68, 65];

export default function Chart3() {
  return (
    <Chart<LineOption>
      use={[LineChart, GridComponent, TooltipComponent, LegendComponent]}
      option={{
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(240, 253, 244, 0.8)",
          borderColor: "#10b981",
          borderWidth: 1,
          borderRadius: 8,
          textStyle: { color: "rgba(0, 0, 0, 0.8)", fontSize: 12 },
        },
        legend: {
          right: 10,
          top: 0,
          itemWidth: 14,
          itemHeight: 8,
          data: ["新增发现", "完成销号"],
          textStyle: { color: "rgba(0, 0, 0, 0.7)", fontSize: 11 },
        },
        grid: {
          top: 30,
          bottom: 10,
          left: 10,
          right: 20,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: weeks,
          axisLine: { lineStyle: { color: "rgba(0, 0, 0, 0.1)" } },
          axisLabel: {
            color: "rgba(0, 0, 0, 0.6)",
            fontSize: 10,
            interval: 1,
          },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          splitLine: { show: false },
          axisLine: { show: true, lineStyle: { color: "rgba(0, 0, 0, 0.1)" } },
          axisLabel: { color: "rgba(0, 0, 0, 0.6)", fontSize: 10 },
        },
        series: [
          {
            name: "新增发现",
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            smooth: true,
            lineStyle: { color: "#f59e0b", width: 2 },
            itemStyle: { color: "#f59e0b" },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(245, 158, 11, 0.25)" },
                  { offset: 1, color: "rgba(245, 158, 11, 0.02)" },
                ],
              },
            },
            data: discoveredData,
          },
          {
            name: "完成销号",
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            smooth: true,
            lineStyle: { color: "#10b981", width: 2 },
            itemStyle: { color: "#10b981" },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(16, 185, 129, 0.25)" },
                  { offset: 1, color: "rgba(16, 185, 129, 0.02)" },
                ],
              },
            },
            data: resolvedData,
          },
        ],
      }}
    />
  );
}
