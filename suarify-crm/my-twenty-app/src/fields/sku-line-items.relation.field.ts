import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  DOCUMENT_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_LINE_ITEM_SKU_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_LINE_ITEMS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SKU_LINE_ITEMS_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'lineItems',
  label: 'Line items',
  relationTargetObjectMetadataUniversalIdentifier:
    DOCUMENT_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DOCUMENT_LINE_ITEM_SKU_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
