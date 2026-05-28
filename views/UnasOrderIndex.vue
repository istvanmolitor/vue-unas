<script setup lang="ts">
import { AdminLayout, DeleteButton, toastService } from '@admin'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
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

const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<UnasOrder>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'order_code', label: 'Rendelés kód', sortable: false },
  { key: 'shop_name', label: 'Bolt', sortable: false },
  { key: 'remote_id', label: 'UNAS azonosító', sortable: true },
  { key: 'changed', label: 'Változott', sortable: true },
  { key: 'created_at', label: 'Létrehozva', sortable: true },
]

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
      <template #row-actions="{ row }">
        <DeleteButton @confirm="deleteOrder(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>

