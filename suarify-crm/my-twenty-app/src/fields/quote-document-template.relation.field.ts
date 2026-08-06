import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import {
  QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_TEMPLATE_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATE_DOCUMENTS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QUOTE_DOCUMENT_TEMPLATE_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTE_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'template',
  label: 'Template',
  relationTargetObjectMetadataUniversalIdentifier:
    QUOTE_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    QUOTE_TEMPLATE_DOCUMENTS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'quoteTemplateId',
  },
});
