import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  TECHNICAL_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  TECHNICAL_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  TECHNICAL_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: TECHNICAL_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: TECHNICAL_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'supplierCompany',
  label: 'Supplier (company)',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    TECHNICAL_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'technicalProviderSupplierCompanyId',
  },
});

