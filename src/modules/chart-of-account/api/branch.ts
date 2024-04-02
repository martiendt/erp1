import axios from '@/axios'
import { ref } from 'vue'

export function useBranchApi() {
  const listBranch = ref([{ id: '', label: '' }])
  const fetchListBranch = async () => {
    const result = await axios.get('/v1/branches', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name'
      }
    })

    listBranch.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: item.name
      }
    })
  }

  return {
    listBranch,
    fetchListBranch
  }
}
