<script setup lang="ts">
import { AdminLayout, ShowButton, EditButton, DeleteButton, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import {
  unasService,
  type UnasShop,
} from '../services/unasService'

const router = useRouter()
const table = ref()

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
    table.value?.refresh()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}
</script>

<template>
  <AdminLayout pageTitle="UNAS Boltok">
    <DataTable
      ref="table"
      url="/api/unas/shops"
    >
      <template #actions>
        <CreateButton to="/admin/unas-shops/create">
          Új UNAS bolt
        </CreateButton>
      </template>

      <template #enabled="{ row }">
        <span :class="(row as any).enabled ? 'text-green-600' : 'text-red-600'">
          {{ (row as any).enabled ? 'Igen' : 'Nem' }}
        </span>
      </template>
      <template #row-actions="{ row }">
        <ShowButton @click="showShop((row as any).id)" />
        <EditButton @click="editShop((row as any).id)" />
        <DeleteButton @confirm="deleteShop(row as UnasShop)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
