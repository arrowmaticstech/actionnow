import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  LLM_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '4c5718ce-6204-4ad6-9b3c-4a426e2a0b9b',
  name: 'LLM Providers',
  icon: 'IconShoppingCart',
  color: 'teal',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  folderUniversalIdentifier: PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: LLM_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
});
