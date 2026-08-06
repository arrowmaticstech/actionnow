import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  TECHNICAL_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  TECHNICAL_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  TECHNICAL_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: TECHNICAL_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'technicalProviderPurchases',
  label: 'Technical provider purchases (as supplier)',
  relationTargetObjectMetadataUniversalIdentifier:
    TECHNICAL_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TECHNICAL_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});

