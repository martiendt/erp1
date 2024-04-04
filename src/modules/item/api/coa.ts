import axios from '@/axios'
import { ref } from 'vue'

export function useCoaApi() {
  const listCoa = ref([{ id: '', label: '' }])
  const fetchListCoa = async () => {
    const result = await axios.get('/v1/coas', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name',
        filter: {
          category: 'inventory'
        }
      }
    })

    listCoa.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: item.number + ' - ' + item.name
      }
    })
  }

  return {
    listCoa,
    fetchListCoa
  }
}
