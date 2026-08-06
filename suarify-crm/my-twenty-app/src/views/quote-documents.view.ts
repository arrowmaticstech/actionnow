import { defineView } from 'twenty-sdk/define';

import {
  QUOTE_DOCUMENTS_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENTS_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENTS_VIEW_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: QUOTE_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All quotes & invoices',
  objectUniversalIdentifier: QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconFile',
  position: 0,
  fields: [
    {
      universalIdentifier: QUOTE_DOCUMENTS_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: QUOTE_DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: QUOTE_DOCUMENTS_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: QUOTE_DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: QUOTE_DOCUMENTS_VIEW_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: QUOTE_DOCUMENT_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 120,
    },
  ],
});
