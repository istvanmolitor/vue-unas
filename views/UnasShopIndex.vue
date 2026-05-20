<script setup lang="ts">
import { AdminLayout, EditButton, DeleteButton, toastService, InputError } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import SaveButton from '@admin/components/ui/button/SaveButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Select from '@admin/components/ui/Select.vue'
import { reactive, ref, onMounted } from 'vue'
import {
  unasService,
  type UnasShop,
} from '../services/unasService'

const shops = ref<UnasShop[]>([])
const warehouses = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const editingShopId = ref<number | null>(null)
const errors = ref<Record<string, string[]>>({})

const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const form = reactive<Partial<UnasShop>>({
  name: '',
  domain: '',
  api_key: '',
  enabled: true,
  warehouse_id: null,
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

const fetchOptions = async () => {
  try {
    const response = await unasService.getShopOptions()
    warehouses.value = response.data.warehouses
  } catch (error) {
    console.error('Hiba az opciók betöltése közben:', error)
  }
}

const resetForm = () => {
  form.name = ''
  form.domain = ''
  form.api_key = ''
  form.enabled = true
  form.warehouse_id = null
  editingShopId.value = null
  errors.value = {}
}

const submit = async () => {
  try {
    isSaving.value = true
    errors.value = {}

    if (editingShopId.value === null) {
      await unasService.createShop(form)
      toastService.success('Bolt létrehozva.')
    } else {
      await unasService.updateShop(editingShopId.value, form)
      toastService.success('Bolt frissítve.')
    }

    await fetchShops()
    resetForm()
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors ?? {}
      toastService.error('Ellenőrizd az adatokat.')
      return
    }
    toastService.error('A mentés sikertelen.')
  } finally {
    isSaving.value = false
  }
}

const startEdit = (shop: UnasShop) => {
  editingShopId.value = shop.id ?? null
  form.name = shop.name
  form.domain = shop.domain
  form.api_key = shop.api_key
  form.enabled = shop.enabled
  form.warehouse_id = shop.warehouse_id
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
  await fetchOptions()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS Boltok">
    <Card class="mb-4">
      <CardHeader>
        <CardTitle>{{ editingShopId ? 'Bolt szerkesztése' : 'Új bolt' }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Név</Label>
            <Input id="name" v-model="form.name" />
            <InputError :message="errors.name" />
          </div>
          <div class="space-y-2">
            <Label for="domain">Domain</Label>
            <Input id="domain" v-model="form.domain" />
            <InputError :message="errors.domain" />
          </div>
          <div class="space-y-2">
            <Label for="api_key">API Kulcs</Label>
            <Input id="api_key" v-model="form.api_key" type="password" />
            <InputError :message="errors.api_key" />
          </div>
          <div class="space-y-2">
            <Label for="warehouse_id">Raktár</Label>
            <Select
              id="warehouse_id"
              v-model="form.warehouse_id"
              :options="warehouses"
              label-field="name"
              value-field="id"
              placeholder="Válassz raktárt..."
            />
            <InputError :message="errors.warehouse_id" />
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="enabled" v-model:checked="form.enabled" />
            <Label for="enabled">Aktív</Label>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <SaveButton :is-saving="isSaving" @click="submit"> Mentés </SaveButton>
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm"
            @click="resetForm"
          >
            Mégse
          </button>
        </div>
      </CardContent>
    </Card>

    <DataTable
      :columns="columns"
      :data="shops"
      :loading="isLoading"
      :pagination="pagination"
      @fetch="fetchShops"
    >
      <template #enabled="{ row }">
        <span :class="row.enabled ? 'text-green-600' : 'text-red-600'">
          {{ row.enabled ? 'Igen' : 'Nem' }}
        </span>
      </template>
      <template #row-actions="{ row }">
        <EditButton @click="startEdit(row)" />
        <DeleteButton @confirm="deleteShop(row)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>
