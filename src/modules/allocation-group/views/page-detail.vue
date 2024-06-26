<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import axios from '@/axios'

const route = useRoute()
const router = useRouter()
const { notification } = useBaseNotification()

const form = ref({
  name: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/allocation-groups/${route.params.id}`)

    if (result.status === 200) {
      form.value.name = result.data.name
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})

const onDelete = async () => {
  const password = prompt('Are you sure want to delete this data?')

  if (password) {
    const verifyPasswordResponse = await axios.post(`/v1/users/verify-password`, {
      password: password
    })

    if (verifyPasswordResponse.status !== 204) {
      notification('Authentication Failed', 'Your password is incorrect', { type: TypesEnum.Warning })
      return
    }

    const result = await axios.delete(`/v1/allocation-groups/${route.params.id}`)
    if (result.status === 204) {
      router.push('/allocation-group')

      notification('', 'Delete Allocation Group data success', { type: TypesEnum.Success })
    }
  } else {
    notification('Authentication Failed', 'Your password is incorrect', { type: TypesEnum.Warning })
  }
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Allocation Group</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Allocation Group', path: '/allocation-group' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show Allocation Group</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/allocation-group/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
            <div>
              <router-link
                :to="`/allocation-group/${route.params.id}/edit`"
                class="btn btn-secondary btn-sm rounded-none space-x-1"
              >
                <i class="i-far-pen-to-square block"></i>
                <span>Edit</span>
              </router-link>
            </div>
            <div>
              <button @click="onDelete()" type="button" class="btn btn-danger btn-sm rounded-none space-x-1">
                <i class="i-far-trash block"></i>
                <span>Delete</span>
              </button>
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
