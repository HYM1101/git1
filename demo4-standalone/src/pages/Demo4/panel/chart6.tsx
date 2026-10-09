import SeamVirtualScroll from "@/components/seamVirtualScroll";

import cityData from "../cityData";

const keys = Object.keys(cityData);

const statuses = [
  { label: "待交办", color: "#6b7280" },
  { label: "整改中", color: "#f59e0b" },
  { label: "待验收", color: "#3b82f6" },
  { label: "已销号", color: "#10b981" },
];

const tasks = [
  "工业废水超标排放",
  "建筑施工扬尘污染",
  "危险废物违规贮存",
  "废气在线监测异常",
  "饮用水源地保护",
  "土壤重金属污染修复",
  "工业噪声扰民投诉",
  "固废露天堆放整改",
  "养殖场粪污直排",
  "河道非法采砂监管",
  "化工厂废气泄漏",
  "污水处理厂运行异常",
];

const pollutionTypes = ["大气", "水", "土壤", "噪声", "固废", "其他"];

export default function Chart6() {
  return (
    <SeamVirtualScroll
      rowHeight={48}
      speed={2500}
      styles={{
        header: { color: "rgba(0, 0, 0, 0.6)", fontWeight: 600 },
        body: { color: "#000000" },
      }}
      column={[
        {
          title: "编号",
          dataIndex: "id",
          align: "left",
          flex: 0.8,
          noScroll: true,
        },
        {
          title: "区县",
          dataIndex: "district",
          align: "left",
          flex: 1,
          noScroll: true,
        },
        {
          title: "问题类型",
          dataIndex: "type",
          align: "center",
          flex: 0.6,
          noScroll: true,
        },
        {
          title: "问题描述",
          dataIndex: "task",
          align: "left",
          flex: 1.5,
        },
        {
          title: "状态",
          dataIndex: "status",
          align: "center",
          flex: 0.7,
          noScroll: true,
        },
      ]}
      data={Array.from({ length: 30 }, (_, k) => {
        const status = statuses[k % statuses.length];
        return {
          id: `WT${String(k + 1).padStart(4, "0")}`,
          district: keys[k % keys.length],
          type: (
            <span
              style={{
                display: "inline-block",
                padding: "1px 6px",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
                color: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
              }}>
              {pollutionTypes[k % pollutionTypes.length]}
            </span>
          ),
          task: tasks[k % tasks.length],
          status: (
            <span
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: status.color,
              }}>
              {status.label}
            </span>
          ),
        };
      })}
    />
  );
}
