import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  SKUS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  SKUS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SKUS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'SKUs (price catalog)',
  icon: 'IconBarcode',
  color: 'green',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SKUS_VIEW_UNIVERSAL_IDENTIFIER,
});
