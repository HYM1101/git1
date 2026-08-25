// @vitest-environment jsdom
/**
 * TE-06 组件测试：LevelTag / WarningTag 双标签渲染
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LevelTag from '../common/LevelTag.vue'
import WarningTag from '../common/WarningTag.vue'

describe('LevelTag — 重要等级标签', () => {
  it('red → 显示"红色重大"与红色系', () => {
    const wrapper = mount(LevelTag, { props: { level: 'red' } })
    expect(wrapper.text()).toContain('红色重大')
    // jsdom 将 hex 规范化为 rgb/rgba
    expect(wrapper.attributes('style')).toContain('229, 57, 53')
  })

  it('orange → 显示"橙色较大"', () => {
    const wrapper = mount(LevelTag, { props: { level: 'orange' } })
    expect(wrapper.text()).toContain('橙色较大')
  })

  it('green → 显示"绿色常规"', () => {
    const wrapper = mount(LevelTag, { props: { level: 'green' } })
    expect(wrapper.text()).toContain('绿色常规')
  })
})

describe('WarningTag — 预警等级标签', () => {
  it('red → 显示"红色三级预警"与红色圆点', () => {
    const wrapper = mount(WarningTag, { props: { level: 'red' } })
    expect(wrapper.text()).toContain('红色三级预警')
    const dot = wrapper.find('.dot')
    expect(dot.attributes('style')).toContain('229, 57, 53')
  })

  it('green → 显示"正常"', () => {
    const wrapper = mount(WarningTag, { props: { level: 'green' } })
    expect(wrapper.text()).toContain('正常')
  })

  it('yellow → 显示"黄色一级预警"', () => {
    const wrapper = mount(WarningTag, { props: { level: 'yellow' } })
    expect(wrapper.text()).toContain('黄色一级预警')
  })
})
