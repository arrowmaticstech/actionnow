import { defineView } from 'twenty-sdk/define';

import {
  QUOTE_TEMPLATES_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATES_VIEW_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: QUOTE_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All quote/invoice templates',
  objectUniversalIdentifier: QUOTE_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconFileText',
  position: 0,
  fields: [
    {
      universalIdentifier: QUOTE_TEMPLATES_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: QUOTE_TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: QUOTE_TEMPLATES_VIEW_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: QUOTE_TEMPLATE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 120,
    },
  ],
});
