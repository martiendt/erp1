<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AxiosError } from 'axios'
import { BaseBreadcrumb, BaseDivider, BaseInput } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/axios'

const { notification } = useBaseNotification()
const route = useRoute()
const router = useRouter()

const _id = ref('')

const form = ref({
  code: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  notes: '',
  bankBranch: '',
  bankName: '',
  accountName: '',
  accountNumber: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/suppliers/${route.params.id}`)

    if (result.status === 200) {
      _id.value = result.data._id
      form.value.code = result.data.code
      form.value.name = result.data.name
      form.value.address = result.data.address
      form.value.phone = result.data.phone
      form.value.email = result.data.email
      form.value.notes = result.data.notes
      form.value.bankBranch = result.data.bankBranch
      form.value.bankName = result.data.bankName
      form.value.accountName = result.data.accountName
      form.value.accountNumber = result.data.accountNumber
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
    const response = await axios.patch(`/v1/suppliers/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/supplier')

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
      <h1>Supplier</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'Supplier', path: '/supplier' },
          { name: route.params.id.toString(), path: `/supplier/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Edit Supplier</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required v-model="form.code" label="Code"></component>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <component :is="BaseInput" v-model="form.address" label="Address"></component>
              <component :is="BaseInput" v-model="form.phone" label="Phone"></component>
              <component :is="BaseInput" v-model="form.email" label="Email"></component>
              <component :is="BaseInput" v-model="form.notes" label="Notes"></component>
            </div>
            <div class="pt-5 space-y-2">
              <h2>Bank Information</h2>
              <component :is="BaseInput" v-model="form.bankName" label="Bank Name"></component>
              <component :is="BaseInput" v-model="form.bankBranch" label="Bank Branch"></component>
              <component :is="BaseInput" v-model="form.accountName" label="Account Name"></component>
              <component :is="BaseInput" v-model="form.accountNumber" label="Account Number"></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
