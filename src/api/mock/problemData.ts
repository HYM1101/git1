/**
 * Mock 数据种子 —— 问题台账（与 demo-flow.js 数据结构对齐）
 * 仅在 VITE_MOCK=on 时加载，后端就绪后删除此文件。
 */
import type { Problem } from '@/types'
import { REGIONS } from '@/constants'

/** 生成种子问题列表 */
function buildSeedProblems(): Problem[] {
  const sources = ['中央环保督察', '省级专项检查', '日常巡查', '群众信访', '遥感发现', '企业自查']
  const pollutions = ['大气', '水', '土壤', '固废', '噪声', '生态']
  const statuses: Problem['status'][] = ['pending', 'inProgress', 'verify', 'rejected', 'closed']
  const levels: Problem['importantLevel'][] = ['red', 'orange', 'green']
  const warnings: Problem['warningLevel'][] = ['red', 'orange', 'yellow', 'green']

  const list: Problem[] = []
  for (let i = 1; i <= 60; i++) {
    const region = REGIONS[i % REGIONS.length]
    const status = statuses[i % statuses.length]
    const importantLevel = levels[i % levels.length]
    const warningLevel = warnings[i % warnings.length]
    const source = sources[i % sources.length]
    const pollutionType = pollutions[i % pollutions.length]

    // 截止日期：部分超期、部分未到期
    const offset = (i % 200) - 100 // -100~99 天偏移
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const deadline = d.toISOString().slice(0, 10)
    const overdueDays = -offset

    list.push({
      id: `P${String(i).padStart(4, '0')}`,
      problemNo: `BS-2026-${String(i).padStart(4, '0')}`,
      title: `${region.name}-${pollutionType}污染问题-${i}`,
      source,
      regionCode: region.code,
      regionName: region.name,
      pollutionType,
      responsibleUnit: i % 3 === 0 ? `${region.name}生态环境局` : `${region.name}综合执法大队`,
      responsiblePerson: `张${['伟', '芳', '强', '敏', '杰', '丽'][i % 6]}`,
      deadline,
      importantLevel,
      sourceGrade: i % 3 === 0 ? '高' : i % 3 === 1 ? '中' : '低',
      riskGrade: i % 4 === 0 ? '高' : i % 4 === 1 ? '中' : '低',
      warningLevel,
      overdueDays,
      status,
      progress: status === 'closed' ? 100 : status === 'verify' ? 100 : (i * 7) % 100,
      riskTags:
        i % 5 === 0 ? ['重金属污染'] : i % 5 === 1 ? ['监测超标'] : i % 5 === 2 ? ['重复信访'] : [],
      lng: 105.5 + (i % 12) * 0.3,
      lat: 23.8 + (i % 12) * 0.25,
      createdAt: `2026-0${(i % 8) + 1}-1${i % 9}`,
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
    password: 'admin123',
    realName: '系统管理员',
    role: 'admin' as const,
    dept: '百色市生态环境局',
  },
  {
    id: 2,
    username: 'operator',
    password: 'op123',
    realName: '李运维',
    role: 'operator' as const,
    dept: '右江区生态环境局',
    regionCode: '451000',
    regionName: '右江区',
  },
  {
    id: 3,
    username: 'resp',
    password: 'resp123',
    realName: '张责任',
    role: 'responsible' as const,
    dept: '田阳区综合执法大队',
    regionCode: '451002',
    regionName: '田阳区',
  },
]
