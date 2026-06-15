<script setup lang="ts">
import { AdminLayout, DeleteButton, ShowButton, toastService } from '@admin'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import {
  unasService,
  type UnasOrder,
  type UnasShop,
} from '../services/unasService'

const orders = ref<UnasOrder[]>([])
const shops = ref<UnasShop[]>([])
const selectedShopId = ref<number | null>(null)
const isLoading = ref(false)
const router = useRouter()

const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<UnasOrder>[] = [
  { key: 'shop_name', label: 'Bolt', sortable: false },
  { key: 'order_code', label: 'Rendelés kód', sortable: false },
  { key: 'created_at', label: 'Létrehozva', sortable: true },
]

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '-'
  }

  const match = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/)

  if (match) {
    return `${match[1]} ${match[2]}`
  }

  return value.replace('T', ' ').slice(0, 19)
}

const fetchOrders = async (params: any = {}) => {
  try {
    isLoading.value = true
    const fetchParams = { ...params }
    if (selectedShopId.value) {
      fetchParams.unas_shop_id = selectedShopId.value
    }
    const response = await unasService.getOrders(fetchParams)
    orders.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a megrendelések betöltése közben:', error)
    toastService.error('Nem sikerült betölteni a megrendeléseket.')
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

const deleteOrder = async (order: UnasOrder) => {
  try {
    await unasService.deleteOrder(order.id)
    toastService.success('Megrendelés törölve.')
    await fetchOrders()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

const showOrder = (id: number): void => {
  router.push({ name: 'admin-unas-orders-show', params: { id } })
}

watch(selectedShopId, () => {
  fetchOrders({ page: 1 })
})

onMounted(async () => {
  await fetchShops()
  await fetchOrders()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS Megrendelések">
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
      :data="orders"
      :loading="isLoading"
      :pagination="pagination"
      @fetch="fetchOrders"
    >
      <template #cell-created_at="{ row }">
        {{ formatDateTime(row.created_at) }}
      </template>

      <template #row-actions="{ row }">
        <ShowButton @click="showOrder(row.id)" />
        <DeleteButton @confirm="deleteOrder(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>

