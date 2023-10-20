<script setup lang="ts">
import { ref } from 'vue'
import { AxiosError } from 'axios'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseNumeric } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import axios from '@/axios'

const { notification } = useBaseNotification()
const router = useRouter()

const form = ref({
  code: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  notes: '',
  bankName: '',
  bankBranch: '',
  accountName: '',
  accountNumber: '',
  creditLimit: 0
})

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.post('/v1/customers', form.value)

    if (response.status === 201) {
      form.value.code = ''
      form.value.name = ''
      form.value.address = ''
      form.value.phone = ''
      form.value.email = ''
      form.value.notes = ''

      form.value.bankName = ''
      form.value.bankBranch = ''
      form.value.accountName = ''
      form.value.accountNumber = ''
      form.value.creditLimit = 0
      router.push('/customer/' + response.data._id)

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
      <h1>Customer</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Customer', path: '/customer' }, { name: 'Create' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>New Customer</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
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
            <div class="pt-5 space-y-2">
              <h2>Credit Limit</h2>
              <p class="text-slate-500">
                To inform maximum credit limit for each customer so that when making a sale user can know the maximum
                credit amount must be given.
              </p>
              <component :is="BaseNumeric" v-model="form.creditLimit" label=""></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
