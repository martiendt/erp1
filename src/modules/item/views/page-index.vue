<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'
import { watchDebounced } from '@vueuse/core'
import { usePagination } from '@/composable/pagination'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/axios'

const pagination = usePagination()
const route = useRoute()
const router = useRouter()

const searchAll = ref('')
const isLoadingSearch = ref(false)

export interface ItemInterface {
  _id: string
  code: string
  name: string
  unit?: string
}
const items = ref<ItemInterface[]>([])

const getItems = async (page = 1, search = '') => {
  const result = await axios.get('/v1/items', {
    params: {
      pageSize: 100,
      page: page,
      sort: 'name',
      filter: {
        code: search,
        name: search,
        unit: search
      }
    }
  })

  items.value = result.data.data

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
    await getItems(1, searchAll.value)
    isLoadingSearch.value = false
  },
  { debounce: 500, maxWait: 1000 }
)

onMounted(async () => {
  const page = Number(route.query.page ?? 1)
  searchAll.value = route.query.search?.toString() ?? ''
  await getItems(page, searchAll.value)
})

const paginatePrev = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.previousPage()
    }
  })
  await getItems(pagination.previousPage(), searchAll.value)
}
const paginateNext = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.nextPage()
    }
  })
  await getItems(pagination.nextPage(), searchAll.value)
}
const paginate = async (page: number) => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: page
    }
  })
  await getItems(page, searchAll.value)
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Item</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Item' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex items-center gap-4">
            <div class="w-full flex space-x-2">
              <router-link to="/item/create" class="btn btn-secondary rounded-none space-x-1">
                <i class="i-far-pen-to-square block"></i>
                <p>Add New</p>
              </router-link>
              <component :is="BaseInput" v-model="searchAll" placeholder="Search" border="full" class="flex-1">
                <template #prefix>
                  <i class="i-far-magnifying-glass mx-3 block"></i>
                </template>
              </component>
            </div>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr class="basic-table-row bg-slate-100 dark:bg-slate-700">
                  <th class="basic-table-head">
                    <div class="flex items-center justify-between">
                      <p>Code</p>
                    </div>
                  </th>
                  <th class="basic-table-head">
                    <div class="flex items-center justify-between">
                      <p>Name</p>
                    </div>
                  </th>
                  <th class="basic-table-head">
                    <div class="flex items-center justify-between">
                      <p>Unit</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="items.length > 0">
                  <tr v-for="item in items" :key="item._id" class="basic-table-row">
                    <td class="basic-table-body">{{ item.code }}</td>
                    <td class="basic-table-body">
                      <router-link :to="`/item/${item._id}`" class="text-info">{{ item.name }}</router-link>
                    </td>
                    <td class="basic-table-body">{{ item.unit }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="w-full flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Showing {{ pagination.dataFrom() }} to {{ pagination.dataTo() }} of
                {{ pagination.totalDocument }} entries
              </p>
            </div>
            <div class="btn-group" v-if="pagination.pageCount.value > 1">
              <button @click="paginatePrev()" type="button" class="btn btn-light-dark rounded-r-none">
                <i class="i-fas-angle-left block"></i>
              </button>
              <button
                v-for="page in pagination.pageCount.value"
                :key="page"
                type="button"
                class="btn rounded border-r-none"
                :class="{
                  'btn-secondary': page === pagination.page.value,
                  'btn-light-dark': page !== pagination.page.value
                }"
                @click="paginate(page)"
              >
                {{ page }}
              </button>
              <button @click="paginateNext()" type="button" class="btn btn-light-dark rounded-l-none">
                <i class="i-fas-angle-right block"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
