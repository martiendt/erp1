<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput, BaseModal } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import axios from '@/axios'
import { AxiosError } from 'axios'

const route = useRoute()
const router = useRouter()
const { notification } = useBaseNotification()

const form = ref({
  name: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/customer-groups/${route.params.id}`)

    if (result.status === 200) {
      form.value.name = result.data.name
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

      const result = await axios.delete(`/v1/customer-groups/${route.params.id}`)
      if (result.status === 204) {
        router.push('/customer-group')

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
      <h1>Customer Group</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Customer Group', path: '/customer-group' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show Customer Group</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/customer-group/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
            <div>
              <router-link
                :to="`/customer-group/${route.params.id}/edit`"
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
              <component :is="BaseInput" readonly v-model="form.name" label="Name"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
