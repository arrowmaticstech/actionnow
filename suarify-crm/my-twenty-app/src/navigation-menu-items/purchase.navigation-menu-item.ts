import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  name: 'Purchase',
  icon: 'IconShoppingCart',
  color: 'teal',
  position: 13,
  type: NavigationMenuItemType.FOLDER,
});
