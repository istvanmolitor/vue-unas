<script setup lang="ts">
import { AdminLayout, BackButton, toastService, InputError, LoadingSpinner } from '@admin'
import InputField from '@admin/components/ui/InputField.vue'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import Textarea from '@admin/components/ui/Textarea.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Select from '@admin/components/ui/Select.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import UnasProductCategorySelect from '@unas/components/UnasProductCategorySelect.vue'
import { FormButtons } from '@admin'
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import { unasService, type UnasShop, type UnasProductCategory } from '../services/unasService'

const router = useRouter()
const route = useRoute()
const isSaving = ref(false)
const isLoading = ref(true)
const shops = ref<UnasShop[]>([])
const categories = ref<UnasProductCategory[]>([])
const errors = ref<Record<string, string[]>>({})

const form = reactive({
  unas_shop_id: null as number | null,
  parent_id: null as number | null,
  name: '',
  title: '',
  keywords: '',
  description: '',
  display_page: true,
  display_menu: true,
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

const fetchCategories = async () => {
  try {
    const response = await unasService.getCategories({ per_page: 500 })
    categories.value = response.data.data
  } catch (error) {
    console.error('Hiba a kategóriák betöltésekor:', error)
  }
}

const fetchCategory = async () => {
  const id = route.params.id as string
  try {
    isLoading.value = true
    const { data } = await unasService.getCategory(id)
    const category = data.data
    form.unas_shop_id = category.unas_shop_id
    form.parent_id = category.parent_id
    form.name = category.name
    form.title = category.title
    form.keywords = (category as any).keywords || ''
    form.description = (category as any).description || ''
    form.display_page = category.display_page
    form.display_menu = category.display_menu
    form.changed = category.changed
    form.remote_id = category.remote_id || ''
  } catch (error) {
    console.error('Hiba a kategória betöltésekor:', error)
    router.push('/admin/unas-categories')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const id = route.params.id as string
  try {
    isSaving.value = true
    errors.value = {}
    await unasService.updateCategory(id, form as any)
    toastService.success('UNAS kategória sikeresen frissítve!')
    router.push('/admin/unas-categories')
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

onMounted(async () => {
  await fetchShops()
  await fetchCategories()
  await fetchCategory()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS kategória szerkesztése">
    <div class="flex items-center justify-between space-y-2 mb-4">
      <BackButton to="/admin/unas-categories" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Kategória adatai</CardTitle>
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
            <Label for="parent_id">Szülő kategória</Label>
            <UnasProductCategorySelect
              id="parent_id"
              v-model="form.parent_id"
              :categories="categories"
              :exclude-id="Number(route.params.id)"
            />
            <InputError :message="errors.parent_id" />
          </div>

          <InputField id="name" label="Név" v-model="form.name" :required="true" :errors="errors.name" />

          <InputField id="title" label="Cím" v-model="form.title" :required="true" :errors="errors.title" />

          <div class="md:col-span-2">
            <InputField id="keywords" label="Kulcsszavak" v-model="form.keywords" :errors="errors.keywords" />
          </div>

          <div class="space-y-2 md:col-span-2">
            <Label for="description">Leírás</Label>
            <Textarea id="description" v-model="form.description" :rows="3" />
            <InputError :message="errors.description" />
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="display_page" v-model="form.display_page" />
            <Label for="display_page">Megjelenítés az oldalon</Label>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="display_menu" v-model="form.display_menu" />
            <Label for="display_menu">Megjelenítés a menüben</Label>
          </div>

          <InputField id="remote_id" label="Remote ID (opcionális)" v-model="form.remote_id" :errors="errors.remote_id" />

          <div class="flex items-center space-x-2">
            <Checkbox id="changed" v-model="form.changed" />
            <Label for="changed">Módosult (szinkronizálandó)</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/unas-categories')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
