<script setup lang="ts">
import { AdminLayout, DeleteButton, EditButton, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import Icon from '@admin/components/ui/Icon.vue'
import Select from '@admin/components/ui/Select.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import {
  unasService,
  type UnasProduct,
  type UnasShop,
} from '../services/unasService'

const router = useRouter()
const table = ref()
const shops = ref<UnasShop[]>([])
const selectedShopId = ref<number | null>(null)

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
    table.value?.refresh()
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

onMounted(async () => {
  await fetchShops()
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
      ref="table"
      url="/api/unas/products"
      :extra-params="selectedShopId ? { unas_shop_id: selectedShopId } : {}"
    >
      <template #main_image_url="{ row }">
        <div v-if="(row as any).main_image_url" class="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
          <img :src="(row as any).main_image_url" :alt="getProductDisplayName(row as UnasProduct) || (row as any).sku" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-12 h-12 rounded bg-gray-50 flex items-center justify-center text-gray-300">
          <Icon name="Image" :size="20" />
        </div>
      </template>

      <template #name="{ row }">
        {{ getProductDisplayName(row as UnasProduct) }}
      </template>

      <template #price="{ row }">
        {{ formatPrice((row as any).price) }}
      </template>

      <template #stock="{ row }">
        {{ (row as any).stock }} {{ (row as any).product_unit_name || (row as any).product_unit_short_name || '' }}
      </template>

      <template #actions>
        <CreateButton to="/admin/unas-products/create">
          Új UNAS termék
        </CreateButton>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editProduct((row as any).id)" />
        <DeleteButton @confirm="deleteProduct(row as UnasProduct)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
