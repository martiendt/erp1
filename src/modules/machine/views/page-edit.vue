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
  notes: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/machines/${route.params.id}`)

    if (result.status === 200) {
      _id.value = result.data._id
      form.value.code = result.data.code
      form.value.name = result.data.name
      form.value.notes = result.data.notes
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
    const response = await axios.patch(`/v1/machines/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/machine/' + route.params.id)

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
      <h1>Machine</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'Machine', path: '/machine' },
          { name: route.params.id.toString(), path: `/machine/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Edit Machine</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required v-model="form.code" label="Code"></component>
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <component :is="BaseInput" v-model="form.notes" label="Notes"></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
