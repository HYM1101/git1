import { useMemo } from "react";
import styled from "styled-components";
import NumberAnimation from "@/components/numberAnimation";

interface StatItem {
  title: string;
  value: number;
  unit: string;
  total: number;
  color: string;
  icon: string;
  trendData: number[];
}

const stats: StatItem[] = [
  {
    title: "问题总数",
    value: 486,
    unit: "个",
    total: 600,
    color: "#10b981",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    trendData: [120, 180, 250, 320, 380, 410, 440, 460, 475, 486],
  },
  {
    title: "已销号数",
    value: 352,
    unit: "个",
    total: 486,
    color: "#34d399",
    icon: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    trendData: [45, 88, 130, 175, 210, 248, 285, 315, 338, 352],
  },
  {
    title: "闭环率",
    value: 72.4,
    unit: "%",
    total: 100,
    color: "#6ee7b7",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    trendData: [52, 55, 58, 62, 65, 67, 69, 70, 71, 72.4],
  },
  {
    title: "重要问题数",
    value: 38,
    unit: "个",
    total: 486,
    color: "#f59e0b",
    icon: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    trendData: [52, 48, 45, 42, 40, 39, 38, 38, 38, 38],
  },
];

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const StatCard = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid ${(p) => `${p.$color}30`};
  border-radius: 8px;
  background: linear-gradient(135deg, ${(p) => `${p.$color}08`} 0%, rgba(255, 255, 255, 0.3) 100%);
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${(p) => p.$color};
    border-radius: 8px 0 0 8px;
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => `${p.$color}18`};
  border-radius: 4px;
  flex-shrink: 0;

  svg {
    fill: ${(p) => p.$color};
    width: 14px;
    height: 14px;
  }
`;

const StatTitle = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
`;

const StatValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 2px 0;
`;

const StatNumber = styled.div`
  font-size: 30px;
  font-weight: 700;
  color: #064e3b;
  line-height: 1.1;
`;

const StatUnit = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.5);
`;

const MiniTrend = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 20px;
`;

const TrendBar = styled.div<{ $height: number; $color: string }>`
  flex: 1;
  height: ${(p) => p.$height}%;
  background-color: ${(p) => p.$color};
  border-radius: 2px;
  opacity: 0.5;
`;

function MiniTrendLine({ data, color }: { data: number[]; color: string }) {
  const max = useMemo(() => Math.max(...data), [data]);
  return (
    <MiniTrend>
      {data.map((v, i) => (
        <TrendBar key={i} $height={max > 0 ? (v / max) * 100 : 0} $color={color} />
      ))}
    </MiniTrend>
  );
}

export default function Chart1() {
  return (
    <Wrapper>
      {stats.map((item) => (
        <StatCard key={item.title} $color={item.color}>
          <StatHeader>
            <StatIcon $color={item.color}>
              <svg viewBox="0 0 24 24">
                <path d={item.icon} />
              </svg>
            </StatIcon>
            <StatTitle>{item.title}</StatTitle>
          </StatHeader>
          <StatValue>
            <StatNumber>
              <NumberAnimation
                value={item.value}
                options={{
                  minimumFractionDigits: item.unit === "%" ? 1 : 0,
                  maximumFractionDigits: item.unit === "%" ? 1 : 0,
                }}
              />
            </StatNumber>
            <StatUnit>{item.unit}</StatUnit>
          </StatValue>
          <MiniTrendLine data={item.trendData} color={item.color} />
        </StatCard>
      ))}
    </Wrapper>
  );
}
