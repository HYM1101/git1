/**
 * Mock 数据种子 —— 问题台账（与 demo-flow.js 数据结构对齐）
 * 仅在 VITE_MOCK=on 时加载，后端就绪后删除此文件。
 */
import type { Problem } from '@/types'
import { REGIONS, REGION_CENTERS } from '@/constants'
import { calcWarningByDeadline } from '@/utils/warning'

/** 生成种子问题列表 */
function buildSeedProblems(): Problem[] {
  const sources = ['中央环保督察', '省级专项检查', '日常巡查', '群众信访', '遥感发现', '企业自查']
  const pollutions = ['大气', '水', '土壤', '固废', '噪声', '生态']
  const statuses: Problem['status'][] = ['pending', 'inProgress', 'verify', 'rejected', 'closed']
  const prototypeTailStatuses: Problem['status'][] = [
    'pending',
    'inProgress',
    'inProgress',
    'verify',
    'inProgress',
    'inProgress',
    'inProgress',
    'inProgress',
    'pending',
    'inProgress',
    'inProgress',
    'inProgress',
    'inProgress',
    'pending',
    'inProgress',
    'inProgress',
    'verify',
    'inProgress',
    'rejected',
    'rejected',
    'rejected',
    'rejected',
  ]
  const levels: Problem['importantLevel'][] = ['red', 'orange', 'green']
  type PrototypeRow = [
    string,
    string,
    string,
    string,
    Problem['importantLevel'],
    Problem['warningLevel'],
    Problem['status'],
    number,
    number,
  ]
  // 与 demo-flow.js 前 20 条固定数据一致，用于 PC 原型和 Vue 的可重复视觉验收。
  const prototypeRows: PrototypeRow[] = [
    ['A县某化工企业废气排放超标', 'A县', '化工', '大气', 'red', 'green', 'closed', -30, 100],
    ['B县某河流水质断面氨氮超标', 'B县', '生活污水', '水', 'orange', 'green', 'closed', -15, 100],
    ['C县某养殖场粪污直排', 'C县', '养殖', '水', 'orange', 'green', 'closed', -20, 100],
    ['D县某矿山生态恢复不到位', 'D县', '采矿', '生态', 'orange', 'green', 'closed', -10, 100],
    ['E县某印刷厂VOCs治理设施未运行', 'E县', '印刷', '大气', 'orange', 'green', 'closed', -25, 100],
    ['A县某建筑工地扬尘管控不力', 'A县', '建筑', '大气', 'green', 'green', 'closed', -40, 100],
    ['B县某医院医疗废物贮存不规范', 'B县', '医疗', '固废', 'orange', 'green', 'closed', -5, 100],
    ['C县某餐饮店油烟直排', 'C县', '餐饮', '大气', 'green', 'green', 'closed', -60, 100],
    ['A县某电镀厂废水重金属超标', 'A县', '电镀', '水', 'red', 'green', 'closed', -20, 100],
    ['B县某陶瓷厂粉尘无组织排放', 'B县', '陶瓷', '大气', 'orange', 'green', 'closed', -15, 100],
    ['D县某加油站油气回收装置故障', 'D县', '石化', '大气', 'orange', 'green', 'closed', -30, 100],
    ['E县某污水处理厂出水总磷超标', 'E县', '污水处理', '水', 'orange', 'green', 'closed', -10, 100],
    ['A县某机动车检测站数据造假', 'A县', '检测服务', '大气', 'red', 'green', 'closed', -5, 100],
    ['C县某建材厂噪声扰民', 'C县', '建材', '噪声', 'orange', 'green', 'verify', -45, 100],
    [
      'B县某垃圾中转站渗滤液渗漏',
      'B县',
      '固废处理',
      '固废',
      'orange',
      'orange',
      'inProgress',
      30,
      60,
    ],
    [
      'D县某畜禽养殖场粪污处理设施不完善',
      'D县',
      '养殖',
      '水',
      'orange',
      'yellow',
      'pending',
      10,
      0,
    ],
    [
      'A县某家具厂喷漆VOCs治理设施低效',
      'A县',
      '家具制造',
      '大气',
      'orange',
      'green',
      'inProgress',
      -30,
      75,
    ],
    [
      'E县某矿山采空区生态恢复滞后',
      'E县',
      '采矿',
      '生态',
      'orange',
      'orange',
      'inProgress',
      20,
      40,
    ],
    [
      '某镇垃圾填埋场渗滤液收集池渗漏',
      'A县',
      '固废处理',
      '固废',
      'red',
      'red',
      'inProgress',
      120,
      45,
    ],
    [
      '工业园区排放口在线监测持续超标',
      'B县',
      '化工',
      '大气',
      'orange',
      'orange',
      'inProgress',
      65,
      30,
    ],
  ]
  // 原型中的 A～E 县仅是早期占位名，GIS 数据必须映射到真实百色区县。
  const prototypeRegionAliases: Record<string, string> = {
    A县: '右江区',
    B县: '田阳区',
    C县: '田东县',
    D县: '靖西市',
    E县: '平果市',
  }
  // 与原 HTML 当前样本一致：42 条中红 6、橙 1、黄 3、正常 32。
  // 日期仍由规则反推生成，保证跨日期运行时等级不会漂移。
  const warningOffsets: Record<number, number> = {
    14: -240,
    15: -301,
    17: -251,
    18: -240,
    19: -166,
    20: -90,
    22: -59,
    24: -29,
    26: -13,
    27: 0,
  }

  const list: Problem[] = []
  for (let i = 1; i <= 42; i++) {
    const prototype = prototypeRows[i - 1]
    const region = REGIONS[i % REGIONS.length]
    const status =
      prototype?.[6] ??
      prototypeTailStatuses[i - prototypeRows.length - 1] ??
      statuses[i % statuses.length]
    const importantLevel = prototype?.[4] ?? levels[i % levels.length]
    const source = sources[i % sources.length]
    const pollutionType = prototype?.[3] ?? pollutions[i % pollutions.length]
    const prototypeRegionName = prototype?.[1]
    const seedRegionName = prototypeRegionName
      ? prototypeRegionAliases[prototypeRegionName] || prototypeRegionName
      : region.name
    const seedRegion = REGIONS.find((item) => item.name === seedRegionName) || region
    const center = REGION_CENTERS[seedRegionName]
    const lngOffset = ((i % 5) - 2) * 0.012
    const latOffset = (((i * 2) % 5) - 2) * 0.01

    // 截止日期：部分超期、部分未到期
    const offset = warningOffsets[i] ?? 60
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const deadline = i === 1 ? '2024-06-30' : d.toISOString().slice(0, 10)
    const warning = calcWarningByDeadline(deadline, status)
    const createdAt =
      i === 1
        ? '2024-03-15'
        : i <= 8
          ? `2024-0${(i % 8) + 1}-1${i % 9}`
          : i === 16
            ? '2025-10-01'
            : i <= 19
              ? `2025-0${(i % 8) + 1}-1${i % 9}`
              : status === 'pending'
                ? new Date().toISOString().slice(0, 10)
                : `2026-0${(i % 8) + 1}-1${i % 9}`
    const progress =
      prototype?.[8] ?? (status === 'closed' ? 100 : status === 'verify' ? 100 : (i * 7) % 100)

    list.push({
      id: `P${String(i).padStart(4, '0')}`,
      problemNo:
        i <= 8
          ? `PRB-2024-${String(i).padStart(4, '0')}`
          : i <= 18
            ? `PRB-2025-${String(i - 8).padStart(4, '0')}`
            : `PRB-2026-${String(i - 18).padStart(4, '0')}`,
      title: prototype
        ? prototype[0].replace(prototype[1], seedRegionName)
        : `${seedRegionName}-${pollutionType}污染问题-${i}`,
      source,
      regionCode: seedRegion.code,
      regionName: seedRegionName,
      pollutionType,
      industry: prototype?.[2],
      responsibleUnit:
        i % 3 === 0 ? `${seedRegionName}生态环境局` : `${seedRegionName}综合执法大队`,
      responsiblePerson: `张${['伟', '芳', '强', '敏', '杰', '丽'][i % 6]}`,
      deadline,
      importantLevel,
      sourceGrade: i % 3 === 0 ? '高' : i % 3 === 1 ? '中' : '低',
      riskGrade: i % 4 === 0 ? '高' : i % 4 === 1 ? '中' : '低',
      // 预警由截止日期与生命周期统一计算，避免展示种子与真实状态相互矛盾。
      warningLevel: warning.level,
      overdueDays: status === 'pending' || status === 'closed' ? 0 : warning.overdueDays,
      status,
      progress,
      measures: progress >= 30 ? '已完成现场排查并落实阶段性整改措施。' : '',
      effect: progress >= 60 ? '整改工作已取得阶段性成效，相关指标持续改善。' : '',
      progressAttachments: [],
      riskTags:
        i % 5 === 0 ? ['重金属污染'] : i % 5 === 1 ? ['监测超标'] : i % 5 === 2 ? ['重复信访'] : [],
      lng: (center?.lng ?? 106.1676) + lngOffset,
      lat: (center?.lat ?? 23.9774) + latOffset,
      createdAt,
      completedPhases:
        status === 'closed' || status === 'verify'
          ? [0, 1, 2, 3, 4]
          : status === 'inProgress'
            ? [0, 1, 2]
            : [],
      timeline: [
        {
          time: `2026-0${(i % 8) + 1}-1${i % 9} 09:00`,
          action: 'CREATE',
          desc: '系统录入',
          user: '督察组',
        },
        ...(status !== 'pending'
          ? [
              {
                time: `2026-0${(i % 8) + 1}-2${i % 9} 10:00`,
                action: 'ASSIGN',
                desc: '下发责任单位',
                user: '市局',
              },
            ]
          : []),
        ...(['inProgress', 'verify', 'rejected', 'closed'].includes(status)
          ? [
              {
                time: `2026-0${(i % 8) + 1}-2${i % 9} 11:30`,
                action: 'PROGRESS',
                desc: `填报整改进度（当前 ${progress}%）`,
                user: '责任单位',
              },
            ]
          : []),
        ...(status === 'verify' || status === 'closed'
          ? [
              {
                time: `2026-0${(i % 8) + 1}-2${(i % 9) + 1} 14:00`,
                action: 'SUBMIT',
                desc: '提交验收申请',
                user: '责任单位',
              },
            ]
          : []),
        ...(status === 'rejected'
          ? [
              {
                time: `2026-0${(i % 8) + 1}-2${(i % 9) + 1} 14:00`,
                action: 'SUBMIT',
                desc: '提交验收申请',
                user: '责任单位',
              },
              {
                time: `2026-0${(i % 8) + 1}-2${(i % 9) + 2} 15:00`,
                action: 'REJECT',
                desc: '整改措施落实不到位，请补充佐证材料后重新提交',
                user: '核查组',
              },
            ]
          : []),
        ...(status === 'closed'
          ? [
              {
                time: `2026-0${(i % 8) + 1}-2${(i % 9) + 2} 15:00`,
                action: 'ACCEPT',
                desc: '验收通过，销号',
                user: '市局',
              },
            ]
          : []),
      ],
    })
  }
  return list
}

export const mockProblems: Problem[] = buildSeedProblems()

/** Mock 用户（三角色） */
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    realName: '系统管理员',
    role: 'admin' as const,
    dept: '百色市生态环境局',
  },
  {
    id: 2,
    username: 'kehu',
    password: '123456',
    realName: '科室人员',
    role: 'operator' as const,
    dept: '右江区生态环境局',
    regionCode: '451002',
    regionName: '右江区',
  },
  {
    id: 3,
    username: 'handler',
    password: '123456',
    realName: '整改责任人',
    role: 'responsible' as const,
    dept: '田阳区综合执法大队',
    regionCode: '451003',
    regionName: '田阳区',
  },
]
