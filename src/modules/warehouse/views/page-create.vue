<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { AxiosError } from 'axios'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseAutocomplete } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import axios from '@/axios'
import { useBranchApi } from '../api/branch'

const branchApi = useBranchApi()
const { notification } = useBaseNotification()
const router = useRouter()

const form = ref({
  branch_id: '',
  code: '',
  name: ''
})

const errors = ref()
const isSubmitted = ref(false)
const selectedBranch = ref<{ id: string; label: string }>()

watch(selectedBranch, () => {
  form.value.branch_id = selectedBranch.value?.id ?? ''
})

onMounted(async () => {
  await branchApi.fetchListBranch()
})

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.post('/v1/warehouses', form.value)

    if (response.status === 201) {
      form.value.branch_id = ''
      form.value.code = ''
      form.value.name = ''
      router.push('/warehouse')

      notification('', 'Create success', { type: TypesEnum.Success })
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
      <h1>Warehouse</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Warehouse', path: '/warehouse' }, { name: 'Create' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>New Warehouse</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
            <div class="space-y-2">
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Branch
                  <span class="text-xs text-slate-400">*</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedBranch"
                  :list="branchApi.listBranch.value"
                ></component>
              </div>
              <component :is="BaseInput" required v-model="form.code" label="Code"></component>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
