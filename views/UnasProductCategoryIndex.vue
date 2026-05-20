<script setup lang="ts">
import { AdminLayout, DeleteButton, toastService } from '@admin'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
import { ref, onMounted, watch } from 'vue'
import {
  unasService,
  type UnasProductCategory,
  type UnasShop,
} from '../services/unasService'

const categories = ref<UnasProductCategory[]>([])
const shops = ref<UnasShop[]>([])
const selectedShopId = ref<number | null>(null)
const isLoading = ref(false)

const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<UnasProductCategory>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'name', label: 'Név', sortable: true },
  { key: 'parent_name', label: 'Szülő kategória', sortable: false },
  { key: 'shop_name', label: 'Bolt', sortable: false },
  { key: 'remote_id', label: 'Remote ID', sortable: false },
]

const fetchCategories = async (params: any = {}) => {
  try {
    isLoading.value = true
    const fetchParams = { ...params }
    if (selectedShopId.value) {
      fetchParams.unas_shop_id = selectedShopId.value
    }
    const response = await unasService.getCategories(fetchParams)
    categories.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a kategóriák betöltése közben:', error)
    toastService.error('Nem sikerült betölteni a kategóriákat.')
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

const deleteCategory = async (category: UnasProductCategory) => {
  try {
    await unasService.deleteCategory(category.id)
    toastService.success('Kategória törölve.')
    await fetchCategories()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

watch(selectedShopId, () => {
  fetchCategories({ page: 1 })
})

onMounted(async () => {
  await fetchShops()
  await fetchCategories()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS Kategóriák">
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
      :data="categories"
      :loading="isLoading"
      :pagination="pagination"
      @fetch="fetchCategories"
    >
      <template #row-actions="{ row }">
        <DeleteButton @confirm="deleteCategory(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
