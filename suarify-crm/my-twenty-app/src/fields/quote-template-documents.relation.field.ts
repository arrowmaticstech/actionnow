import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_TEMPLATE_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATE_DOCUMENTS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QUOTE_TEMPLATE_DOCUMENTS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTE_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'documents',
  label: 'Documents',
  relationTargetObjectMetadataUniversalIdentifier:
    QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    QUOTE_DOCUMENT_TEMPLATE_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
