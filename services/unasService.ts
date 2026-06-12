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
  shop_products_count?: number
  shop_product_categories_count?: number
  shop_product_parameters_count?: number
  shop_orders_count?: number
  created_at?: string
  updated_at?: string
}

export interface UnasProduct {
  id: number
  sku: string
  name?: string
  description?: string | null
  unas_shop_id: number
  shop_name?: string
  product_id: number | null
  product_unit_id?: number | null
  unas_product_category_ids?: number[]
  product_unit_name?: string | null
  product_unit_short_name?: string | null
  product_title?: string
  translations?: Record<string, {
    language_id?: number
    name?: string
    description?: string | null
  }>
  main_image_url?: string | null
  price: number
  stock: number
  remote_id?: string
  changed: boolean
  created_at?: string
}

export interface UnasProductImage {
  id: number
  unas_product_id: number
  image_url: string
  is_main: boolean
  sort: number
  created_at?: string
  updated_at?: string
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

export interface UnasOrder {
  id: number
  unas_shop_id: number
  shop_name?: string
  order_id: number
  order_code?: string
  remote_id?: string
  changed: boolean
  created_at?: string
  updated_at?: string
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

export interface ActionResponse {
  message: string
}

export const unasService = {
  // Shops
  getShops(params?: any) {
    return api.get<PaginatedResponse<UnasShop>>('/api/unas/shops', { params })
  },
  getShopOptions() {
    return api.get<{ warehouses: any[] }>('/api/unas/shops/options')
  },
  getShop(id: string | number) {
    return api.get<SingleResponse<UnasShop>>(`/api/unas/shops/${id}`)
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
  downloadShopProducts(id: string | number) {
    return api.post<ActionResponse>(`/api/unas/shops/${id}/actions/download-products`)
  },
  downloadShopCategories(id: string | number) {
    return api.post<ActionResponse>(`/api/unas/shops/${id}/actions/download-categories`)
  },
  downloadShopParameters(id: string | number) {
    return api.post<ActionResponse>(`/api/unas/shops/${id}/actions/download-parameters`)
  },
  downloadShopOrders(id: string | number) {
    return api.post<ActionResponse>(`/api/unas/shops/${id}/actions/download-orders`)
  },
  clearShopProducts(id: string | number) {
    return api.delete<ActionResponse>(`/api/unas/shops/${id}/actions/clear-products`)
  },
  clearShopCategories(id: string | number) {
    return api.delete<ActionResponse>(`/api/unas/shops/${id}/actions/clear-categories`)
  },
  clearShopParameters(id: string | number) {
    return api.delete<ActionResponse>(`/api/unas/shops/${id}/actions/clear-parameters`)
  },
  clearShopOrders(id: string | number) {
    return api.delete<ActionResponse>(`/api/unas/shops/${id}/actions/clear-orders`)
  },

  // Products
  getProducts(params?: any) {
    return api.get<PaginatedResponse<UnasProduct>>('/api/unas/products', { params })
  },
  getProduct(id: string | number) {
    return api.get<SingleResponse<UnasProduct>>(`/api/unas/products/${id}`)
  },
  createProduct(payload: Partial<UnasProduct>) {
    return api.post<SingleResponse<UnasProduct>>('/api/unas/products', payload)
  },
  updateProduct(id: string | number, payload: Partial<UnasProduct>) {
    return api.put<SingleResponse<UnasProduct>>(`/api/unas/products/${id}`, payload)
  },
  deleteProduct(id: number) {
    return api.delete(`/api/unas/products/${id}`)
  },

  // Product Images
  getProductImages(productId: string | number) {
    return api.get<{ data: UnasProductImage[] }>(`/api/unas/products/${productId}/images`)
  },
  createProductImage(productId: string | number, payload: Partial<UnasProductImage>) {
    return api.post<{ data: UnasProductImage }>(`/api/unas/products/${productId}/images`, payload)
  },
  updateProductImage(productId: string | number, imageId: number, payload: Partial<UnasProductImage>) {
    return api.put<{ data: UnasProductImage }>(`/api/unas/products/${productId}/images/${imageId}`, payload)
  },
  deleteProductImage(productId: string | number, imageId: number) {
    return api.delete(`/api/unas/products/${productId}/images/${imageId}`)
  },

  // Categories
  getCategories(params?: any) {
    return api.get<PaginatedResponse<UnasProductCategory>>('/api/unas/categories', { params })
  },
  getCategory(id: string | number) {
    return api.get<SingleResponse<UnasProductCategory>>(`/api/unas/categories/${id}`)
  },
  createCategory(payload: Partial<UnasProductCategory>) {
    return api.post<SingleResponse<UnasProductCategory>>('/api/unas/categories', payload)
  },
  updateCategory(id: string | number, payload: Partial<UnasProductCategory>) {
    return api.put<SingleResponse<UnasProductCategory>>(`/api/unas/categories/${id}`, payload)
  },
  deleteCategory(id: number) {
    return api.delete(`/api/unas/categories/${id}`)
  },

  // Parameters
  getParameters(params?: any) {
    return api.get<PaginatedResponse<UnasProductParameter>>('/api/unas/parameters', { params })
  },
  getParameter(id: string | number) {
    return api.get<SingleResponse<UnasProductParameter>>(`/api/unas/parameters/${id}`)
  },
  createParameter(payload: Partial<UnasProductParameter>) {
    return api.post<SingleResponse<UnasProductParameter>>('/api/unas/parameters', payload)
  },
  updateParameter(id: string | number, payload: Partial<UnasProductParameter>) {
    return api.put<SingleResponse<UnasProductParameter>>(`/api/unas/parameters/${id}`, payload)
  },
  deleteParameter(id: number) {
    return api.delete(`/api/unas/parameters/${id}`)
  },

  // Orders
  getOrders(params?: any) {
    return api.get<PaginatedResponse<UnasOrder>>('/api/unas/orders', { params })
  },
  getOrder(id: string | number) {
    return api.get<SingleResponse<UnasOrder>>(`/api/unas/orders/${id}`)
  },
  deleteOrder(id: number) {
    return api.delete(`/api/unas/orders/${id}`)
  },
}
