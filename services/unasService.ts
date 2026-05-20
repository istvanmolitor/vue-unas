import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export interface UnasShop {
  id?: number
  enabled: boolean
  domain: string
  name: string
  api_key: string
  warehouse_id: number | null
  warehouse_name?: string
  created_at?: string
  updated_at?: string
}

export interface UnasProduct {
  id: number
  sku: string
  unas_shop_id: number
  shop_name?: string
  product_id: number | null
  product_title?: string
  price: number
  stock: number
  remote_id?: string
  changed: boolean
  created_at?: string
}

export interface UnasProductCategory {
  id: number
  unas_shop_id: number
  shop_name?: string
  parent_id: number | null
  parent_name?: string
  name: string
  title: string
  display_page: boolean
  display_menu: boolean
  remote_id?: string
  changed: boolean
  created_at?: string
}

export interface UnasProductParameter {
  id: number
  unas_shop_id: number
  shop_name?: string
  name: string
  type: string
  language_id: number | null
  language_name?: string
  order: number
  remote_id?: string
  changed: boolean
  created_at?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface SingleResponse<T> {
  data: T
}

export const unasService = {
  // Shops
  getShops(params?: any) {
    return api.get<PaginatedResponse<UnasShop>>('/api/unas/shops', { params })
  },
  getShopOptions() {
    return api.get<{ warehouses: any[] }>('/api/unas/shops/options')
  },
  createShop(payload: Partial<UnasShop>) {
    return api.post<SingleResponse<UnasShop>>('/api/unas/shops', payload)
  },
  updateShop(id: number, payload: Partial<UnasShop>) {
    return api.put<SingleResponse<UnasShop>>(`/api/unas/shops/${id}`, payload)
  },
  deleteShop(id: number) {
    return api.delete(`/api/unas/shops/${id}`)
  },

  // Products
  getProducts(params?: any) {
    return api.get<PaginatedResponse<UnasProduct>>('/api/unas/products', { params })
  },
  getProduct(id: number) {
    return api.get<SingleResponse<UnasProduct>>(`/api/unas/products/${id}`)
  },
  deleteProduct(id: number) {
    return api.delete(`/api/unas/products/${id}`)
  },

  // Categories
  getCategories(params?: any) {
    return api.get<PaginatedResponse<UnasProductCategory>>('/api/unas/categories', { params })
  },
  getCategory(id: number) {
    return api.get<SingleResponse<UnasProductCategory>>(`/api/unas/categories/${id}`)
  },
  deleteCategory(id: number) {
    return api.delete(`/api/unas/categories/${id}`)
  },

  // Parameters
  getParameters(params?: any) {
    return api.get<PaginatedResponse<UnasProductParameter>>('/api/unas/parameters', { params })
  },
  getParameter(id: number) {
    return api.get<SingleResponse<UnasProductParameter>>(`/api/unas/parameters/${id}`)
  },
  deleteParameter(id: number) {
    return api.delete(`/api/unas/parameters/${id}`)
  },
}
