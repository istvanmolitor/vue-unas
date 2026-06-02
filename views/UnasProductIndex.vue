<script setup lang="ts">
import { AdminLayout, DeleteButton, EditButton, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Icon from '@admin/components/ui/Icon.vue'
import Select from '@admin/components/ui/Select.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import {
  unasService,
  type UnasProduct,
  type UnasShop,
} from '../services/unasService'

const router = useRouter()
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
  { key: 'main_image_url', label: 'Kép', sortable: false, width: '80px' },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'name', label: 'Termék név', sortable: false },
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

const editProduct = (id: number) => {
  router.push(`/admin/unas-products/${id}/edit`)
}

const getProductDisplayName = (product: UnasProduct): string => {
  const directName = product.name?.trim()
  if (directName) {
    return directName
  }

  const translatedName = Object.values(product.translations ?? {}).find((translation) => translation?.name?.trim())?.name?.trim()
  if (translatedName) {
    return translatedName
  }

  return product.product_title?.trim() || '-'
}

const formatPrice = (price: number): string => {
  return `${Math.trunc(price).toLocaleString('hu-HU')} Ft`
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
      <template #main_image_url="{ row }">
        <div v-if="row.main_image_url" class="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
          <img :src="row.main_image_url" :alt="getProductDisplayName(row) || row.sku" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-12 h-12 rounded bg-gray-50 flex items-center justify-center text-gray-300">
          <Icon name="Image" :size="20" />
        </div>
      </template>

      <template #name="{ row }">
        {{ getProductDisplayName(row) }}
      </template>

      <template #price="{ row }">
        {{ formatPrice(row.price) }}
      </template>

      <template #stock="{ row }">
        {{ row.stock }} {{ row.product_unit_name || row.product_unit_short_name || '' }}
      </template>

      <template #actions>
        <CreateButton to="/admin/unas-products/create">
          Új UNAS termék
        </CreateButton>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editProduct(row.id)" />
        <DeleteButton @confirm="deleteProduct(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
