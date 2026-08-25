/**
 * 重要等级矩阵判定 —— 参数化测试（3×3 全部 9 种组合）
 * 验证：来源等级 × 风险等级 → 红/橙/绿三色，与 LEVEL_MATRIX 定义一致
 */
import { describe, it, expect } from 'vitest'
import {
  calcImportantLevel,
  inferSourceGrade,
  inferRiskGrade,
  inferCategory,
  inferRiskTags,
  LEVEL_MATRIX,
  type Grade,
  type ImportantLevel,
} from '../level'

describe('calcImportantLevel — 3×3 矩阵全覆盖', () => {
  const grades: Grade[] = ['低', '中', '高']

  // 遍历 3×3 全部 9 种组合
  grades.forEach((source) => {
    grades.forEach((risk) => {
      const expected: ImportantLevel = LEVEL_MATRIX[source][risk]
      it(`来源=${source} × 风险=${risk} → ${expected}`, () => {
        const result = calcImportantLevel({ sourceGrade: source, riskGrade: risk })
        expect(result.level).toBe(expected)
        expect(result.sourceGrade).toBe(source)
        expect(result.riskGrade).toBe(risk)
      })
    })
  })
})

describe('calcImportantLevel — 矩阵值验证', () => {
  it('高×高 应为红色', () => {
    expect(calcImportantLevel({ sourceGrade: '高', riskGrade: '高' }).level).toBe('red')
  })
  it('高×中 应为红色', () => {
    expect(calcImportantLevel({ sourceGrade: '高', riskGrade: '中' }).level).toBe('red')
  })
  it('中×高 应为红色', () => {
    expect(calcImportantLevel({ sourceGrade: '中', riskGrade: '高' }).level).toBe('red')
  })
  it('高×低 应为橙色', () => {
    expect(calcImportantLevel({ sourceGrade: '高', riskGrade: '低' }).level).toBe('orange')
  })
  it('中×中 应为橙色', () => {
    expect(calcImportantLevel({ sourceGrade: '中', riskGrade: '中' }).level).toBe('orange')
  })
  it('低×高 应为橙色', () => {
    expect(calcImportantLevel({ sourceGrade: '低', riskGrade: '高' }).level).toBe('orange')
  })
  it('中×低 应为绿色', () => {
    expect(calcImportantLevel({ sourceGrade: '中', riskGrade: '低' }).level).toBe('green')
  })
  it('低×中 应为绿色', () => {
    expect(calcImportantLevel({ sourceGrade: '低', riskGrade: '中' }).level).toBe('green')
  })
  it('低×低 应为绿色', () => {
    expect(calcImportantLevel({ sourceGrade: '低', riskGrade: '低' }).level).toBe('green')
  })
})

describe('inferSourceGrade — 来源层级推断', () => {
  it('中央 → 高', () => {
    expect(inferSourceGrade('中央环保督察')).toBe('高')
  })
  it('省级 → 高', () => {
    expect(inferSourceGrade('省级专项检查')).toBe('高')
  })
  it('市级 → 中', () => {
    expect(inferSourceGrade('市级检查')).toBe('中')
  })
  it('县级 → 低', () => {
    expect(inferSourceGrade('县级巡查')).toBe('低')
  })
  it('空值 → 低', () => {
    expect(inferSourceGrade(undefined)).toBe('低')
  })
})

describe('inferRiskGrade — 风险等级推断', () => {
  it('涉重企业 → 高', () => {
    expect(inferRiskGrade({ category: '涉重企业', pollutionType: '水' })).toBe('高')
  })
  it('尾矿库 → 高', () => {
    expect(inferRiskGrade({ category: '尾矿库' })).toBe('高')
  })
  it('重金属风险标签 → 高', () => {
    expect(inferRiskGrade({ category: '', pollutionType: '大气', riskTags: ['重金属污染'] })).toBe(
      '高',
    )
  })
  it('危废标签 → 高', () => {
    expect(inferRiskGrade({ riskTags: ['危险废物'] })).toBe('高')
  })
  it('散乱污 → 中', () => {
    expect(inferRiskGrade({ category: '散乱污企业' })).toBe('中')
  })
  it('常规水污染 → 中', () => {
    expect(inferRiskGrade({ pollutionType: '水' })).toBe('中')
  })
  it('无匹配 → 低', () => {
    expect(inferRiskGrade({})).toBe('低')
  })
})

describe('calcImportantLevel — 旧数据兼容（sourceLevel 自动推断）', () => {
  it('中央来源 + 高风险类别 → 红', () => {
    const result = calcImportantLevel({ sourceLevel: '中央督察', category: '涉重企业' })
    expect(result.level).toBe('red')
    expect(result.sourceGrade).toBe('高')
    expect(result.riskGrade).toBe('高')
  })
  it('县级来源 + 常规水污染 → 绿', () => {
    const result = calcImportantLevel({ sourceLevel: '县级巡查', pollutionType: '水' })
    expect(result.level).toBe('green')
    expect(result.sourceGrade).toBe('低')
    expect(result.riskGrade).toBe('中')
  })
})

describe('inferCategory — 标题自动推断类别', () => {
  it.each([
    ['某镇垃圾填埋场渗滤液泄漏', '垃圾填埋场'],
    ['尾矿库排水超标', '尾矿库'],
    ['矿区采石场扬尘', '矿山'],
    ['洗砂场废水直排', '矿山'],
    ['电镀厂重金属超标', '涉重企业'],
    ['散乱污企业聚集', '散乱污'],
    ['乡镇供水厂出水异常', '供水厂'],
    ['饮用水水源地污染', '水源地'],
    ['无关键词的普通问题', ''],
    ['', ''],
  ])('标题「%s」→ %s', (title, expected) => {
    expect(inferCategory(title)).toBe(expected)
  })
})

describe('inferRiskTags — 风险标签自动推断', () => {
  it('分类标签：水源地/供水厂 → 水源地风险', () => {
    expect(inferRiskTags({ category: '水源地' })).toContain('水源地风险')
  })
  it('分类标签：垃圾填埋场 → 固废污染', () => {
    expect(inferRiskTags({ category: '垃圾填埋场' })).toContain('固废污染')
  })
  it('分类标签：涉重企业 → 重金属污染', () => {
    expect(inferRiskTags({ category: '涉重企业' })).toContain('重金属污染')
  })
  it('分类标签：散乱污 → 散乱污聚集', () => {
    expect(inferRiskTags({ category: '散乱污' })).toContain('散乱污聚集')
  })
  it('污染类型标签：水 → 水污染', () => {
    expect(inferRiskTags({ pollutionType: '水' })).toContain('水污染')
  })
  it('污染类型标签：大气 → 大气污染', () => {
    expect(inferRiskTags({ pollutionType: '大气' })).toContain('大气污染')
  })
  it('污染类型标签：土壤 → 土壤污染', () => {
    expect(inferRiskTags({ pollutionType: '土壤' })).toContain('土壤污染')
  })
  it('污染类型标签：噪声 → 噪声扰民', () => {
    expect(inferRiskTags({ pollutionType: '噪声' })).toContain('噪声扰民')
  })
  it('污染类型标签：生态 → 生态破坏', () => {
    expect(inferRiskTags({ pollutionType: '生态' })).toContain('生态破坏')
  })
  it('标题关键词：超标/监测 → 监测超标', () => {
    expect(inferRiskTags({ title: '出水口监测超标' })).toContain('监测超标')
  })
  it('标题关键词：信访/投诉 → 信访风险', () => {
    expect(inferRiskTags({ title: '群众信访投诉' })).toContain('信访风险')
  })
  it('标题关键词：暗管/偷排 → 违法排污', () => {
    expect(inferRiskTags({ title: '暗管偷排' })).toContain('违法排污')
  })
  it('标题关键词：危废 → 危废管控', () => {
    expect(inferRiskTags({ title: '危险废物倾倒' })).toContain('危废管控')
  })
  it('标题关键词：渗滤液 → 渗滤液泄漏', () => {
    expect(inferRiskTags({ title: '渗滤液渗漏' })).toContain('渗滤液泄漏')
  })
  it('标题关键词：粉尘/扬尘 → 扬尘污染', () => {
    expect(inferRiskTags({ title: '扬尘污染严重' })).toContain('扬尘污染')
  })
  it('标题关键词：VOC → VOCs污染', () => {
    expect(inferRiskTags({ title: 'VOCs挥发性有机物' })).toContain('VOCs污染')
  })
  it('预警标签：红色 → 红色预警', () => {
    expect(inferRiskTags({ warningLevel: 'red' })).toContain('红色预警')
  })
  it('预警标签：橙色 → 橙色预警', () => {
    expect(inferRiskTags({ warningLevel: 'orange' })).toContain('橙色预警')
  })
  it('超期标签：超期天数', () => {
    expect(inferRiskTags({ overdueDays: 30 })).toContain('超期30天')
  })
  it('无任何特征 → 空数组', () => {
    expect(inferRiskTags({})).toEqual([])
  })
})
