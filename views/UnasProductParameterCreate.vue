<script setup lang="ts">
import { AdminLayout, BackButton, toastService, InputError } from '@admin'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Select from '@admin/components/ui/Select.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import { FormButtons } from '@admin'
import { useRouter } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import { unasService, type UnasShop } from '../services/unasService'

const router = useRouter()
const isSaving = ref(false)
const isLoading = ref(false)
const shops = ref<UnasShop[]>([])
const errors = ref<Record<string, string[]>>({})

const form = reactive({
  unas_shop_id: null as number | null,
  name: '',
  type: 'text',
  language_id: null as number | null,
  order: 0,
  changed: true,
  remote_id: ''
})

const parameterTypes = [
  { label: 'Szöveg (text)', value: 'text' },
  { label: 'Hosszú szöveg (textarea)', value: 'textarea' },
  { label: 'Választó (select)', value: 'select' },
  { label: 'Többválasztós (multiple)', value: 'multiple' },
]

const fetchShops = async () => {
  try {
    const response = await unasService.getShops({ per_page: 100 })
    shops.value = response.data.data
  } catch (error) {
    console.error('Hiba a boltok betöltésekor:', error)
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}
    await unasService.createParameter(form as any)
    toastService.success('UNAS paraméter sikeresen létrehozva!')
    router.push('/admin/unas-parameters')
  } catch (error: any) {
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
  fetchShops()
})
</script>

<template>
  <AdminLayout pageTitle="Új UNAS paraméter">
    <div class="flex items-center justify-between space-y-2 mb-4">
      <BackButton to="/admin/unas-parameters" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Paraméter adatai</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="unas_shop_id">Bolt *</Label>
            <Select
              id="unas_shop_id"
              v-model="form.unas_shop_id"
              :options="shops"
              label-field="name"
              value-field="id"
              placeholder="Válassz boltot"
            />
            <InputError :message="errors.unas_shop_id" />
          </div>

          <div class="space-y-2">
            <Label for="name">Név *</Label>
            <Input id="name" v-model="form.name" />
            <InputError :message="errors.name" />
          </div>

          <div class="space-y-2">
            <Label for="type">Típus *</Label>
            <Select
              id="type"
              v-model="form.type"
              :options="parameterTypes"
              label-field="label"
              value-field="value"
            />
            <InputError :message="errors.type" />
          </div>

          <div class="space-y-2">
            <Label for="order">Sorrend *</Label>
            <Input id="order" type="number" v-model.number="form.order" />
            <InputError :message="errors.order" />
          </div>

          <div class="space-y-2">
            <Label for="remote_id">Remote ID (opcionális)</Label>
            <Input id="remote_id" v-model="form.remote_id" />
            <InputError :message="errors.remote_id" />
          </div>

          <div class="flex items-center space-x-2 pt-8">
            <Checkbox id="changed" v-model:checked="form.changed" />
            <Label for="changed">Módosult (szinkronizálandó)</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/unas-parameters')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
