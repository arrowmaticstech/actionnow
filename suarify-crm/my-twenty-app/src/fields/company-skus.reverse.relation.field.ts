import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS as STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  SKU_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_COMPANYREVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SKU_COMPANYREVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'skus',
  label: 'SKUs',
  description: 'SKUs that reference this company as a sample.',
  relationTargetObjectMetadataUniversalIdentifier: SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SKU_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});

