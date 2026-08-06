import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  VOIP_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'c357ed04-ab49-42e1-8c1d-0e2166e8b393',
  name: 'VoIP Providers',
  icon: 'IconShoppingCart',
  color: 'teal',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  folderUniversalIdentifier: PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: VOIP_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
});
