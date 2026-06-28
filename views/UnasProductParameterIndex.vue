<script setup lang="ts">
import { AdminLayout, DeleteButton, EditButton, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import {
  unasService,
  type UnasProductParameter,
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

const deleteParameter = async (parameter: UnasProductParameter) => {
  try {
    await unasService.deleteParameter(parameter.id)
    toastService.success('Paraméter törölve.')
    table.value?.refresh()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

const editParameter = (id: number) => {
  router.push(`/admin/unas-parameters/${id}/edit`)
}

onMounted(async () => {
  await fetchShops()
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
      ref="table"
      url="/api/unas/parameters"
      :extra-params="selectedShopId ? { unas_shop_id: selectedShopId } : {}"
    >
      <template #actions>
        <CreateButton to="/admin/unas-parameters/create">
          Új UNAS paraméter
        </CreateButton>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editParameter((row as any).id)" />
        <DeleteButton @confirm="deleteParameter(row as UnasProductParameter)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
