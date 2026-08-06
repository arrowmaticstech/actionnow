import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import {
  BUNDLED_SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  BUNDLED_SKU_SKU_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  BUNDLED_SKU_SKU_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BUNDLED_SKU_SKU_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'bundledSku',
  label: 'Bundled SKU',
  description: 'The bundle this SKU belongs to (if any).',
  relationTargetObjectMetadataUniversalIdentifier:
    BUNDLED_SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    BUNDLED_SKU_SKU_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'bundledSkuId',
  },
});
