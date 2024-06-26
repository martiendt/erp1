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

export interface CustomerInterface {
  _id: string
  code: string
  name: string
  address?: string
  phone?: string
  email?: string
}
const customers = ref<CustomerInterface[]>([])

const getCustomers = async (page = 1, search = '') => {
  const result = await axios.get('/v1/customers', {
    params: {
      pageSize: 100,
      page: page,
      sort: 'name',
      filter: {
        code: search,
        name: search,
        address: search,
        phone: search,
        email: search
      }
    }
  })

  customers.value = result.data.data

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
    await getCustomers(1, searchAll.value)
    isLoadingSearch.value = false
  },
  { debounce: 500, maxWait: 1000 }
)

onMounted(async () => {
  const page = Number(route.query.page ?? 1)
  searchAll.value = route.query.search?.toString() ?? ''
  await getCustomers(page, searchAll.value)
})

const paginatePrev = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.previousPage()
    }
  })
  await getCustomers(pagination.previousPage(), searchAll.value)
}
const paginateNext = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.nextPage()
    }
  })
  await getCustomers(pagination.nextPage(), searchAll.value)
}
const paginate = async (page: number) => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: page
    }
  })
  await getCustomers(page, searchAll.value)
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Customer</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Customer' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex items-center gap-4">
            <div class="w-full flex space-x-2">
              <router-link to="/customer/create" class="btn btn-secondary rounded-none space-x-1">
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
                      <p>Address</p>
                    </div>
                  </th>
                  <th class="basic-table-head">
                    <div class="flex items-center justify-between">
                      <p>Phone</p>
                    </div>
                  </th>
                  <th class="basic-table-head">
                    <div class="flex items-center justify-between">
                      <p>Email</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="customers.length > 0">
                  <tr v-for="customer in customers" :key="customer._id" class="basic-table-row">
                    <td class="basic-table-body">{{ customer.code }}</td>
                    <td class="basic-table-body">
                      <router-link :to="`/customer/${customer._id}`" class="text-info">{{ customer.name }}</router-link>
                    </td>
                    <td class="basic-table-body">{{ customer.address }}</td>
                    <td class="basic-table-body">{{ customer.phone }}</td>
                    <td class="basic-table-body">{{ customer.email }}</td>
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
