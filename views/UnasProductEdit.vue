<script setup lang="ts">
import { AdminLayout, BackButton, toastService, InputError, LoadingSpinner } from '@admin'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import Textarea from '@admin/components/ui/Textarea.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import { FormButtons } from '@admin'
import { ProductCategorySelect, ProductSelect } from '@product'
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import { normalizeTranslations } from '@language'
import TranslationRepeaterVue from '@language/components/TranslationRepeater.vue'
import { unasService, type UnasProductImage } from '../services/unasService'
import MediaFilePicker from '@media/components/MediaFilePicker.vue'
import { productService, type ProductUnit } from '@product/services/productService'

const TranslationRepeater = TranslationRepeaterVue as any

const router = useRouter()
const route = useRoute()
const isSaving = ref(false)
const isLoading = ref(true)
const availableUnits = ref<ProductUnit[]>([])
const errors = ref<Record<string, string[]>>({})

const form = reactive({
  sku: '',
  unas_shop_id: null as number | null,
  shop_name: '',
  product_id: null as number | null,
  product_unit_id: null as number | null,
  unas_product_category_ids: [] as number[],
  price: 0,
  stock: 0,
  changed: true,
  remote_id: '',
  translations: {} as Record<number, { name: string, description: string }>
})

const images = ref<UnasProductImage[]>([])
const newImageUrl = ref('')
const newImageIsMain = ref(false)
const isAddingImage = ref(false)
const imageErrors = ref<Record<string, string[]>>({})

const fetchProduct = async () => {
  const id = route.params.id as string
  try {
    isLoading.value = true
    const { data } = await unasService.getProduct(id)
    const product = data.data
    form.sku = product.sku
    form.unas_shop_id = product.unas_shop_id
    form.shop_name = product.shop_name || ''
    form.product_id = product.product_id ?? null
    form.product_unit_id = product.product_unit_id ?? null
    form.unas_product_category_ids = product.unas_product_category_ids ?? []
    form.price = product.price
    form.stock = product.stock
    form.changed = product.changed
    form.remote_id = product.remote_id || ''
    form.translations = normalizeTranslations(product.translations, ['name', 'description'])
  } catch (error) {
    console.error('Hiba a termék betöltésekor:', error)
    router.push('/admin/unas-products')
  } finally {
    isLoading.value = false
  }
}

const fetchImages = async () => {
  const id = route.params.id as string
  try {
    const { data } = await unasService.getProductImages(id)
    images.value = data.data
  } catch (error) {
    console.error('Hiba a képek betöltésekor:', error)
  }
}

const fetchProductUnits = async () => {
  try {
    const response = await productService.getCreateData()
    availableUnits.value = response.data.product_units
  } catch (error) {
    console.error('Hiba a mértékegységek betöltésekor:', error)
  }
}

const loadUnasCategories = async (search: string) => {
  if (!form.unas_shop_id) {
    return []
  }

  const categories: Array<{ id: number; parent_id: number | null; name: string }> = []
  let page = 1
  let lastPage = 1

  do {
    const response = await unasService.getCategories({
      unas_shop_id: form.unas_shop_id,
      search: search.trim().length > 0 ? search.trim() : undefined,
      sort: 'name',
      direction: 'asc',
      page,
      per_page: 100,
    })

    const rows = response.data.data
      .filter((category) => Number.isInteger(category.id))
      .map((category) => ({
        id: category.id,
        parent_id: category.parent_id,
        name: String(category.name ?? category.title ?? '').trim() || `#${category.id}`,
      }))

    categories.push(...rows)

    lastPage = response.data.meta?.last_page ?? 1
    page += 1
  } while (page <= lastPage)

  return categories
}

const handleSubmit = async () => {
  const id = route.params.id as string
  try {
    isSaving.value = true
    errors.value = {}
    await unasService.updateProduct(id, {
      sku: form.sku,
      product_id: form.product_id,
      product_unit_id: form.product_unit_id,
      unas_product_category_ids: form.unas_product_category_ids,
      price: form.price,
      stock: form.stock,
      changed: form.changed,
      translations: form.translations
    })
    toastService.success('UNAS termék sikeresen frissítve!')
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

const handleAddImage = async () => {
  if (!newImageUrl.value.trim()) {
    return
  }
  const id = route.params.id as string
  try {
    isAddingImage.value = true
    imageErrors.value = {}
    await unasService.createProductImage(id, {
      image_url: newImageUrl.value.trim(),
      is_main: newImageIsMain.value,
    })
    newImageUrl.value = ''
    newImageIsMain.value = false
    toastService.success('Kép sikeresen hozzáadva!')
    await fetchImages()
  } catch (error: any) {
    if (error.response?.status === 422) {
      imageErrors.value = error.response.data.errors
      toastService.error('Kérjük, javítsd a hibaüzeneteket.')
    } else {
      toastService.error('Hiba történt a kép hozzáadásakor.')
    }
  } finally {
    isAddingImage.value = false
  }
}

const handleSetMain = async (image: UnasProductImage) => {
  const id = route.params.id as string
  try {
    await unasService.updateProductImage(id, image.id, { is_main: true })
    toastService.success('Főkép beállítva!')
    await fetchImages()
  } catch {
    toastService.error('Hiba történt a főkép beállításakor.')
  }
}

const handleDeleteImage = async (image: UnasProductImage) => {
  if (!confirm('Biztosan törlöd a képet?')) {
    return
  }
  const id = route.params.id as string
  try {
    await unasService.deleteProductImage(id, image.id)
    toastService.success('Kép törölve!')
    await fetchImages()
  } catch {
    toastService.error('Hiba történt a kép törlésekor.')
  }
}

onMounted(async () => {
  await Promise.all([fetchProduct(), fetchImages(), fetchProductUnits()])
})
</script>

<template>
  <AdminLayout pageTitle="UNAS termék szerkesztése">
    <div class="flex items-center justify-between space-y-2 mb-4">
      <BackButton to="/admin/unas-products" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <template v-else>
      <Card class="mb-6">
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
              <Input id="unas_shop_id" :model-value="form.shop_name" disabled />
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
              <Input id="remote_id" v-model="form.remote_id" disabled />
            </div>

            <div class="space-y-2">
              <Label for="product_id">Kapcsolt termék (opcionális)</Label>
              <ProductSelect id="product_id" v-model="form.product_id" placeholder="Válassz terméket" />
              <InputError :message="errors.product_id" />
            </div>

            <div class="space-y-2">
              <Label for="product_unit_id">Mértékegység</Label>
              <select
                id="product_unit_id"
                v-model="form.product_unit_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="null">Nincs kiválasztva</option>
                <option v-for="unit in availableUnits" :key="unit.id" :value="unit.id">
                  {{ unit.name }}
                </option>
              </select>
              <InputError :message="errors.product_unit_id" />
            </div>

            <div class="space-y-2 md:col-span-2">
              <Label for="unas_product_category_ids">UNAS kategóriák</Label>
              <ProductCategorySelect
                id="unas_product_category_ids"
                v-model="form.unas_product_category_ids"
                modal-title="UNAS kategóriák kiválasztása"
                placeholder="Válassz UNAS kategóriákat"
                :load-categories="loadUnasCategories"
              />
              <InputError :message="errors.unas_product_category_ids" />
            </div>

            <div class="space-y-4 md:col-span-2 border-t pt-4">
              <h3 class="text-lg font-medium">Fordítások</h3>
              <TranslationRepeater
                v-model="form.translations"
                :fields="['name', 'description']"
              >
                <template #default="{ language, translation }">
                  <div class="space-y-4">
                    <div class="space-y-2">
                      <Label :for="`translation-name-${language.id}`">Név</Label>
                      <Input :id="`translation-name-${language.id}`" v-model="translation.name" />
                      <InputError :message="errors[`translations.${language.id}.name`]" />
                    </div>

                    <div class="space-y-2">
                      <Label :for="`translation-description-${language.id}`">Leírás</Label>
                      <Textarea :id="`translation-description-${language.id}`" v-model="translation.description" rows="4" />
                      <InputError :message="errors[`translations.${language.id}.description`]" />
                    </div>
                  </div>
                </template>
              </TranslationRepeater>
            </div>

            <div class="flex items-center space-x-2 pt-8">
              <Checkbox id="changed" v-model="form.changed" />
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

      <Card>
        <CardHeader>
          <CardTitle>Termék képek</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Image list -->
          <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="image in images"
              :key="image.id"
              class="relative border rounded-lg overflow-hidden group"
              :class="image.is_main ? 'ring-2 ring-blue-500' : ''"
            >
              <img
                :src="image.image_url"
                :alt="'Kép ' + image.id"
                class="w-full h-40 object-cover"
                @error="(e: Event) => ((e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23e5e7eb\'/%3E%3Ctext x=\'50\' y=\'50\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236b7280\' font-size=\'12\'%3EHiba%3C/text%3E%3C/svg%3E')"
              />
              <div v-if="image.is_main" class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                Főkép
              </div>
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  v-if="!image.is_main"
                  type="button"
                  class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                  @click="handleSetMain(image)"
                >
                  Főkép
                </button>
                <button
                  type="button"
                  class="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                  @click="handleDeleteImage(image)"
                >
                  Törlés
                </button>
              </div>
              <div class="p-2 text-xs text-gray-500 truncate">{{ image.image_url }}</div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm">Még nincs kép hozzáadva.</p>

          <!-- Add new image -->
          <div class="border-t pt-4 space-y-3">
            <p class="font-medium text-sm">Új kép hozzáadása</p>
            <MediaFilePicker
              v-model="newImageUrl"
              :accept-types="['image/*']"
              :show-preview="!!newImageUrl"
            />
            <InputError :message="imageErrors.image_url" />
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Checkbox id="new_image_is_main" v-model="newImageIsMain" />
                <Label for="new_image_is_main" class="text-sm">Főkép</Label>
              </div>
              <button
                type="button"
                class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                :disabled="isAddingImage || !newImageUrl.trim()"
                @click="handleAddImage"
              >
                {{ isAddingImage ? 'Hozzáadás...' : 'Hozzáadás' }}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </AdminLayout>
</template>
