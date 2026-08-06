import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  QUOTE_DOCUMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: QUOTE_DOCUMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Quotes & invoices',
  icon: 'IconFile',
  color: 'blue',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: QUOTE_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
});
