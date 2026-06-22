<script setup lang="ts">
import { AdminLayout, DeleteButton, EditButton, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import {
  unasService,
  type UnasProductParameter,
  type UnasShop,
} from '../services/unasService'

const router = useRouter()
const parameters = ref<UnasProductParameter[]>([])
const shops = ref<UnasShop[]>([])
const selectedShopId = ref<number | null>(null)
const isLoading = ref(false)

const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<UnasProductParameter>[] = [
  { key: 'name', label: 'Név', sortable: true },
  { key: 'type', label: 'Típus', sortable: true },
  { key: 'language_name', label: 'Nyelv', sortable: false },
  { key: 'shop_name', label: 'Bolt', sortable: false },
  { key: 'remote_id', label: 'Remote ID', sortable: false },
]

const fetchParameters = async (params: any = {}) => {
  try {
    isLoading.value = true
    const fetchParams = { ...params }
    if (selectedShopId.value) {
      fetchParams.unas_shop_id = selectedShopId.value
    }
    const response = await unasService.getParameters(fetchParams)
    parameters.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a paraméterek betöltése közben:', error)
    toastService.error('Nem sikerült betölteni a paramétereket.')
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

const deleteParameter = async (parameter: UnasProductParameter) => {
  try {
    await unasService.deleteParameter(parameter.id)
    toastService.success('Paraméter törölve.')
    await fetchParameters()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

const editParameter = (id: number) => {
  router.push(`/admin/unas-parameters/${id}/edit`)
}

watch(selectedShopId, () => {
  fetchParameters({ page: 1 })
})

onMounted(async () => {
  await fetchShops()
  await fetchParameters()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS Paraméterek">
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
      :data="parameters"
      :loading="isLoading"
      :pagination="pagination"
      @fetch="fetchParameters"
    >
      <template #actions>
        <CreateButton to="/admin/unas-parameters/create">
          Új UNAS paraméter
        </CreateButton>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editParameter(row.id)" />
        <DeleteButton @confirm="deleteParameter(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
