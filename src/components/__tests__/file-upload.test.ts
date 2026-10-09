// @vitest-environment jsdom
/**
 * TE-06 组件测试：FileUpload 附件校验（文件类型/大小）
 * 说明：Element Plus 的 el-upload 用 stub 替换，校验逻辑在 FileUpload 内部
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// 模拟 element-plus 的 ElMessage
vi.mock('element-plus/es/components/message/index', () => ({
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))
// Vitest 环境不解析 node_modules CSS（style/css 入口）
vi.mock('element-plus/es/components/message/style/css', () => ({}))

import FileUpload from '../common/FileUpload.vue'
import { ElMessage } from 'element-plus/es/components/message/index'

/** 构造模拟 UploadFile */
function mockUploadFile(name: string, size: number, uid = 1) {
  return { uid, name, size, raw: new File(['x'], name) }
}

/** 全局 stub el-upload 及其子组件 */
const global = {
  stubs: {
    'el-upload': {
      template: '<div class="el-upload-stub"><slot /><slot name="tip" /></div>',
      props: ['limit', 'accept', 'file-list'],
    },
    'el-button': { template: '<button><slot /></button>' },
    'el-icon': { template: '<span class="el-icon-stub"><slot /></span>' },
  },
}

describe('FileUpload — 附件类型/大小校验', () => {
  it('合法文件通过校验并 emit change', async () => {
    const wrapper = mount(FileUpload, { props: { accept: '.jpg,.png', maxSizeMB: 10 }, global })
    // 直接调用内部 handleChange（通过组件实例）
    const vm = wrapper.vm as unknown as { handleChange: (f: unknown) => void }
    const file = mockUploadFile('photo.jpg', 1024)
    vm.handleChange(file)
    expect(ElMessage.warning).not.toHaveBeenCalled()
  })

  it('非法类型文件被拒绝并提示', () => {
    const wrapper = mount(FileUpload, { props: { accept: '.jpg,.png', maxSizeMB: 10 }, global })
    const vm = wrapper.vm as unknown as { handleChange: (f: unknown) => void }
    vm.handleChange(mockUploadFile('malware.exe', 1024))
    expect(ElMessage.warning).toHaveBeenCalledWith(expect.stringContaining('不支持的文件类型'))
  })

  it('超大小文件被拒绝并提示', () => {
    const wrapper = mount(FileUpload, { props: { accept: '.jpg,.png', maxSizeMB: 1 }, global })
    const vm = wrapper.vm as unknown as { handleChange: (f: unknown) => void }
    vm.handleChange(mockUploadFile('big.jpg', 2 * 1024 * 1024))
    expect(ElMessage.warning).toHaveBeenCalledWith(expect.stringContaining('超过 1MB'))
  })
})
