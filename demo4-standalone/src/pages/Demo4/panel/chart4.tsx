import Chart from "@/components/chart";
import styled from "styled-components";
import type { ComposeOption } from "echarts/core";
import { PieChart, type PieSeriesOption } from "echarts/charts";
import {
  LegendComponent,
  TooltipComponent,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components";

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
`;

const CenterLabel = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.2;
`;

const CenterValue = styled.div`
  font-size: 26px;
  font-weight: bold;
  color: #064e3b;
  line-height: 1.2;
`;

const CenterUnit = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  line-height: 1.2;
`;

type PieOption = ComposeOption<
  | PieSeriesOption
  | TooltipComponentOption
  | LegendComponentOption
>;

interface WarningLevel {
  name: string;
  value: number;
  color: string;
}

const warningData: WarningLevel[] = [
  { name: "红色预警", value: 8, color: "#ef4444" },
  { name: "橙色预警", value: 18, color: "#f97316" },
  { name: "黄色预警", value: 35, color: "#f59e0b" },
  { name: "蓝色预警", value: 62, color: "#3b82f6" },
];

const total = warningData.reduce((sum, item) => sum + item.value, 0);

export default function Chart4() {
  return (
    <ChartContainer>
      <CenterText>
        <CenterLabel>预警总数</CenterLabel>
        <CenterValue>{total}</CenterValue>
        <CenterUnit>起</CenterUnit>
      </CenterText>
      <Chart<PieOption>
        use={[PieChart, TooltipComponent, LegendComponent]}
        style={{ width: "100%", height: "100%" }}
        option={{
          tooltip: {
            trigger: "item",
            backgroundColor: "rgba(240, 253, 244, 0.8)",
            borderColor: "#10b981",
            borderWidth: 1,
            borderRadius: 8,
            textStyle: { color: "rgba(0, 0, 0, 0.8)", fontSize: 12 },
            formatter: (params: any) => {
              const pct = ((params.value / total) * 100).toFixed(1);
              return `${params.marker} ${params.name}: <b>${params.value}</b> (${pct}%)`;
            },
          },
          legend: {
            icon: "circle",
            orient: "vertical",
            right: "6%",
            top: "middle",
            itemGap: 14,
            textStyle: { color: "#000000", fontSize: 12 },
          },
          series: [
            {
              name: "预警等级分布",
              type: "pie",
              radius: ["55%", "75%"],
              center: ["40%", "50%"],
              avoidLabelOverlap: false,
              label: {
                show: true,
                position: "inside",
                formatter: "{d}%",
                fontSize: 11,
                fontWeight: "bold",
                color: "#ffffff",
              },
              emphasis: {
                scaleSize: 8,
                label: { fontSize: 13 },
              },
              itemStyle: {
                borderRadius: 6,
                borderColor: "rgba(255, 255, 255, 0.8)",
                borderWidth: 2,
              },
              data: warningData.map((item) => ({
                value: item.value,
                name: item.name,
                itemStyle: { color: item.color },
              })),
            },
          ],
        }}
      />
    </ChartContainer>
  );
}
