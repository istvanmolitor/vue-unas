<script setup lang="ts">
import {
  AdminLayout,
  BackButton,
  Button,
  Card,
  ConfirmDialog,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  toastService,
} from '@admin'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { unasService, type UnasShop } from '../services/unasService'

type ActionKey =
  | 'downloadProducts'
  | 'downloadCategories'
  | 'downloadParameters'
  | 'downloadOrders'
  | 'clearProducts'
  | 'clearCategories'
  | 'clearParameters'
  | 'clearOrders'

interface ActionCard {
  title: string
  description: string
  downloadAction: ActionKey
  clearAction: ActionKey
}

const router = useRouter()
const route = useRoute()
const shop = ref<UnasShop | null>(null)
const isLoading = ref(true)
const pendingAction = ref<ActionKey | null>(null)
const runningActions = ref<Record<ActionKey, boolean>>({
  downloadProducts: false,
  downloadCategories: false,
  downloadParameters: false,
  downloadOrders: false,
  clearProducts: false,
  clearCategories: false,
  clearParameters: false,
  clearOrders: false,
})

const actionCards: ActionCard[] = [
  {
    title: 'Termékek',
    description: 'UNAS termékek letöltése az aktuális boltból.',
    downloadAction: 'downloadProducts',
    clearAction: 'clearProducts',
  },
  {
    title: 'Termékkategóriák',
    description: 'UNAS termékkategóriák letöltése az aktuális boltból.',
    downloadAction: 'downloadCategories',
    clearAction: 'clearCategories',
  },
  {
    title: 'Paraméterek',
    description: 'UNAS paraméterek letöltése az aktuális boltból.',
    downloadAction: 'downloadParameters',
    clearAction: 'clearParameters',
  },
  {
    title: 'Megrendelések',
    description: 'UNAS megrendelések letöltése az aktuális boltból.',
    downloadAction: 'downloadOrders',
    clearAction: 'clearOrders',
  },
]

const pageTitle = computed(() => {
  if (!shop.value) {
    return 'UNAS műveletek'
  }

  return `UNAS műveletek: ${shop.value.name}`
})

const backToShopShow = computed(() => {
  const id = route.params.id as string

  return `/admin/unas-shops/${id}`
})

const confirmDialogTitle = computed(() => {
  if (!pendingAction.value) {
    return 'Kiürítés megerősítése'
  }

  const actionCard = actionCards.find(card => card.clearAction === pendingAction.value)

  return actionCard
    ? `${actionCard.title} kiürítése`
    : 'Kiürítés megerősítése'
})

const confirmDialogMessage = computed(() => {
  if (!pendingAction.value || !shop.value) {
    return 'Biztosan véglegesen törölni szeretnéd a kijelölt rekordokat?'
  }

  const actionCard = actionCards.find(card => card.clearAction === pendingAction.value)
  const label = actionCard?.title.toLowerCase() ?? 'rekordok'

  return `A ${shop.value.name} shophoz tartozó ${label} rekordok véglegesen törlődnek. Ez a művelet nem vonható vissza.`
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

const executeAction = async (action: ActionKey): Promise<void> => {
  if (!shop.value?.id || runningActions.value[action]) {
    return
  }

  runningActions.value[action] = true

  try {
    let response

    switch (action) {
      case 'downloadProducts':
        response = await unasService.downloadShopProducts(shop.value.id)
        break
      case 'downloadCategories':
        response = await unasService.downloadShopCategories(shop.value.id)
        break
      case 'downloadParameters':
        response = await unasService.downloadShopParameters(shop.value.id)
        break
      case 'downloadOrders':
        response = await unasService.downloadShopOrders(shop.value.id)
        break
      case 'clearProducts':
        response = await unasService.clearShopProducts(shop.value.id)
        break
      case 'clearCategories':
        response = await unasService.clearShopCategories(shop.value.id)
        break
      case 'clearParameters':
        response = await unasService.clearShopParameters(shop.value.id)
        break
      case 'clearOrders':
        response = await unasService.clearShopOrders(shop.value.id)
        break
    }

    toastService.success(response.data.message)
  } catch (error) {
    console.error('Hiba az UNAS művelet indításakor:', error)
    toastService.error('Nem sikerült elindítani a műveletet.')
  } finally {
    runningActions.value[action] = false
  }
}

const requestAction = async (action: ActionKey): Promise<void> => {
  if (action.startsWith('clear')) {
    pendingAction.value = action

    return
  }

  await executeAction(action)
}

const closeConfirmDialog = (): void => {
  pendingAction.value = null
}

const confirmPendingAction = async (): Promise<void> => {
  if (!pendingAction.value) {
    return
  }

  const action = pendingAction.value
  pendingAction.value = null
  await executeAction(action)
}

onMounted(async () => {
  await fetchShop()
})
</script>

<template>
  <AdminLayout :page-title="pageTitle">
    <div class="mb-4 flex items-center justify-between gap-2">
      <BackButton :to="backToShopShow" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <LoadingSpinner label="Betöltés..." />
    </div>

    <div v-else-if="shop" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{{ shop.name }}</CardTitle>
          <CardDescription>UNAS shop műveletek</CardDescription>
        </CardHeader>
      </Card>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card v-for="actionCard in actionCards" :key="actionCard.title">
          <CardHeader>
            <CardTitle>{{ actionCard.title }}</CardTitle>
            <CardDescription>{{ actionCard.description }}</CardDescription>
          </CardHeader>

          <CardContent class="space-y-2">
            <Button
              class="w-full"
              :disabled="runningActions[actionCard.downloadAction]"
              @click="requestAction(actionCard.downloadAction)"
            >
              <span v-if="runningActions[actionCard.downloadAction]">Folyamatban...</span>
              <span v-else>Letölt</span>
            </Button>

            <Button
              class="w-full"
              variant="destructive"
              :disabled="runningActions[actionCard.clearAction]"
              @click="requestAction(actionCard.clearAction)"
            >
              <span v-if="runningActions[actionCard.clearAction]">Folyamatban...</span>
              <span v-else>Kiürít</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        :show="pendingAction !== null"
        :title="confirmDialogTitle"
        :message="confirmDialogMessage"
        confirm-text="Kiürítés"
        cancel-text="Mégse"
        variant="destructive"
        @close="closeConfirmDialog"
        @confirm="confirmPendingAction"
      />
    </div>
  </AdminLayout>
</template>