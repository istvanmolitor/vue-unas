<script setup lang="ts">
import { AdminLayout, DeleteButton, ShowButton, toastService } from '@admin'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import {
  unasService,
  type UnasOrder,
  type UnasShop,
} from '../services/unasService'

const shops = ref<UnasShop[]>([])
const selectedShopId = ref<number | null>(null)
const table = ref()
const router = useRouter()

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
    table.value?.refresh()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

const showOrder = (id: number): void => {
  router.push({ name: 'admin-unas-orders-show', params: { id } })
}

onMounted(async () => {
  await fetchShops()
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
      ref="table"
      url="/api/unas/orders"
      :extra-params="selectedShopId ? { unas_shop_id: selectedShopId } : {}"
    >
      <template #cell-created_at="{ row }">
        {{ formatDateTime((row as any).created_at) }}
      </template>

      <template #row-actions="{ row }">
        <ShowButton @click="showOrder((row as any).id)" />
        <DeleteButton @confirm="deleteOrder(row as UnasOrder)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
