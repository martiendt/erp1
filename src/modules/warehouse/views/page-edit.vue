<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { AxiosError } from 'axios'
import { BaseAutocomplete, BaseBreadcrumb, BaseDivider, BaseInput } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/axios'
import { useBranchApi } from '../api/branch'

const branchApi = useBranchApi()
const { notification } = useBaseNotification()
const route = useRoute()
const router = useRouter()
const selectedBranch = ref<{ id: string; label: string }>()
const _id = ref('')

const form = ref({
  code: '',
  name: '',
  branch_id: ''
})

watch(selectedBranch, () => {
  form.value.branch_id = selectedBranch.value?.id ?? ''
})

onMounted(async () => {
  await branchApi.fetchListBranch()
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/warehouses/${route.params.id}`)

    console.log(result)

    if (result.status === 200) {
      _id.value = result.data._id
      form.value.code = result.data.code
      form.value.name = result.data.name

      if (result.data.branch) {
        form.value.branch_id = result.data.branch._id
        selectedBranch.value = { id: result.data.branch._id, label: result.data.branch.name }
      }
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
    const response = await axios.patch(`/v1/warehouses/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/warehouse')

      notification('', 'Update success', { type: TypesEnum.Success })
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
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'Warehouse', path: '/warehouse' },
          { name: route.params.id.toString(), path: `/warehouse/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Edit Warehouse</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required v-model="form.code" label="Code"></component>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Branch
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedBranch"
                  :list="branchApi.listBranch.value"
                ></component>
              </div>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
