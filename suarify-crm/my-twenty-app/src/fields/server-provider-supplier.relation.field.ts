import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  SERVER_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  SERVER_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  SERVER_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SERVER_PROVIDER_SUPPLIER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SERVER_PROVIDER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'supplierCompany',
  label: 'Supplier (company)',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SERVER_PROVIDER_COMPANY_SUPPLIER_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'serverProviderSupplierCompanyId',
  },
});

