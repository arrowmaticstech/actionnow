import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  VOIP_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  VOIP_PROVIDER_PERSON_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  VOIP_PROVIDER_SUPPLIER_CONTACT_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: VOIP_PROVIDER_PERSON_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'voipProviderPurchases',
  label: 'VoIP provider purchases (as supplier contact)',
  relationTargetObjectMetadataUniversalIdentifier:
    VOIP_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    VOIP_PROVIDER_SUPPLIER_CONTACT_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});

