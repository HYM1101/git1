import Chart from "@/components/chart";
import type { ComposeOption } from "echarts/core";
import {
  BarChart,
  PictorialBarChart,
  type BarSeriesOption,
  type PictorialBarSeriesOption,
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  type GridComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import { LabelLayout } from "echarts/features";

import cityData from "../cityData";

type BarOption = ComposeOption<
  | BarSeriesOption
  | PictorialBarSeriesOption
  | TooltipComponentOption
  | GridComponentOption
>;

const colors = ["#6ee7b7", "#10b981"];

// 按问题总数取 TOP 5
const allCities = Object.keys(cityData).map((name) => {
  const item = cityData[name as keyof typeof cityData];
  return {
    name,
    problemCount: item.totalProblems,
  };
});

const data = allCities.sort((a, b) => b.problemCount - a.problemCount).slice(0, 5);

export default function Chart2() {
  return (
    <Chart<BarOption>
      use={[BarChart, PictorialBarChart, GridComponent, TooltipComponent, LabelLayout]}
      option={{
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(240, 253, 244, 0.8)",
          borderColor: "#10b981",
          borderWidth: 1,
          borderRadius: 8,
          textStyle: { color: "rgba(0, 0, 0, 0.8)", fontSize: 12 },
          formatter: (params: any) => {
            const p = Array.isArray(params) ? params[0] : params;
            return `<b>${p.name}</b><br/>问题数量: <b>${p.value}</b> 个`;
          },
        },
        grid: {
          top: 5,
          bottom: 5,
          left: "10%",
          right: "14%",
        },
        xAxis: {
          type: "value",
          show: false,
        },
        yAxis: {
          type: "category",
          inverse: true,
          animationDuration: 300,
          animationDurationUpdate: 300,
          data: data.map((d) => d.name),
          axisLabel: {
            fontSize: 11,
            margin: 12,
            color: "#000000",
            formatter: (v: string, i: number) => {
              return `{a|NO.${i + 1}} ${v}`;
            },
            rich: {
              a: {
                color: "rgba(0, 0, 0, 0.6)",
              },
            },
          },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar",
            data: data.map((d) => d.problemCount),
            realtimeSort: true,
            barWidth: 10,
            itemStyle: {
              borderRadius: 4,
              color: {
                type: "linear",
                x: 1,
                y: 0,
                x2: 0,
                y2: 0,
                colorStops: colors.map((color, index) => ({
                  offset: index,
                  color: color,
                })),
                global: false,
              },
            },
            showBackground: true,
            backgroundStyle: {
              borderRadius: 4,
              color: "rgba(16, 185, 129, 0.06)",
            },
            label: {
              show: true,
              position: "right",
              color: "#064e3b",
              fontSize: 12,
              fontWeight: "bold",
              valueAnimation: true,
              formatter: "{c}",
            },
          },
          {
            name: "dot",
            type: "pictorialBar",
            symbol: "circle",
            symbolSize: 14,
            z: 12,
            itemStyle: {
              color: colors[0],
              shadowColor: colors[0],
              shadowBlur: 8,
            },
            data: data.map((d) => ({
              value: d.problemCount,
              symbolPosition: "end",
            })),
          },
        ],
        animationDuration: 0,
        animationDurationUpdate: 1000,
        animationEasing: "linear",
        animationEasingUpdate: "linear",
      }}
    />
  );
}
