import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  SERVER_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '0a972960-8202-420d-9dd4-a675309770f4',
  name: 'Server Providers',
  icon: 'IconShoppingCart',
  color: 'teal',
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  folderUniversalIdentifier: PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: SERVER_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
});
