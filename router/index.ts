import type { RouteRecordRaw } from 'vue-router'

const unasRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/unas-shops',
    name: 'admin-unas-shops',
    component: () => import('../views/UnasShopIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-shops/create',
    name: 'admin-unas-shops-create',
    component: () => import('../views/UnasShopCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-shops/:id/edit',
    name: 'admin-unas-shops-edit',
    component: () => import('../views/UnasShopEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-products',
    name: 'admin-unas-products',
    component: () => import('../views/UnasProductIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-products/create',
    name: 'admin-unas-products-create',
    component: () => import('../views/UnasProductCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-products/:id/edit',
    name: 'admin-unas-products-edit',
    component: () => import('../views/UnasProductEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-categories',
    name: 'admin-unas-categories',
    component: () => import('../views/UnasProductCategoryIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-categories/create',
    name: 'admin-unas-categories-create',
    component: () => import('../views/UnasProductCategoryCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-categories/:id/edit',
    name: 'admin-unas-categories-edit',
    component: () => import('../views/UnasProductCategoryEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-parameters',
    name: 'admin-unas-parameters',
    component: () => import('../views/UnasProductParameterIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-parameters/create',
    name: 'admin-unas-parameters-create',
    component: () => import('../views/UnasProductParameterCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unas-parameters/:id/edit',
    name: 'admin-unas-parameters-edit',
    component: () => import('../views/UnasProductParameterEdit.vue'),
    meta: { requiresAuth: true }
  }
]

export default unasRoutes
