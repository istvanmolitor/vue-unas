<script setup lang="ts">
import { AdminLayout, DeleteButton, EditButton, LoadingSpinner, TreeView, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import Select from '@admin/components/ui/Select.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import {
  unasService,
  type UnasProductCategory,
  type UnasShop,
} from '../services/unasService'

const router = useRouter()
type UnasProductCategoryTreeItem = UnasProductCategory & {
  children: UnasProductCategoryTreeItem[]
}

const categories = ref<UnasProductCategoryTreeItem[]>([])
const shops = ref<UnasShop[]>([])
const selectedShopId = ref<number | null>(null)
const isLoading = ref(false)

const normalizeParentId = (parentId?: number | null): number | null => {
  return parentId ?? null
}

const compareByName = (
  leftCategory: UnasProductCategory,
  rightCategory: UnasProductCategory
): number => {
  return String(leftCategory.name ?? '').localeCompare(String(rightCategory.name ?? ''), 'hu-HU')
}

const toTreeRows = (flatCategories: UnasProductCategory[]): UnasProductCategoryTreeItem[] => {
  const byParent = new Map<number | null, UnasProductCategory[]>()

  flatCategories.forEach((category) => {
    const parentId = normalizeParentId(category.parent_id)

    if (!byParent.has(parentId)) {
      byParent.set(parentId, [])
    }

    byParent.get(parentId)!.push(category)
  })

  const rows: UnasProductCategoryTreeItem[] = []
  const visited = new Set<number>()

  const walk = (parentId: number | null): UnasProductCategoryTreeItem[] => {
    const children = [...(byParent.get(parentId) ?? [])].sort(compareByName)
    const nodes: UnasProductCategoryTreeItem[] = []

    children.forEach((child) => {
      if (visited.has(child.id)) {
        return
      }

      visited.add(child.id)
      nodes.push({
        ...child,
        children: walk(child.id),
      })
    })

    return nodes
  }

  rows.push(...walk(null))

  flatCategories
    .filter((category) => !visited.has(category.id))
    .sort(compareByName)
    .forEach((category) => {
      visited.add(category.id)
      rows.push({
        ...category,
        children: walk(category.id),
      })
    })

  return rows
}

const fetchAllCategories = async (): Promise<UnasProductCategory[]> => {
  let currentPage = 1
  let lastPage = 1
  const allCategories: UnasProductCategory[] = []

  do {
    const params: Record<string, number> = { page: currentPage }

    if (selectedShopId.value) {
      params.unas_shop_id = selectedShopId.value
    }

    const response = await unasService.getCategories(params)

    allCategories.push(...response.data.data)
    lastPage = response.data.meta?.last_page ?? 1
    currentPage += 1
  } while (currentPage <= lastPage)

  return allCategories
}

const fetchCategories = async (): Promise<void> => {
  try {
    isLoading.value = true
    const flatCategories = await fetchAllCategories()
    categories.value = toTreeRows(flatCategories)
  } catch (error) {
    console.error('Hiba a kategóriák betöltése közben:', error)
    toastService.error('Nem sikerült betölteni a kategóriákat.')
  } finally {
    isLoading.value = false
  }
}

const fetchShops = async () => {
  try {
    const response = await unasService.getShops({ per_page: 100 })
    shops.value = response.data.data
  } catch (error) {
    console.error('Hiba a boltok betöltése közben:', error)
  }
}

const deleteCategory = async (category: UnasProductCategory) => {
  try {
    await unasService.deleteCategory(category.id)
    toastService.success('Kategória törölve.')
    await fetchCategories()
  } catch (error) {
    toastService.error('A törlés sikertelen.')
  }
}

const editCategory = (id: number) => {
  router.push(`/admin/unas-categories/${id}/edit`)
}

const getCategoryId = (item: unknown): number | undefined => {
  if (!item || typeof item !== 'object') {
    return undefined
  }

  const { id } = item as UnasProductCategory

  return typeof id === 'number' ? id : undefined
}

const getCategoryName = (item: unknown): string => {
  if (!item || typeof item !== 'object') {
    return 'Névtelen kategória'
  }

  return (item as UnasProductCategory).name || 'Névtelen kategória'
}

const getCategoryRemoteId = (item: unknown): string | undefined => {
  if (!item || typeof item !== 'object') {
    return undefined
  }

  const { remote_id: remoteId } = item as UnasProductCategory

  return typeof remoteId === 'string' && remoteId.length > 0 ? remoteId : undefined
}

const getCategoryShopName = (item: unknown): string | undefined => {
  if (!item || typeof item !== 'object') {
    return undefined
  }

  const { shop_name: shopName } = item as UnasProductCategory

  return typeof shopName === 'string' && shopName.length > 0 ? shopName : undefined
}

const handleEditTreeItem = (item: unknown): void => {
  const categoryId = getCategoryId(item)

  if (!categoryId) {
    return
  }

  editCategory(categoryId)
}

const handleDeleteTreeItem = (item: unknown): void => {
  const categoryId = getCategoryId(item)

  if (!categoryId) {
    return
  }

  deleteCategory(item as UnasProductCategory)
}

watch(selectedShopId, () => {
  fetchCategories()
})

onMounted(async () => {
  await fetchShops()
  await fetchCategories()
})
</script>

<template>
  <AdminLayout pageTitle="UNAS Kategóriák">
    <div class="space-y-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="w-full md:w-64">
          <Select
            v-model="selectedShopId"
            :options="shops"
            label-field="name"
            value-field="id"
            placeholder="Szűrés boltra..."
            clearable
          />
        </div>

        <CreateButton to="/admin/unas-categories/create">
          Új UNAS kategória
        </CreateButton>
      </div>

      <div v-if="isLoading && categories.length === 0" class="flex justify-center py-8">
        <LoadingSpinner label="Betöltés..." />
      </div>

      <TreeView v-else :items="categories" empty-text="Nincs megjeleníthető UNAS kategória.">
        <template #item="{ item }">
          <div class="min-w-0">
            <div class="flex min-w-0 items-center gap-2">
              <span class="truncate text-sm font-medium">
                {{ getCategoryName(item) }}
              </span>
              <span v-if="getCategoryId(item)" class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                #{{ getCategoryId(item) }}
              </span>
            </div>
            <p v-if="getCategoryRemoteId(item)" class="truncate text-xs text-muted-foreground">
              Remote ID: {{ getCategoryRemoteId(item) }}
            </p>
            <p v-if="getCategoryShopName(item)" class="truncate text-xs text-muted-foreground">
              Bolt: {{ getCategoryShopName(item) }}
            </p>
          </div>
        </template>

        <template #actions="{ item }">
          <EditButton @click="handleEditTreeItem(item)" />
          <DeleteButton @confirm="handleDeleteTreeItem(item)" />
        </template>
      </TreeView>
    </div>
  </AdminLayout>
</template>
