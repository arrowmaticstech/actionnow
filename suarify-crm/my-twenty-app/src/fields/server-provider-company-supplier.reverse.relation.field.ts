import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  SERVER_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  SERVER_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  SERVER_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SERVER_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'serverProviderPurchases',
  label: 'Server provider purchases (as supplier)',
  relationTargetObjectMetadataUniversalIdentifier:
    SERVER_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SERVER_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});

