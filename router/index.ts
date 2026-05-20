import type { RouteRecordRaw } from 'vue-router'

const unasRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/unas-shops',
    name: 'admin-unas-shops',
    component: () => import('../views/UnasShopIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-products',
    name: 'admin-unas-products',
    component: () => import('../views/UnasProductIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-categories',
    name: 'admin-unas-categories',
    component: () => import('../views/UnasProductCategoryIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-parameters',
    name: 'admin-unas-parameters',
    component: () => import('../views/UnasProductParameterIndex.vue'),
    meta: { requiresAuth: true }
  }
]

export default unasRoutes
