<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { AxiosError } from 'axios'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseAutocomplete } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/axios'
import { useCoaApi } from '../api/coa'
import { useItemCategoryApi } from '../api/item-category'

const coaApi = useCoaApi()
const itemCategoryApi = useItemCategoryApi()
const { notification } = useBaseNotification()
const route = useRoute()
const router = useRouter()

const _id = ref('')

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

onMounted(async () => {
  try {
    await coaApi.fetchListCoa()
    await itemCategoryApi.fetchListItemCategory()

    const result = await axios.get(`/v1/items/${route.params.id}`)

    if (result.status === 200) {
      _id.value = result.data._id
      form.value.code = result.data.code
      form.value.name = result.data.name
      form.value.unit = result.data.unit
      form.value.notes = result.data.notes
      form.value.item_category_id = result.data.item_category_id
      form.value.coa_id = result.data.coa_id
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.patch(`/v1/items/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/item')

      notification('', 'Update success', { type: TypesEnum.Success })
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
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'Item', path: '/item' },
          { name: route.params.id.toString(), path: `/item/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Edit Item</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
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
                <label class="text-sm font-bold"> Coa *</label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="form.coa_id"
                  :list="coaApi.listCoa.value"
                ></component>
              </div>
              <component :is="BaseInput" required v-model="form.code" label="Code"></component>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <component :is="BaseInput" v-model="form.unit" label="Unit"></component>
              <component :is="BaseInput" v-model="form.notes" label="Notes"></component>
            </div>

            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
