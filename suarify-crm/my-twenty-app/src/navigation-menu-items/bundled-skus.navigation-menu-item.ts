import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  BUNDLED_SKUS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  BUNDLED_SKU_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: BUNDLED_SKUS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Bundled SKUs',
  icon: 'IconBox',
  color: 'green',
  position: 3,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: BUNDLED_SKU_OBJECT_UNIVERSAL_IDENTIFIER,
});
