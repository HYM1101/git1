import { useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useConfigStore } from "../stores";

const TitleWrapper = styled.div`
  pointer-events: auto;
  position: relative;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 9999;
  padding: 0 24px;
  box-sizing: border-box;
  overflow: hidden;
`;

const Title = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36px;
  letter-spacing: 8px;
  color: #fff;
  text-shadow: 0 8px 10px rgba(16, 185, 129, 0.8);
  font-weight: 700;
  background: linear-gradient(to bottom, #10b981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  pointer-events: none;

  &::after {
    content: "BAISE ECO-ENVIRONMENT COMMAND";
    display: block;
    font-size: 12px;
    letter-spacing: 12px;
    text-align: center;
    color: rgba(16, 185, 129, 0.6);
    margin-top: -5px;
    -webkit-text-fill-color: rgba(16, 185, 129, 0.6);
  }
`;

const Bg = styled.svg.attrs({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 1920 82",
  width: "100%",
  height: "100%",
  preserveAspectRatio: "none",
  children: (
    <>
      <defs>
        <radialGradient
          id="radialGradient"
          cx="50%"
          cy="50%"
          fx="100%"
          fy="50%"
          r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1"></stop>
          <stop offset="100%" stopColor="#fff" stopOpacity="0"></stop>
        </radialGradient>
        <mask id="svgline-1">
          <circle r="100" cx="0" cy="0" fill="url(#radialGradient)">
            <animateMotion
              begin="0s"
              dur="3s"
              path="M0,60 L620,60 L670,80 L960,80"
              rotate="auto"
              keyPoints="0;1"
              keyTimes="0;1"
              repeatCount="indefinite"></animateMotion>
          </circle>
        </mask>
        <mask id="svgline-2">
          <circle r="100" cx="0" cy="0" fill="url(#radialGradient)">
            <animateMotion
              begin="0s"
              dur="3s"
              path="M1920,60 L1300,60 L1250,80 L960,80"
              rotate="auto"
              keyPoints="0;1"
              keyTimes="0;1"
              repeatCount="indefinite"></animateMotion>
          </circle>
        </mask>
      </defs>

      <path
        d="M0,0 L1920,0 L1920,60 L1300,60 L1250,80 L670,80 L620,60 L0,60 Z"
        fill="rgb(240, 253, 244)"
      />

      <path
        d="M0,60 L620,60 L670,80 L1250,80 L1300,60 L1920,60"
        fill="none"
        stroke="rgb(16, 185, 129)"
        strokeWidth="1"
      />

      <path
        d="M0,60 L620,60 L670,80 L960,80"
        fill="none"
        stroke="#10b981"
        strokeWidth="4"
        mask="url(#svgline-1)"
      />

      <path
        d="M1920,60 L1300,60 L1250,80 L960,80"
        fill="none"
        stroke="#10b981"
        strokeWidth="4"
        mask="url(#svgline-2)"
      />
    </>
  ),
})`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const TimeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #047857;
  font-weight: 500;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
  }

  .date {
    font-size: 14px;
    color: #065f46;
  }

  .time {
    font-size: 16px;
    font-weight: 700;
    font-family: "Courier New", monospace;
    letter-spacing: 1px;
  }
`;

const TimeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="1.5" />
    <path d="M12 6v6l4 2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ActionBtn = styled.button`
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  margin: 0;
  font-size: 13px;
  font-family: inherit;
  color: #059669;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-sizing: border-box;
  outline: none;
  flex-shrink: 0;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.12) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: #10b981;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
    color: #059669;

    svg path,
    svg rect,
    svg circle,
    svg line,
    svg polyline {
      stroke: #059669;
    }
  }

  &:hover::before {
    opacity: 1;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const WorkbenchBtn = styled(ActionBtn)``;

const WorkbenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="13" rx="1" stroke="#10b981" strokeWidth="1.5" />
    <path d="M8 21h8M12 17v4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const RightGroup = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FullscreenBtn = styled(ActionBtn)``;

const FullscreenIcon = ({ isFullscreen }: { isFullscreen: boolean }) =>
  isFullscreen ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 3v4a2 2 0 0 1-2 2H3M15 3v4a2 2 0 0 0 2 2h4M9 21v-4a2 2 0 0 0-2-2H3M15 21v-4a2 2 0 0 1 2-2h4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

const RefreshBtn = styled(ActionBtn)`
  .sub {
    font-size: 10px;
    color: #047857;
    font-weight: 400;
    margin-left: 2px;
  }

  svg.spin {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg className={spinning ? "spin" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 3v5h-5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LayersBtn = styled(ActionBtn)``;

const LayersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m2 17 10 5 10-5M2 12l10 5 10-5" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const IconOnlyBtn = styled(ActionBtn)`
  padding: 0 8px;
`;

const BellBtn = styled(IconOnlyBtn)`
  position: relative;
`;

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 20a2 2 0 0 0 4 0" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Badge = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  border: 2px solid #f0fdf4;
  box-sizing: border-box;
`;

const UserInfo = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px 0 6px;
  height: 34px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-3px);
    border-color: #10b981;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  }
`;

const Avatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #059669;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserName = styled.span`
  font-size: 13px;
  color: #064e3b;
  font-weight: 500;
  white-space: nowrap;
`;

const DropdownPanel = styled.div<{ $arrowLeft?: number }>`
  position: fixed;
  min-width: 200px;
  background: rgba(240, 253, 244, 0.98);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(6, 78, 59, 0.22);
  padding: 8px 0;
  z-index: 2147483647;

  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: ${(props) => (props.$arrowLeft ? `${props.$arrowLeft}px` : "auto")};
    width: 10px;
    height: 10px;
    background: rgba(240, 253, 244, 0.98);
    border-left: 1px solid rgba(16, 185, 129, 0.4);
    border-top: 1px solid rgba(16, 185, 129, 0.4);
    transform: rotate(45deg);
  }
`;

const PanelItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  font-size: 13px;
  color: #064e3b;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(16, 185, 129, 0.12);
  }

  &.disabled {
    color: #9ca3af;
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }
`;

const Checkbox = styled.span<{ $checked: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1.5px solid ${(p) => (p.$checked ? "#10b981" : "#9ca3af")};
  background: ${(p) => (p.$checked ? "#10b981" : "transparent")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: "";
    width: 6px;
    height: 3px;
    border-left: 1.5px solid ${(p) => (p.$checked ? "#fff" : "transparent")};
    border-bottom: 1.5px solid ${(p) => (p.$checked ? "#fff" : "transparent")};
    transform: rotate(-45deg) translate(0, -1px);
  }
`;

const AlertItem = styled.div`
  padding: 10px 14px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.15);
  font-size: 12px;
  color: #064e3b;

  &:last-child {
    border-bottom: none;
  }

  .title {
    font-weight: 600;
    color: #b91c1c;
  }

  .time {
    display: block;
    font-size: 11px;
    color: #047857;
    opacity: 0.7;
    margin-top: 2px;
  }
`;

function useCurrentTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${y}-${m}-${d} ${weekDays[date.getDay()]}`;
}

function formatTime(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${mi}:${s}`;
}

export default function Headder(props: ComponentProps<typeof TitleWrapper>) {
  const now = useCurrentTime();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const layersBtnRef = useRef<HTMLButtonElement>(null);
  const bellBtnRef = useRef<HTMLButtonElement>(null);
  const userBtnRef = useRef<HTMLDivElement>(null);
  const layersPanelRef = useRef<HTMLDivElement>(null);
  const bellPanelRef = useRef<HTMLDivElement>(null);
  const userPanelRef = useRef<HTMLDivElement>(null);

  const cloud = useConfigStore((s) => s.cloud);
  const bar = useConfigStore((s) => s.bar);
  const rotation = useConfigStore((s) => s.rotation);
  const heat = useConfigStore((s) => s.heat);
  const toggle = useConfigStore((s) => s.toggle);

  const positionPortal = (
    panelRef: React.RefObject<HTMLDivElement | null>,
    triggerRef: React.RefObject<HTMLButtonElement | HTMLDivElement | null>
  ) => {
    if (!panelRef.current || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const panelWidth = panelRect.width;
    const left = rect.right - panelWidth;
    const top = rect.bottom + 10;
    panelRef.current.style.left = `${left}px`;
    panelRef.current.style.top = `${top}px`;
    const arrowLeft = rect.right - (rect.width / 2) - left - 5;
    panelRef.current.style.setProperty("--arrow-left", `${arrowLeft}px`);
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    if (layersOpen) positionPortal(layersPanelRef, layersBtnRef);
    if (bellOpen) positionPortal(bellPanelRef, bellBtnRef);
    if (userOpen) positionPortal(userPanelRef, userBtnRef);
  }, [layersOpen, bellOpen, userOpen]);

  useEffect(() => {
    const handler = () => {
      positionPortal(layersPanelRef, layersBtnRef);
      positionPortal(bellPanelRef, bellBtnRef);
      positionPortal(userPanelRef, userBtnRef);
    };
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const panelRefs = [layersPanelRef, bellPanelRef, userPanelRef];
      const triggerRefs = [layersBtnRef, bellBtnRef, userBtnRef];
      const openStates = [layersOpen, bellOpen, userOpen];
      const setters = [setLayersOpen, setBellOpen, setUserOpen];
      for (let i = 0; i < 3; i++) {
        if (!openStates[i]) continue;
        if (panelRefs[i]?.current?.contains(target)) continue;
        if (triggerRefs[i]?.current?.contains(target)) continue;
        setters[i](false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [layersOpen, bellOpen, userOpen]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    useConfigStore.getState().reset();
    setLastRefreshTime(formatTime(new Date()));
    setTimeout(() => setRefreshing(false), 800);
  };

  const togglePanel = (
    panel: "layers" | "bell" | "user",
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setLayersOpen(panel === "layers" ? (v) => !v : false);
    setBellOpen(panel === "bell" ? (v) => !v : false);
    setUserOpen(panel === "user" ? (v) => !v : false);
  };

  return (
    <TitleWrapper {...props}>
      <Bg />
      <TimeWrapper>
        <TimeIcon />
        <span className="date">{formatDate(now)}</span>
        <span className="time">{formatTime(now)}</span>
      </TimeWrapper>
      <Title>百色市生态环境智慧指挥中心</Title>

      <RightGroup>
        <WorkbenchBtn
          onClick={() => {
            const pcUrl =
              (window as any).__EC_PC_URL__ || "http://127.0.0.1:8090/";
            window.location.href = pcUrl;
          }}>
          <WorkbenchIcon />
          <span>工作台</span>
        </WorkbenchBtn>

        <RefreshBtn onClick={handleRefresh}>
          <RefreshIcon spinning={refreshing} />
          <span>
            刷新
            {lastRefreshTime && <span className="sub">·上次 {lastRefreshTime}</span>}
          </span>
        </RefreshBtn>

        <LayersBtn ref={layersBtnRef} onClick={(e) => togglePanel("layers", e)}>
          <LayersIcon />
          <span>图层</span>
        </LayersBtn>

        <BellBtn ref={bellBtnRef} onClick={(e) => togglePanel("bell", e)}>
          <BellIcon />
          <Badge>3</Badge>
        </BellBtn>

        <UserInfo ref={userBtnRef as any} onClick={(e) => togglePanel("user", e)}>
          <Avatar>管</Avatar>
          <UserName>管理员</UserName>
        </UserInfo>

        <FullscreenBtn onClick={handleFullscreen}>
          <FullscreenIcon isFullscreen={isFullscreen} />
          <span>{isFullscreen ? "退出全屏" : "进入全屏"}</span>
        </FullscreenBtn>
      </RightGroup>

      {typeof document !== "undefined" &&
        createPortal(
          <>
            {layersOpen && (
              <DropdownPanel ref={layersPanelRef}>
                <PanelItem onClick={() => toggle("cloud")}>
                  <Checkbox $checked={cloud} />
                  <span>云图 cloud</span>
                </PanelItem>
                <PanelItem onClick={() => toggle("bar")}>
                  <Checkbox $checked={bar} />
                  <span>柱图 bar</span>
                </PanelItem>
                <PanelItem onClick={() => toggle("rotation")}>
                  <Checkbox $checked={rotation} />
                  <span>旋转环 rotation</span>
                </PanelItem>
                <PanelItem onClick={() => toggle("heat")}>
                  <Checkbox $checked={heat} />
                  <span>热力点 heat</span>
                </PanelItem>
              </DropdownPanel>
            )}
            {bellOpen && (
              <DropdownPanel ref={bellPanelRef}>
                <AlertItem>
                  <span className="title">田东县 PM2.5 超标</span>
                  <span className="time">15 分钟前</span>
                </AlertItem>
                <AlertItem>
                  <span className="title">靖西市水质异常</span>
                  <span className="time">1 小时前</span>
                </AlertItem>
                <AlertItem>
                  <span className="title">平果市噪音投诉</span>
                  <span className="time">2 小时前</span>
                </AlertItem>
              </DropdownPanel>
            )}
            {userOpen && (
              <DropdownPanel ref={userPanelRef}>
                <PanelItem className="disabled">个人设置</PanelItem>
                <PanelItem
                  onClick={() => {
                    console.log("退出登录");
                    setUserOpen(false);
                  }}>
                  退出登录
                </PanelItem>
              </DropdownPanel>
            )}
          </>,
          document.body
        )}
    </TitleWrapper>
  );
}
