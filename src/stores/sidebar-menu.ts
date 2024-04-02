import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * Shortcut using dynamic icon on the fly, at the compile time
 * we can't possibility know all the combination of the utilities.
 * For that, you can configure your icon to the safelist option.
 *
 * https://unocss.dev/guide/extracting#safelist
 */

export interface ShortcutInterface {
  name: string
  icon: string
  menu: Array<MenuInterface>
  path?: string
  link?: string
}

export interface MenuInterface {
  name: string
  allowed: string[]
  path?: string
  link?: string
  separator?: boolean
  submenu?: SubmenuInterface[]
}

export interface SubmenuInterface {
  name: string
  path?: string
  link?: string
  separator?: boolean
}

export interface StateInterface {
  shortcut: ShortcutInterface[]
  activeShortcut: ShortcutInterface
  activeShortcutIndex: number
  activeMenuName: string
}

export const useSidebarMenuStore = defineStore('sidebar-menu', {
  state: (): StateInterface => ({
    shortcut: [menuMain],
    activeShortcut: menuMain,
    activeShortcutIndex: 0,
    activeMenuName: ''
  }),
  actions: {
    findActiveShortcut(route: RouteLocationNormalizedLoaded) {
      for (const [index, shortcut] of this.$state.shortcut.entries()) {
        if (route.path === shortcut.path) {
          this.$state.activeShortcut = shortcut
          this.$state.activeShortcutIndex = index
          return
        }
        for (const menu of shortcut.menu) {
          if (route.path.includes(menu.path as string)) {
            this.$state.activeShortcut = shortcut
            this.$state.activeShortcutIndex = index
            this.$state.activeMenuName = menu.name
            return
          }
          if (menu.submenu) {
            for (const submenu of menu.submenu) {
              if (route.path.includes(submenu.path as string)) {
                this.$state.activeShortcut = shortcut
                this.$state.activeShortcutIndex = index
                this.$state.activeMenuName = menu.name
                return
              }
            }
          }
        }
        if (route.path.split('/')[1] === shortcut.path?.split('/')[1]) {
          this.$state.activeShortcut = shortcut
          this.$state.activeShortcutIndex = index
          return
        }
      }
    },
    toggleMenu(name: string) {
      if (this.$state.activeMenuName === name) {
        this.$state.activeMenuName = ''
      } else {
        this.$state.activeMenuName = name
      }
    },
    hasChildren(route: RouteLocationNormalizedLoaded) {
      for (const shortcut of this.$state.shortcut) {
        if (shortcut.path === route.path) return true
        for (const menu of shortcut.menu) {
          if (menu.path === route.path && menu.submenu) return true
        }
      }
    }
  }
})

const menuMain = {
  name: 'Main Menu',
  path: '/',
  icon: 'i-fad-house-chimney',
  menu: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      allowed: ['administrator']
    },
    {
      name: 'Master',
      submenu: [
        {
          name: 'User',
          path: '/user',
          allowed: ['administrator']
        },
        {
          name: 'Branch',
          path: '/branch',
          allowed: ['administrator']
        },
        {
          name: 'Warehouse',
          path: '/warehouse',
          allowed: ['administrator']
        },
        {
          name: 'Allocation Group',
          path: '/allocation-group',
          allowed: ['administrator']
        },
        {
          name: 'Allocation',
          path: '/allocation',
          allowed: ['administrator']
        },
        {
          name: 'Item Category',
          path: '/item-category',
          allowed: ['administrator']
        },
        {
          name: 'Item',
          path: '/item',
          allowed: ['administrator']
        },
        {
          name: 'Supplier Group',
          path: '/supplier-group',
          allowed: ['administrator']
        },
        {
          name: 'Supplier',
          path: '/supplier',
          allowed: ['administrator']
        },
        {
          name: 'Customer Group',
          path: '/customer-group',
          allowed: ['administrator']
        },
        {
          name: 'Customer',
          path: '/customer',
          allowed: ['administrator', 'cashier']
        },
        {
          name: 'Expedition',
          path: '/expedition',
          allowed: ['administrator']
        }
      ],
      allowed: ['administrator']
    },
    {
      name: 'Accounting',
      submenu: [
        {
          name: 'Chart of Account',
          path: '/coa',
          allowed: ['administrator']
        }
      ],
      allowed: ['administrator']
    },
    {
      name: 'Manufacture',
      submenu: [
        {
          name: 'Machine',
          path: '/machine',
          allowed: ['administrator']
        },
        {
          name: 'Process',
          path: '/process',
          allowed: ['administrator']
        }
      ],
      allowed: ['administrator']
    }
  ]
}
