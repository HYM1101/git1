import { Html } from "@react-three/drei";
import { useImperativeHandle, useState, type Ref } from "react";
import styled from "styled-components";

const TooltipBox = styled.div`
  background: rgba(240, 253, 244, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 12px 14px;
  color: #064e3b;
  font-size: 12px;
  pointer-events: none;
  border: 1px solid rgba(16, 185, 129, 0.25);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  min-width: 150px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.15);
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
`;

const CityName = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #047857;
`;

const CoreGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
`;

const CoreItem = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
`;

const CoreLabel = styled.div`
  font-size: 11px;
  color: rgba(6, 78, 59, 0.65);
  margin-bottom: 3px;
`;

const CoreValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #059669;
  line-height: 1.1;
`;

const CoreUnit = styled.span`
  font-size: 10px;
  font-weight: normal;
  color: rgba(6, 78, 59, 0.6);
  margin-left: 1px;
`;

const ExtraList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ExtraItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(6, 78, 59, 0.75);
`;

const ExtraValue = styled.span`
  color: #065f46;
  font-weight: 500;
`;

interface TooltipProps {
  ref?: Ref<{ open: () => void; close: () => void }>;
  data: {
    city: string;
    totalProblems: number;
    pollutionTypeCount: number;
    mainPollutionType: string;
    inProgress: number;
    resolved: number;
  };
  position: [number, number, number];
  visible: boolean;
}

export default function Tooltip(props: TooltipProps) {
  const { ref, data, position } = props;
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  const closureRate =
    data.totalProblems > 0
      ? ((data.resolved / data.totalProblems) * 100).toFixed(1)
      : "0.0";

  return (
    visible && (
      <Html
        center
        position={position}
        distanceFactor={100}
        zIndexRange={[1001 - 1500]}
        style={{ pointerEvents: "none" }}>
        <TooltipBox>
          <Header>
            <Dot />
            <CityName>{data.city}</CityName>
          </Header>

          <CoreGrid>
            <CoreItem>
              <CoreLabel>问题总数</CoreLabel>
              <CoreValue>
                {data.totalProblems}
                <CoreUnit>个</CoreUnit>
              </CoreValue>
            </CoreItem>
            <CoreItem>
              <CoreLabel>污染类型</CoreLabel>
              <CoreValue>
                {data.pollutionTypeCount}
                <CoreUnit>类</CoreUnit>
              </CoreValue>
            </CoreItem>
          </CoreGrid>

          <ExtraList>
            <ExtraItem>
              <span>主要污染类型</span>
              <ExtraValue>{data.mainPollutionType}</ExtraValue>
            </ExtraItem>
            <ExtraItem>
              <span>整改中</span>
              <ExtraValue>{data.inProgress}个</ExtraValue>
            </ExtraItem>
            <ExtraItem>
              <span>已销号</span>
              <ExtraValue>{data.resolved}个</ExtraValue>
            </ExtraItem>
            <ExtraItem>
              <span>闭环率</span>
              <ExtraValue>{closureRate}%</ExtraValue>
            </ExtraItem>
          </ExtraList>
        </TooltipBox>
      </Html>
    )
  );
}
