<script setup lang="ts">
import {
  AdminLayout,
  BackButton,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DeleteButton,
  EditButton,
  Icon,
  LoadingSpinner,
  StatsCard,
  toastService,
} from '@admin'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { unasService, type UnasShop } from '../services/unasService'

const router = useRouter()
const route = useRoute()
const shop = ref<UnasShop | null>(null)
const isLoading = ref(true)

const formattedCreatedAt = computed(() => {
  if (!shop.value?.created_at) {
    return '-'
  }

  return new Date(shop.value.created_at).toLocaleString('hu-HU')
})

const formattedUpdatedAt = computed(() => {
  if (!shop.value?.updated_at) {
    return '-'
  }

  return new Date(shop.value.updated_at).toLocaleString('hu-HU')
})

const maskedApiKey = computed(() => {
  const apiKey = shop.value?.api_key

  if (!apiKey) {
    return '-'
  }

  if (apiKey.length <= 4) {
    return '*'.repeat(apiKey.length)
  }

  return `${'*'.repeat(apiKey.length - 4)}${apiKey.slice(-4)}`
})

const fetchShop = async (): Promise<void> => {
  const id = route.params.id as string

  try {
    isLoading.value = true
    const response = await unasService.getShop(id)
    shop.value = response.data.data
  } catch (error) {
    console.error('Hiba a bolt betöltésekor:', error)
    toastService.error('Nem sikerült betölteni a bolt adatait.')
    router.push('/admin/unas-shops')
  } finally {
    isLoading.value = false
  }
}

const deleteShop = async (): Promise<void> => {
  if (!shop.value?.id) {
    return
  }

  try {
    await unasService.deleteShop(shop.value.id)
    toastService.success('Bolt törölve.')
    router.push('/admin/unas-shops')
  } catch (error) {
    console.error('Hiba a bolt törlésekor:', error)
    toastService.error('A törlés sikertelen.')
  }
}

const editShop = (): void => {
  if (!shop.value?.id) {
    return
  }

  router.push({ name: 'admin-unas-shops-edit', params: { id: shop.value.id } })
}

const openActions = (): void => {
  if (!shop.value?.id) {
    return
  }

  router.push({ name: 'admin-unas-shops-actions', params: { id: shop.value.id } })
}

onMounted(async () => {
  await fetchShop()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS bolt megtekintése">
    <div class="mb-4 flex items-center justify-between gap-2">
      <BackButton to="/admin/unas-shops" />

      <div class="flex items-center gap-2" v-if="shop">
        <Button variant="outline" @click="openActions">
          <Icon name="settings" class="mr-2 h-4 w-4" />
          Műveletek
        </Button>
        <EditButton @click="editShop" />
        <DeleteButton @confirm="deleteShop" />
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <LoadingSpinner label="Betöltés..." />
    </div>

    <div v-else-if="shop" class="space-y-6">
      <!-- Dashboard Statistics -->
      <div class="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Termékek"
          :value="shop.shop_products_count ?? 0"
          icon="box"
          color="blue"
        />

        <StatsCard
          title="Kategóriák"
          :value="shop.shop_product_categories_count ?? 0"
          icon="folder"
          color="purple"
        />

        <StatsCard
          title="Paraméterek"
          :value="shop.shop_product_parameters_count ?? 0"
          icon="settings"
          color="orange"
        />

        <StatsCard
          title="Rendelések"
          :value="shop.shop_orders_count ?? 0"
          icon="ShoppingCart"
          color="green"
        />
      </div>

      <!-- Shop Details -->
      <Card>
        <CardHeader>
          <CardTitle>{{ shop.name }}</CardTitle>
          <CardDescription>UNAS bolt részletei</CardDescription>
        </CardHeader>

        <CardContent class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-xs text-muted-foreground">ID</p>
            <p class="font-medium">{{ shop.id }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Aktív</p>
            <p class="font-medium" :class="shop.enabled ? 'text-green-600' : 'text-red-600'">
              {{ shop.enabled ? 'Igen' : 'Nem' }}
            </p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Név</p>
            <p class="font-medium">{{ shop.name }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Domain</p>
            <p class="font-medium">{{ shop.domain }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Raktár</p>
            <p class="font-medium">{{ shop.warehouse_name || '-' }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">API kulcs</p>
            <p class="font-medium">{{ maskedApiKey }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Létrehozva</p>
            <p class="font-medium">{{ formattedCreatedAt }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Utoljára módosítva</p>
            <p class="font-medium">{{ formattedUpdatedAt }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
</template>


