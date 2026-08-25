// @vitest-environment jsdom
/**
 * TE-06 组件测试：ProgressBar 三扇区进度条
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from '../common/ProgressBar.vue'

describe('ProgressBar — 三扇区进度条', () => {
  it('三扇区均分显示（30/30/40）', () => {
    const wrapper = mount(ProgressBar, {
      props: { total: 100, measures: 30, effect: 30, attachments: 40 },
    })
    expect(wrapper.text()).toContain('100%')
    expect(wrapper.text()).toContain('措施')
    expect(wrapper.text()).toContain('成效')
    expect(wrapper.text()).toContain('佐证')
    // 三个扇区块
    expect(wrapper.findAll('.bar-seg')).toHaveLength(3)
  })

  it('total 100 时显示 done 样式', () => {
    const wrapper = mount(ProgressBar, {
      props: { total: 100, measures: 30, effect: 30, attachments: 40 },
    })
    expect(wrapper.find('.bar-total').classes()).toContain('done')
  })

  it('0 分扇区半透明显示', () => {
    const wrapper = mount(ProgressBar, {
      props: { total: 0, measures: 0, effect: 0, attachments: 0 },
    })
    const segs = wrapper.findAll('.bar-seg')
    segs.forEach((seg) => {
      expect(seg.attributes('style')).toContain('opacity: 0.25')
    })
  })

  it('部分完成时仅激活对应扇区', () => {
    const wrapper = mount(ProgressBar, {
      props: { total: 30, measures: 30, effect: 0, attachments: 0 },
    })
    const segs = wrapper.findAll('.bar-seg')
    expect(segs[0].attributes('style')).toContain('opacity: 1')
    expect(segs[1].attributes('style')).toContain('opacity: 0.25')
  })
})
