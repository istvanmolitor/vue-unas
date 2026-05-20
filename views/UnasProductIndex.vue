<script setup lang="ts">
import { AdminLayout, DeleteButton, toastService } from '@admin'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
import { ref, onMounted, watch } from 'vue'
import {
  unasService,
  type UnasProduct,
  type UnasShop,
} from '../services/unasService'

const products = ref<UnasProduct[]>([])
const shops = ref<UnasShop[]>([])
const selectedShopId = ref<number | null>(null)
const isLoading = ref(false)

const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<UnasProduct>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'product_title', label: 'Termék név', sortable: false },
  { key: 'price', label: 'Ár', sortable: true },
  { key: 'stock', label: 'Készlet', sortable: true },
  { key: 'shop_name', label: 'Bolt', sortable: false },
]

const fetchProducts = async (params: any = {}) => {
  try {
    isLoading.value = true
    const fetchParams = { ...params }
    if (selectedShopId.value) {
      fetchParams.unas_shop_id = selectedShopId.value
    }
    const response = await unasService.getProducts(fetchParams)
    products.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a termékek betöltése közben:', error)
    toastService.error('Nem sikerült betölteni a termékeket.')
  } finally {
    isLoading.value = false
  }
}

const fetchShops = async () => {
  try {
    const response = await unasService.getShops({ per_page: 100 })
    shops.value = response.data.data
  } catch (error) {
    console.error('Hiba a boltok betöltése közben:', error)
  }
}

const deleteProduct = async (product: UnasProduct) => {
  try {
    await unasService.deleteProduct(product.id)
    toastService.success('Termék törölve.')
    await fetchProducts()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

watch(selectedShopId, () => {
  fetchProducts({ page: 1 })
})

onMounted(async () => {
  await fetchShops()
  await fetchProducts()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS Termékek">
    <div class="mb-4 flex items-center gap-4">
      <div class="w-64">
        <Select
          v-model="selectedShopId"
          :options="shops"
          label-field="name"
          value-field="id"
          placeholder="Szűrés boltra..."
          clearable
        />
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="products"
      :loading="isLoading"
      :pagination="pagination"
      @fetch="fetchProducts"
    >
      <template #row-actions="{ row }">
        <DeleteButton @confirm="deleteProduct(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
