<script setup lang="ts">
import { AdminLayout, BackButton, toastService, InputError, LoadingSpinner } from '@admin'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Select from '@admin/components/ui/Select.vue'
import { FormButtons } from '@admin'
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import { unasService, type UnasShop } from '../services/unasService'

const router = useRouter()
const route = useRoute()
const isSaving = ref(false)
const isLoading = ref(true)
const warehouses = ref<{ value: number; label: string }[]>([])
const errors = ref<Record<string, string[]>>({})

const form = reactive<Partial<UnasShop>>({
  name: '',
  domain: '',
  api_key: '',
  enabled: true,
  warehouse_id: null,
})

const fetchOptions = async () => {
  try {
    const response = await unasService.getShopOptions()
    warehouses.value = response.data.warehouses.map((warehouse: { id: number; name: string }) => ({
      value: warehouse.id,
      label: warehouse.name,
    }))
  } catch (error) {
    console.error('Hiba az opciók betöltése közben:', error)
  }
}

const fetchShop = async () => {
  const id = route.params.id as string
  try {
    isLoading.value = true
    const { data } = await unasService.getShop(id)
    const shop = data.data

    form.name = shop.name
    form.domain = shop.domain
    form.api_key = shop.api_key
    form.enabled = shop.enabled
    form.warehouse_id = shop.warehouse_id
  } catch (error) {
    console.error('Hiba a bolt betöltésekor:', error)
    toastService.error('Nem sikerült betölteni a bolt adatait.')
    router.push('/admin/unas-shops')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const id = route.params.id as string
  try {
    isSaving.value = true
    errors.value = {}
    await unasService.updateShop(Number(id), form)
    toastService.success('Bolt sikeresen frissítve!')
    router.push('/admin/unas-shops')
  } catch (error: any) {
    console.error('Hiba a bolt frissítésekor:', error)
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      toastService.error('Kérjük, javítsd a hibaüzeneteket.')
    } else {
      toastService.error('Hiba történt a mentés során.')
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await fetchOptions()
  await fetchShop()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS bolt szerkesztése">
    <div class="flex items-center justify-between space-y-2 mb-4">
      <BackButton to="/admin/unas-shops" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-if="!isLoading">
      <CardHeader>
        <CardTitle>Bolt adatai</CardTitle>
        <CardDescription>Módosítsd az UNAS bolt adatait.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Név *</Label>
            <Input id="name" v-model="form.name" placeholder="Bolt neve" />
            <InputError :message="errors.name" />
          </div>
          <div class="space-y-2">
            <Label for="domain">Domain *</Label>
            <Input id="domain" v-model="form.domain" placeholder="example.unas.hu" />
            <InputError :message="errors.domain" />
          </div>
          <div class="space-y-2">
            <Label for="api_key">API Kulcs *</Label>
            <Input id="api_key" v-model="form.api_key" type="password" placeholder="API kulcs (hagyd üresen, ha nem változik)" />
            <InputError :message="errors.api_key" />
          </div>
          <div class="space-y-2">
            <Label for="warehouse_id">Raktár</Label>
            <Select
              id="warehouse_id"
              v-model.number="form.warehouse_id"
              :options="warehouses"
              required
              placeholder="Válassz raktárt..."
            />
            <InputError :message="errors.warehouse_id" />
          </div>
          <div class="flex items-center gap-2 pt-2">
            <Checkbox id="enabled" v-model:checked="form.enabled" />
            <Label for="enabled">Aktív</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/unas-shops')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
