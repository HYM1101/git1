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
  left: 38%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
`;

const CenterLabel = styled.div`
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.2;
`;

const CenterValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #064e3b;
  line-height: 1.2;
`;

type PieOption = ComposeOption<
  | PieSeriesOption
  | TooltipComponentOption
  | LegendComponentOption
>;

interface PollutionType {
  name: string;
  value: number;
  color: string;
}

const pollutionData: PollutionType[] = [
  { name: "大气", value: 128, color: "#10b981" },
  { name: "水", value: 95, color: "#34d399" },
  { name: "土壤", value: 62, color: "#6ee7b7" },
  { name: "噪声", value: 48, color: "#a7f3d0" },
  { name: "固废", value: 35, color: "#d1fae5" },
  { name: "其他", value: 22, color: "#ecfdf5" },
];

const total = pollutionData.reduce((sum, item) => sum + item.value, 0);

export default function Chart5() {
  return (
    <ChartContainer>
      <CenterText>
        <CenterLabel>污染问题</CenterLabel>
        <CenterValue>{total}</CenterValue>
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
              return `${params.marker} ${params.name}污染: <b>${params.value}</b> 起 (${pct}%)`;
            },
          },
          legend: {
            icon: "circle",
            orient: "vertical",
            right: "4%",
            top: "middle",
            itemGap: 10,
            textStyle: { color: "#000000", fontSize: 12 },
          },
          series: [
            {
              name: "污染类型分布",
              type: "pie",
              radius: ["45%", "70%"],
              center: ["38%", "50%"],
              roseType: "radius",
              avoidLabelOverlap: false,
              label: {
                show: true,
                position: "inside",
                formatter: "{b}\n{d}%",
                fontSize: 10,
                fontWeight: "bold",
                color: "#064e3b",
                lineHeight: 14,
              },
              emphasis: {
                scaleSize: 8,
                label: { fontSize: 12 },
              },
              itemStyle: {
                borderRadius: 4,
                borderColor: "rgba(255, 255, 255, 0.8)",
                borderWidth: 2,
              },
              data: pollutionData.map((item) => ({
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
