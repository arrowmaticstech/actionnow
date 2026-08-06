import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  VOIP_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  VOIP_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  VOIP_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: VOIP_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: VOIP_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'supplierCompany',
  label: 'Supplier (company)',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    VOIP_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'voipProviderSupplierCompanyId',
  },
});

