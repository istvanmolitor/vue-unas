<script setup lang="ts">
import {
  AdminLayout,
  BackButton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DeleteButton,
  LoadingSpinner,
  toastService,
} from '@admin'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { unasService, type UnasOrder } from '../services/unasService'

const route = useRoute()
const router = useRouter()

const order = ref<UnasOrder | null>(null)
const isLoading = ref(true)

const formattedCreatedAt = computed((): string => {
  if (!order.value?.created_at) {
    return '-'
  }

  return new Date(order.value.created_at).toLocaleString('hu-HU')
})

const formattedUpdatedAt = computed((): string => {
  if (!order.value?.updated_at) {
    return '-'
  }

  return new Date(order.value.updated_at).toLocaleString('hu-HU')
})

const fetchOrder = async (): Promise<void> => {
  const id = route.params.id as string

  try {
    isLoading.value = true
    const response = await unasService.getOrder(id)
    order.value = response.data.data
  } catch (error) {
    console.error('Hiba a megrendelés betöltésekor:', error)
    toastService.error('Nem sikerült betölteni a megrendelés adatait.')
    router.push('/admin/unas-orders')
  } finally {
    isLoading.value = false
  }
}

const deleteOrder = async (): Promise<void> => {
  if (!order.value?.id) {
    return
  }

  try {
    await unasService.deleteOrder(order.value.id)
    toastService.success('Megrendelés törölve.')
    router.push('/admin/unas-orders')
  } catch (error) {
    console.error('Hiba a megrendelés törlésekor:', error)
    toastService.error('A törlés sikertelen.')
  }
}

onMounted(async () => {
  await fetchOrder()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS megrendelés megtekintése">
    <div class="mb-4 flex items-center justify-between gap-2">
      <BackButton to="/admin/unas-orders" />

      <DeleteButton v-if="order" @confirm="deleteOrder" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <LoadingSpinner label="Betöltés..." />
    </div>

    <Card v-else-if="order">
      <CardHeader>
        <CardTitle>UNAS megrendelés #{{ order.id }}</CardTitle>
        <CardDescription>Megrendelés részletei</CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs text-muted-foreground">ID</p>
          <p class="font-medium">{{ order.id }}</p>
        </div>

        <div>
          <p class="text-xs text-muted-foreground">Bolt</p>
          <p class="font-medium">{{ order.shop_name || '-' }}</p>
        </div>

        <div>
          <p class="text-xs text-muted-foreground">Rendelés kód</p>
          <p class="font-medium">{{ order.order_code || '-' }}</p>
        </div>

        <div>
          <p class="text-xs text-muted-foreground">Rendelés azonosító</p>
          <p class="font-medium">{{ order.order_id }}</p>
        </div>

        <div>
          <p class="text-xs text-muted-foreground">UNAS azonosító</p>
          <p class="font-medium">{{ order.remote_id || '-' }}</p>
        </div>

        <div>
          <p class="text-xs text-muted-foreground">Változott</p>
          <p class="font-medium" :class="order.changed ? 'text-amber-600' : 'text-green-600'">
            {{ order.changed ? 'Igen' : 'Nem' }}
          </p>
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
  </AdminLayout>
</template>

