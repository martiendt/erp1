<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { AxiosError } from 'axios'
import { BaseRadio, BaseBreadcrumb, BaseDivider, BaseSelect, BaseInput } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import { useWarehouseApi } from '../api/warehouse'
import { useBranchApi } from '../api/branch'
import axios from '@/axios'

const { notification } = useBaseNotification()
const router = useRouter()
const warehouseApi = useWarehouseApi()
const branchApi = useBranchApi()

const form = ref({
  name: '',
  number: '',
  type: '',
  category: 'administrator',
  increasing_in: 'debit',
  subledger: ''
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
  { id: 1, label: 'ACCOUNT PAYABLE' },
  { id: 2, label: 'ACCOUNT RECEIVABLE' },
  { id: 3, label: 'ACCOUNT RECEIVABLE OF EMPLOYEE' },
  { id: 4, label: 'ACCOUNT RECEIVABLE OF MANAGEMENT' },
  { id: 5, label: 'ASSET DOWN PAYMENT ' },
  { id: 6, label: 'BANK' },
  { id: 7, label: 'CASH' },
  { id: 8, label: 'CASH-BANK TRANSFER' },
  { id: 9, label: 'COST OF SALES' },
  { id: 10, label: 'DIRECT EXPENSE' },
  { id: 11, label: 'FACTORY OVERHEAD COST' },
  { id: 12, label: 'FIX ASSET' },
  { id: 13, label: 'FIX ASSET DEPRECIATION' },
  { id: 14, label: 'INCOME TAX PAYABLE' },
  { id: 15, label: 'INCOME TAX RECEIVABLE' },
  { id: 16, label: 'INVENTORY' },
  { id: 17, label: 'LONG TERM LIABILITY' },
  { id: 18, label: 'NET INCOME FOR THE MONTH ' },
  { id: 19, label: 'NET INCOME FOR THE YEAR ' },
  { id: 20, label: 'NOTE PAYABLE' },
  { id: 21, label: 'NOTE RECEIVABLE' },
  { id: 22, label: 'OTHER ACCOUNT RECEIVABLE' },
  { id: 23, label: 'OTHER ASSETS' },
  { id: 24, label: 'OTHER ASSETS AMORTIZATION' },
  { id: 25, label: 'OTHER CURRENT ASSET' },
  { id: 26, label: 'OTHER CURRENT LIABILITY' },
  { id: 27, label: 'OTHER EXPENSE' },
  { id: 28, label: 'OTHER INCOME' }
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

const increaseInOptions = [
  {
    label: 'Debit',
    value: 'debit'
  },
  {
    label: 'Credit',
    value: 'credit'
  }
]

const increaseIn = ref()

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.post('/v1/coas', form.value)

    if (response.status === 201) {
      router.push('/coa')

      notification('', 'Create success', { type: TypesEnum.Success })
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      errors.value = error.response?.data.errors
      if (errors.value) {
        notification(error.response?.statusText, errors.value, { type: TypesEnum.Warning })
      } else {
        notification(error.response?.statusText, error.response?.data.message, { type: TypesEnum.Warning })
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

onMounted(async () => {
  await warehouseApi.fetchListWarehouse()
  await branchApi.fetchListBranch()
})
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Chart of Account</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Coa', path: '/coa' }, { name: 'Create' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>New Coa</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
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
              <component :is="BaseInput" required v-model="form.number" label="Number"></component>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold"> Increasing In </label>
                <div class="flex gap-2">
                  <input
                    required
                    type="radio"
                    id="debit"
                    name="increasingIn"
                    value="debit"
                    v-model="form.increasing_in"
                  />
                  Debit
                </div>
                <div class="flex gap-2">
                  <input
                    required
                    type="radio"
                    id="credit"
                    name="increasingIn"
                    value="credit"
                    v-model="form.increasing_in"
                  />
                  Credit
                </div>
              </div>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold"> Subledger </label>
                <component :is="BaseSelect" v-model="selectedSubledger" :list="listSubledger"></component>
              </div>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
