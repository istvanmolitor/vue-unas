<script setup lang="ts">
import { AdminLayout, ShowButton, EditButton, DeleteButton, toastService } from '@admin'
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

const columns = ref<Column[]>([])

const fetchShops = async (params: any = {}) => {
  try {
    isLoading.value = true
    const response = await unasService.getShops(params)
    shops.value = response.data.data
    pagination.value = response.data.meta
    columns.value = (response.data.columns ?? []) as Column[]
  } catch (error) {
    console.error('Hiba a boltok betöltése közben:', error)
    toastService.error('Nem sikerült betölteni a boltokat.')
  } finally {
    isLoading.value = false
  }
}

const editShop = (id?: number) => {
  if (!id) {
    return
  }

  router.push({ name: 'admin-unas-shops-edit', params: { id } })
}

const showShop = (id?: number) => {
  if (!id) {
    return
  }

  router.push({ name: 'admin-unas-shops-show', params: { id } })
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
        <ShowButton @click="showShop(row.id)" />
        <EditButton @click="editShop(row.id)" />
        <DeleteButton @confirm="deleteShop(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
