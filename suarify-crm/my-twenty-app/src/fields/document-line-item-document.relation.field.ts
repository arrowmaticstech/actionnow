import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import {
  DOCUMENT_LINE_ITEM_DOCUMENT_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_LINE_ITEMS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: DOCUMENT_LINE_ITEM_DOCUMENT_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: DOCUMENT_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'document',
  label: 'Document',
  relationTargetObjectMetadataUniversalIdentifier:
    QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    QUOTE_DOCUMENT_LINE_ITEMS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'quoteDocumentId',
  },
});
