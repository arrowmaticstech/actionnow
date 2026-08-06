import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  TECHNICAL_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'edc04858-53cd-4599-ab96-ddd298ab05f0',
  name: 'Technical Providers',
  icon: 'IconShoppingCart',
  color: 'teal',
  position: 3,
  type: NavigationMenuItemType.OBJECT,
  folderUniversalIdentifier: PURCHASE_NAVIGATION_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: TECHNICAL_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
});
