<template>
  <!-- 全局注入 Element Plus 中文语言包（按需引入模式下 ConfigProvider 统一 locale） -->
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
// 根组件：仅 router-view 出口 + Element Plus 中文 locale
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>
