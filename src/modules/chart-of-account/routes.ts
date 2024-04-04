import { useAuthorization } from '@/composable/authorization'
import { useAuthStore } from '@/stores/auth'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export const routes = {
  path: '/coa',
  component: () => import('@/layouts/app/app-index.vue'),
  children: [
    {
      path: '',
      component: () => import('./views/page-index.vue')
    },
    {
      path: 'create',
      component: () => import('./views/page-create.vue')
    },
    {
      path: 'setting-journal',
      component: () => import('./views/page-setting-journal.vue')
    },
    {
      path: 'setting-journal/:module',
      component: () => import('./views/page-update-setting-journal.vue')
    },
    {
      path: ':id',
      component: () => import('./views/page-detail.vue')
    },
    {
      path: ':id/edit',
      component: () => import('./views/page-edit.vue')
    }
  ],
  beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore()
    const authorization = useAuthorization()
    if (!(await authStore.isAuthenticated())) {
      next('/signin')
    } else if (!authorization.isAuthorize(['administrator'])) {
      next('/unauthorized')
    } else {
      next()
    }
  }
}
