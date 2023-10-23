<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import axios from '@/axios'
import { AxiosError } from 'axios'
import BaseModal from '@/components/base-modal.vue'

const route = useRoute()
const router = useRouter()
const { notification } = useBaseNotification()

const form = ref({
  code: '',
  name: '',
  address: '',
  phone: '',
  notes: '',
  email: '',
  bankBranch: '',
  bankName: '',
  accountName: '',
  accountNumber: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/suppliers/${route.params.id}`)

    if (result.status === 200) {
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

const passwordConfirmation = ref('')
const showModal = ref(false)

const onDelete = async () => {
  showModal.value = false
  try {
    if (passwordConfirmation.value) {
      const verifyPasswordResponse = await axios.post(`/v1/users/verify-password`, {
        password: passwordConfirmation.value
      })
      if (verifyPasswordResponse.status !== 204) {
        notification('Authentication Failed', 'Your password is incorrect', { type: TypesEnum.Warning })
        return
      }

      const result = await axios.delete(`/v1/suppliers/${route.params.id}`)
      if (result.status === 204) {
        router.push('/supplier')

        notification('', 'Delete supplier data success', { type: TypesEnum.Success })
      }
    } else {
      notification('Authentication Failed', 'Your password is incorrect', { type: TypesEnum.Warning })
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) {
        notification('Authentication Failed', 'Your password is incorrect', { type: TypesEnum.Warning })
      } else {
        notification('Delete Failed', 'Cannot delete this data because used by other module', {
          type: TypesEnum.Warning
        })
      }
    } else if (error instanceof AxiosError) {
      notification(error.code as string, error.message, { type: TypesEnum.Warning })
    } else {
      notification('Unknown Error', '', { type: TypesEnum.Warning })
    }
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
        :breadcrumbs="[{ name: 'Supplier', path: '/supplier' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show Supplier</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/supplier/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
            <div>
              <router-link
                :to="`/supplier/${route.params.id}/edit`"
                class="btn btn-secondary btn-sm rounded-none space-x-1"
              >
                <i class="i-far-pen-to-square block"></i>
                <span>Edit</span>
              </router-link>
            </div>
            <div>
              <button @click="showModal = true" type="button" class="btn btn-danger btn-sm rounded-none space-x-1">
                <i class="i-far-trash block"></i>
                <span>Delete</span>
              </button>
              <component :is="BaseModal" :is-open="showModal" @on-close="showModal = false">
                <template #content>
                  <div class="max-h-90vh overflow-auto p-4">
                    <h2 class="py-4 text-2xl font-bold">Delete Confirmation</h2>
                    <div class="space-y-8">
                      Please input your password to verify this action
                      <component :is="BaseInput" v-model="passwordConfirmation" type="password" label=""></component>
                      <button class="btn btn-danger btn-block" @click="onDelete()">Delete</button>
                    </div>
                  </div>
                </template>
              </component>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" readonly v-model="form.code" label="Code"></component>
              <component :is="BaseInput" readonly v-model="form.name" label="Name"></component>
              <component :is="BaseInput" readonly v-model="form.address" label="Address"></component>
              <component :is="BaseInput" readonly v-model="form.phone" label="Phone"></component>
              <component :is="BaseInput" readonly v-model="form.email" label="Email"></component>
              <component :is="BaseInput" readonly v-model="form.notes" label="Notes"></component>
            </div>
            <div class="pt-5 space-y-2">
              <h2>Bank Information</h2>
              <component :is="BaseInput" v-model="form.bankName" label="Bank Name"></component>
              <component :is="BaseInput" v-model="form.bankBranch" label="Bank Branch"></component>
              <component :is="BaseInput" v-model="form.accountName" label="Account Name"></component>
              <component :is="BaseInput" v-model="form.accountNumber" label="Account Number"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
