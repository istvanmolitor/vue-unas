import { MenuBuilder, type MenuItemConfig } from '@menu/index'
import { ShoppingBag, Store, Package, FolderTree, ListFilter, ClipboardList } from 'lucide-vue-next'

export class UnasMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName !== 'admin') {
      return menu
    }

    const unasSection: MenuItemConfig = {
      id: 'unas-management',
      title: 'UNAS',
      icon: ShoppingBag,
      order: 40,
      permission: 'unas',
      children: [
        {
          id: 'unas-shops',
          title: 'Boltok',
          path: '/admin/unas-shops',
          icon: Store,
          order: 10,
          permission: 'unas',
        },
        {
          id: 'unas-products',
          title: 'Termékek',
          path: '/admin/unas-products',
          icon: Package,
          order: 20,
          permission: 'unas',
        },
        {
          id: 'unas-categories',
          title: 'Kategóriák',
          path: '/admin/unas-categories',
          icon: FolderTree,
          order: 30,
          permission: 'unas',
        },
        {
          id: 'unas-parameters',
          title: 'Paraméterek',
          path: '/admin/unas-parameters',
          icon: ListFilter,
          order: 40,
          permission: 'unas',
        },
        {
          id: 'unas-orders',
          title: 'Megrendelések',
          path: '/admin/unas-orders',
          icon: ClipboardList,
          order: 50,
          permission: 'unas',
        },
      ],
    }

    this.addMenuItem(menu, unasSection)

    return menu
  }
}

export const unasMenuBuilder = new UnasMenuBuilder()
