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
import { reactive, ref, onMounted, computed } from 'vue'
import { unasService, type UnasShop } from '../services/unasService'

const router = useRouter()
const isSaving = ref(false)
const shops = ref<UnasShop[]>([])
const errors = ref<Record<string, string[]>>({})

const shopOptions = computed(() => {
  return shops.value
    .filter((shop) => typeof shop.id === 'number')
    .map((shop) => ({
      value: shop.id as number,
      label: shop.name,
    }))
})

const form = reactive({
  sku: '',
  unas_shop_id: null as number | null,
  price: 0,
  stock: 0,
  changed: true,
  remote_id: ''
})

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
    await unasService.createProduct(form as any)
    toastService.success('UNAS termék sikeresen létrehozva!')
    router.push('/admin/unas-products')
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

const handleShopChange = (value: string | number) => {
  const parsedValue = typeof value === 'number' ? value : Number.parseInt(value, 10)
  form.unas_shop_id = Number.isNaN(parsedValue) ? null : parsedValue
}

onMounted(() => {
  fetchShops()
})
</script>

<template>
  <AdminLayout pageTitle="Új UNAS termék">
    <div class="flex items-center justify-between space-y-2 mb-4">
      <BackButton to="/admin/unas-products" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Termék adatai</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="sku">SKU *</Label>
            <Input id="sku" v-model="form.sku" />
            <InputError :message="errors.sku" />
          </div>

          <div class="space-y-2">
            <Label for="unas_shop_id">Bolt *</Label>
            <Select
              id="unas_shop_id"
              :model-value="form.unas_shop_id ?? ''"
              :options="shopOptions"
              placeholder="Válassz boltot"
              @update:model-value="handleShopChange"
            />
            <InputError :message="errors.unas_shop_id" />
          </div>

          <div class="space-y-2">
            <Label for="price">Ár *</Label>
            <Input id="price" type="number" v-model.number="form.price" />
            <InputError :message="errors.price" />
          </div>

          <div class="space-y-2">
            <Label for="stock">Készlet *</Label>
            <Input id="stock" type="number" v-model.number="form.stock" />
            <InputError :message="errors.stock" />
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
          @cancel="router.push('/admin/unas-products')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>


