import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS as STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  SKU_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_COMPANYREVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SKU_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'companySample',
  label: 'Company sample',
  description: 'A sample company this SKU is relevant to.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SKU_COMPANYREVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'skuCompanySampleId',
  },
});

