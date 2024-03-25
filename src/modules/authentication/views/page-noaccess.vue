<script setup lang="ts">
import { AxiosError } from 'axios'
import { ref } from 'vue'
import { BaseInput } from '@/components/index'
import { useRouter } from 'vue-router'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { notification } = useBaseNotification()

const form = ref({
  username: '',
  password: ''
})

const errors = ref()
const isSubmitted = ref(false)
const onSignin = async () => {
  try {
    isSubmitted.value = true
    const response = await authStore.login(form.value.username, form.value.password)

    if (response.status === 200) {
      router.push('/')
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
  <div class="h-screen w-full bg-slate-100 dark:bg-slate-900">
    <div class="mx-auto max-w-xl w-full p-4 sm:px-5">
      <div class="text-center">
        <div class="mt-4">
          <h2 class="text-2xl font-semibold text-slate-600 dark:text-slate-100">Point ERP</h2>
          <p class="text-slate-400 dark:text-slate-300">Unauthorized Access</p>
        </div>
      </div>
      <div class="card mt-5 rounded-lg p-5 lg:p-7 space-y-10">
        <div class="mx-auto max-w-xl w-full">
          <div class="text-center">
            <div class="">
              You don't have permission to access this feature, back to
              <router-link class="btn text-blue" to="/">Homepage</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
