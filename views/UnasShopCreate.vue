<script setup lang="ts">
import { AdminLayout, BackButton, toastService, InputError } from '@admin'
import InputField from '@admin/components/ui/InputField.vue'
import CheckboxField from '@admin/components/ui/CheckboxField.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Select from '@admin/components/ui/Select.vue'
import { FormButtons } from '@admin'
import { useRouter } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import { unasService, type UnasShop } from '../services/unasService'

const router = useRouter()
const isSaving = ref(false)
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

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}
    await unasService.createShop(form)
    toastService.success('Bolt sikeresen létrehozva!')
    router.push('/admin/unas-shops')
  } catch (error: any) {
    console.error('Hiba a bolt létrehozásakor:', error)
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

onMounted(() => {
  fetchOptions()
})
</script>

<template>
  <AdminLayout pageTitle="Új UNAS bolt">
    <div class="flex items-center justify-between space-y-2 mb-4">
      <BackButton to="/admin/unas-shops" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Bolt adatai</CardTitle>
        <CardDescription>Add meg az új UNAS bolt adatait.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <InputField id="name" label="Név" v-model="form.name" placeholder="Bolt neve" :required="true" :errors="errors.name" />
          <InputField id="domain" label="Domain" v-model="form.domain" placeholder="example.unas.hu" :required="true" :errors="errors.domain" />
          <InputField id="api_key" label="API Kulcs" v-model="form.api_key" :type="'password'" placeholder="API kulcs" :required="true" :errors="errors.api_key" />
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
          <div class="pt-2">
            <CheckboxField id="enabled" label="Aktív" v-model="form.enabled" />
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
