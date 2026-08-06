import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  QUOTE_TEMPLATES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: QUOTE_TEMPLATES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Quote/Invoice templates',
  icon: 'IconFileText',
  color: 'orange',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: QUOTE_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
});
