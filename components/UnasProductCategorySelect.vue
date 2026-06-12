<script setup lang="ts">
import { computed } from 'vue'
import Select from '@admin/components/ui/Select.vue'
import type { UnasProductCategory } from '@unas/services/unasService'

interface Props {
  id?: string
  modelValue?: number | null
  categories?: UnasProductCategory[]
  excludeId?: number | null
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  modelValue: null,
  categories: () => [],
  excludeId: null,
  placeholder: 'Valassz szulo kategoriat',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const selectableCategories = computed<UnasProductCategory[]>(() => {
  return props.categories.filter((category) => category.id !== props.excludeId)
})

const handleUpdate = (value: string | number | null): void => {
  if (typeof value === 'number') {
    emit('update:modelValue', value)
    return
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const numericValue = Number(value)

    emit('update:modelValue', Number.isInteger(numericValue) ? numericValue : null)
    return
  }

  emit('update:modelValue', null)
}
</script>

<template>
  <Select
    :id="id"
    :model-value="modelValue"
    :options="selectableCategories"
    label-field="name"
    value-field="id"
    :placeholder="placeholder"
    clearable
    @update:model-value="handleUpdate"
  />
</template>