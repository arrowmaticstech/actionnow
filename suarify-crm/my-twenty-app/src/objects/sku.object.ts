import { defineObject, FieldType, NumberDataType } from 'twenty-sdk/define';

import {
  SKU_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_CURRENCY_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  SKU_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'sku',
  namePlural: 'skus',
  labelSingular: 'SKU',
  labelPlural: 'SKUs',
  description: 'Your price catalog — every sellable product or service with its unit price.',
  icon: 'IconBarcode',
  labelIdentifierFieldMetadataUniversalIdentifier: SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SKU_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'code',
      label: 'SKU code',
      description: 'Unique stock-keeping unit, e.g. "SV-1001".',
      icon: 'IconBarcode',
    },
    {
      universalIdentifier: SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Product or service name.',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: SKU_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'What the customer gets.',
      icon: 'IconFileText',
    },
    {
      universalIdentifier: SKU_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'unitPrice',
      label: 'Unit price',
      description: 'Price for one unit.',
      icon: 'IconCurrency',
      universalSettings: { dataType: NumberDataType.FLOAT, decimals: 2 },
    },
    {
      universalIdentifier: SKU_CURRENCY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'defaultCurrency',
      label: 'Currency',
      description: 'Currency code, e.g. MYR.',
      icon: 'IconCurrencyDollar',
    },
  ],
});
