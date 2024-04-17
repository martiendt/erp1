<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseAutocomplete } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import { useCoaApi } from '../api/coa'
import { useItemCategoryApi } from '../api/item-category'

import axios from '@/axios'

const coaApi = useCoaApi()
const itemCategoryApi = useItemCategoryApi()

const { notification } = useBaseNotification()
const router = useRouter()

const selectedCoa = ref<{ id: string; label: string }>()
const selectedItemCategory = ref<{ id: string; label: string }>()

watch(selectedCoa, () => {
  form.value.coa_id = selectedCoa.value?.id ?? ''
})

watch(selectedItemCategory, () => {
  form.value.item_category_id = selectedItemCategory.value?.id ?? ''
})

const form = ref({
  code: '',
  name: '',
  unit: '',
  coa_id: '',
  item_category_id: '',
  notes: ''
})

const errors = ref()
const isSubmitted = ref(false)

onMounted(async () => {
  await coaApi.fetchListCoa()
  await itemCategoryApi.fetchListItemCategory()
})

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.post('/v1/items', form.value)

    if (response.status === 201) {
      form.value.code = ''
      form.value.name = ''
      form.value.unit = ''
      form.value.notes = ''

      router.push('/item')

      notification('', 'Create success', { type: TypesEnum.Success })
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      errors.value = error.response?.data.errors
      for (const [key, value] of Object.entries(error.response?.data.errors)) {
        notification(error.response?.statusText, value as string, { type: TypesEnum.Warning })
      }
    } else if (error instanceof AxiosError) {
      notification(error.code as string, error.message, { type: TypesEnum.Warning })
    } else {
      notification('Unknown Error', '', { type: TypesEnum.Warning })
    }
  } finally {
    isSubmitted.value = false
  }
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Item</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Item', path: '/item' }, { name: 'Create' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>New Item</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
            <div class="space-y-2">
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold"> Category </label>
                <component
                  :is="BaseAutocomplete"
                  v-model="form.item_category_id"
                  :list="itemCategoryApi.listItemCategory.value"
                ></component>
              </div>

              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold"> Coa * </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="form.coa_id"
                  :list="coaApi.listCoa.value"
                ></component>
              </div>
              <component :is="BaseInput" required v-model="form.code" label="Code"></component>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <component :is="BaseInput" required v-model="form.unit" label="Unit"></component>
              <component :is="BaseInput" v-model="form.notes" label="Notes"></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
