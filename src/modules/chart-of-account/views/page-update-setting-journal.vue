<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { BaseBreadcrumb, BaseAutocomplete } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'
import { watchDebounced } from '@vueuse/core'
import { usePagination } from '@/composable/pagination'
import { useRoute, useRouter } from 'vue-router'
import { useCoaApi } from '../api/coa'

import axios from '@/axios'
import { AxiosError } from 'axios'
import { useBaseNotification, TypesEnum } from '@/composable/notification'

const { notification } = useBaseNotification()

const coaApi = useCoaApi()
const pagination = usePagination()
const route = useRoute()
const router = useRouter()

const searchAll = ref('')
const isLoadingSearch = ref(false)
const form = ref<any>({
  module: route.params.module,
  coa: []
})

const selectedCoa = ref<{ id: string; label: string }[]>([])
watch(selectedCoa, () => {
  // form.value.coa_id = selectedCoa.value[0]?.id ?? ''
})

export interface SettingJournalInterface {
  _id: string
  module: string
  account: string
  coa_id: string
}
const coas = ref<SettingJournalInterface[]>([])

const getCoas = async (page = 1) => {
  const result = await axios.get('/v1/setting-journals', {
    params: {
      pageSize: 10,
      page: page,
      sort: 'module',
      filter: {
        module: route.params.module
      }
    }
  })

  coas.value = result.data.data
  form.value.coa = coas.value

  pagination.page.value = result.data.pagination.page
  pagination.pageCount.value = result.data.pagination.pageCount
  pagination.pageSize.value = result.data.pagination.pageSize
  pagination.totalDocument.value = result.data.pagination.totalDocument
}

watchDebounced(
  searchAll,
  async () => {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        page: pagination.previousPage(),
        search: searchAll.value
      }
    })
    isLoadingSearch.value = true
    await getCoas(1)
    isLoadingSearch.value = false
  },
  { debounce: 500, maxWait: 1000 }
)

onMounted(async () => {
  await coaApi.fetchListCoa()
  const page = Number(route.query.page ?? 1)
  await getCoas(page)
  // form.value.coa[0].coa_id = coaApi.listCoa.value[0]
  coaApi.listCoa.value.forEach((el) => {
    var index = 0
    coas.value.forEach((el2) => {
      if (el.id === el2.coa_id) {
        form.value.coa[index].coa_id = el
      }
      index++
    })
  })
  searchAll.value = route.query.search?.toString() ?? ''
})
const errors = ref()

const isSubmitted = ref(false)
const onSubmit = async () => {
  try {
    isSubmitted.value = true
    for (const element of form.value.coa) {
      if (!element.coa_id?.id?.length) {
        notification('', 'Please fill all account field', { type: TypesEnum.Danger })
        coaApi.listCoa.value.forEach((el) => {
          var index = 0
          coas.value.forEach((el2) => {
            if (el.id === el2.coa_id) {
              form.value.coa[index].coa_id = el
            }
            index++
          })
        })
        return
      }
      element.coa_id = element.coa_id.id
    }

    const response = await axios.post('/v1/setting-journals', form.value)

    if (response.status === 204) {
      notification('', 'Update success', { type: TypesEnum.Success })
      router.push('/coa/setting-journal')
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
      <h1>Chart of Account</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Setting Journal' }]" />
    </div>
    <br />
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex items-center gap-4">
            <div class="w-full flex space-x-2">
              <router-link to="/coa/create" class="btn btn-secondary rounded-none space-x-1">
                <i class="i-far-pen-to-square block"></i>
                <p>Add New</p>
              </router-link>
              <router-link to="/coa/setting-journal" class="btn btn-info rounded-none space-x-1">
                <i class="i-far-book block"></i>
                <p>Setting Journal</p>
              </router-link>
            </div>
          </div>
          <div class="w-full flex flex-col gap-4">
            <component :is="BaseInput" required v-model="form.module" label="Module" disabled></component>
            <div v-for="(coa, index) in coas" :key="coa._id">
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  {{ coa.account }}
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="form.coa[index].coa_id"
                  :list="coaApi.listCoa.value"
                ></component>
              </div>
            </div>
            <div class="mt-5">
              <button class="btn btn-primary" @click="onSubmit">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
