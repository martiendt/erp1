<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { AxiosError } from 'axios'
import { BaseAutocomplete, BaseBreadcrumb, BaseDivider, BaseSelect, BaseInput } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRoute, useRouter } from 'vue-router'
import { useWarehouseApi } from '../api/warehouse'
import { useBranchApi } from '../api/branch'
import axios from '@/axios'

const { notification } = useBaseNotification()
const route = useRoute()
const router = useRouter()
const warehouseApi = useWarehouseApi()
const branchApi = useBranchApi()

const _id = ref('')

const form = ref({
  name: '',
  number: '',
  type: '',
  category: '',
  subledger: '',
  increasing_in: ''
})

const listType = [
  { id: 1, label: 'Asset' },
  { id: 2, label: 'Liability' },
  { id: 3, label: 'Equity' },
  { id: 4, label: 'Income' },
  { id: 5, label: 'Expense' }
]

const selectedType = ref()
watch(selectedType, () => {
  form.value.type = selectedType.value?.label?.toLowerCase() ?? ''
})

const listCategory = [
  { id: 1, label: 'Cash' },
  { id: 2, label: 'Bank' },
  { id: 3, label: 'Inventory' }
]

const selectedCategory = ref()
watch(selectedCategory, () => {
  form.value.category = selectedCategory.value?.label?.toLowerCase() ?? ''
})

const listSubledger = [
  { id: 1, label: 'Item' },
  { id: 2, label: 'Supplier' },
  { id: 3, label: 'Customer' }
]

const selectedSubledger = ref()
watch(selectedSubledger, () => {
  form.value.subledger = selectedSubledger.value?.label?.toLowerCase() ?? ''
})

onMounted(async () => {
  try {
    warehouseApi.fetchListWarehouse()
    branchApi.fetchListBranch()

    const result = await axios.get(`/v1/coas/${route.params.id}`)

    if (result.status === 200) {
      _id.value = result.data._id
      form.value.name = result.data.name
      form.value.number = result.data.number.toString()
      form.value.type = result.data.type
      form.value.category = result.data.category

      // set selected category
      listType.forEach((el) => {
        if (el.label.toLowerCase().trim() == result.data.type.toLowerCase().trim()) {
          selectedType.value = { id: el.id, label: el.label }
          form.value.type = selectedType.value?.label?.toLowerCase() ?? ''
        }
      })

      listCategory.forEach((el) => {
        if (el.label.toLowerCase().trim() == result.data.category.toLowerCase().trim()) {
          selectedCategory.value = { id: el.id, label: el.label }
          form.value.category = selectedCategory.value?.label?.toLowerCase() ?? ''
        }
      })

      listSubledger.forEach((el) => {
        if (el.label.toLowerCase().trim() == result.data.subledger?.toLowerCase().trim()) {
          selectedSubledger.value = { id: el.id, label: el.label }
          form.value.subledger = selectedSubledger.value?.label?.toLowerCase() ?? ''
        }
      })
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
    const response = await axios.patch(`/v1/coas/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/coa')
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      errors.value = error.response?.data.errors
      notification(error.response?.statusText, error.response?.data.message, { type: TypesEnum.Warning })
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
      <h1>Chart of Account</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'Coa', path: '/coa' },
          { name: route.params.id.toString(), path: `/coa/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Edit Coa</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Type
                  <span class="text-xs text-slate-400">*</span>
                </label>
                <component :is="BaseSelect" v-model="selectedType" required :list="listType"></component>
              </div>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Category
                  <span class="text-xs text-slate-400">*</span>
                </label>
                <component :is="BaseSelect" v-model="selectedCategory" required :list="listCategory"></component>
              </div>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <component :is="BaseInput" required readonly v-model="form.number" label="Number"></component>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold"> Default Value </label>
                <div class="flex gap-2">
                  <input type="radio" id="debit" name="increasingIn" value="debit" v-model="form.increasing_in" /> Debit
                </div>
                <div class="flex gap-2">
                  <input type="radio" id="credit" name="increasingIn" value="credit" v-model="form.increasing_in" />
                  Credit
                </div>
              </div>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold"> Subledger </label>
                <component :is="BaseSelect" v-model="selectedSubledger" required :list="listSubledger"></component>
              </div>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
