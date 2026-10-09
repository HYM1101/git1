/**
 * 路由配置 —— 10 个业务页面 + 登录页，全部懒加载
 * 路由守卫：无 Token 跳登录页（redirect 记录来源路径）
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    redirect: '/workbench',
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('@/views/workbench/Workbench.vue'),
    meta: { title: '工作台' },
  },
  {
    path: '/ledger',
    name: 'LedgerList',
    component: () => import('@/views/ledger/LedgerList.vue'),
    meta: { title: '问题台账' },
  },
  {
    path: '/files',
    name: 'FileManagement',
    component: () => import('@/views/files/FileManagement.vue'),
    meta: { title: '文件管理' },
  },
  {
    path: '/problem/input',
    name: 'ProblemInput',
    component: () => import('@/views/problem/ProblemInput.vue'),
    meta: { title: '问题录入', roles: ['admin', 'operator'] },
  },
  {
    path: '/problem/:id',
    name: 'ProblemDetail',
    component: () => import('@/views/problem/ProblemDetail.vue'),
    meta: { title: '问题详情' },
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/schedule/Schedule.vue'),
    meta: { title: '进度管理' },
  },
  {
    path: '/warning',
    name: 'WarningCenter',
    component: () => import('@/views/warning/WarningCenter.vue'),
    meta: { title: '预警中心' },
  },
  {
    path: '/gis',
    name: 'GisMap',
    component: () => import('@/views/gis/GisMap.vue'),
    meta: { title: '空间分析' },
  },
  {
    path: '/analysis',
    name: 'AnalysisBoard',
    component: () => import('@/views/analysis/AnalysisBoard.vue'),
    meta: { title: '统计分析' },
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/views/admin/AdminPanel.vue'),
    meta: { title: '系统管理', roles: ['admin'] },
  },
  // 兜底 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404', public: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// ── 全局前置守卫 ──
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 生态环境问题闭环管理系统`
    : '生态环境问题闭环管理系统'

  // 公开页面（登录、404）直接放行
  if (to.meta.public) {
    next()
    return
  }

  // 未登录 → 跳登录页
  if (!userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 角色权限校验
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && !requiredRoles.includes(userStore.role || '')) {
    next('/workbench')
    return
  }

  next()
})

export default router
