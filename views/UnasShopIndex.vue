<script setup lang="ts">
import { AdminLayout, EditButton, DeleteButton, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import {
  unasService,
  type UnasShop,
} from '../services/unasService'

const router = useRouter()
const shops = ref<UnasShop[]>([])
const isLoading = ref(false)

const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<UnasShop>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'name', label: 'Név', sortable: true },
  { key: 'domain', label: 'Domain', sortable: true },
  { key: 'warehouse_name', label: 'Raktár', sortable: false },
  { key: 'enabled', label: 'Aktív', sortable: true, width: '100px' },
]

const fetchShops = async (params: any = {}) => {
  try {
    isLoading.value = true
    const response = await unasService.getShops(params)
    shops.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a boltok betöltése közben:', error)
    toastService.error('Nem sikerült betölteni a boltokat.')
  } finally {
    isLoading.value = false
  }
}

const editShop = (id: number) => {
  router.push(`/admin/unas-shops/${id}/edit`)
}

const deleteShop = async (shop: UnasShop) => {
  if (!shop.id) return
  try {
    await unasService.deleteShop(shop.id)
    toastService.success('Bolt törölve.')
    await fetchShops()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

onMounted(async () => {
  await fetchShops()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS Boltok">
    <DataTable
      :columns="columns"
      :data="shops"
      :loading="isLoading"
      :pagination="pagination"
      @fetch="fetchShops"
    >
      <template #actions>
        <CreateButton to="/admin/unas-shops/create">
          Új UNAS bolt
        </CreateButton>
      </template>

      <template #enabled="{ row }">
        <span :class="row.enabled ? 'text-green-600' : 'text-red-600'">
          {{ row.enabled ? 'Igen' : 'Nem' }}
        </span>
      </template>
      <template #row-actions="{ row }">
        <EditButton @click="editShop(row.id)" />
        <DeleteButton @confirm="deleteShop(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
