import { defineObject, FieldType, NumberDataType } from 'twenty-sdk/define';

import {
  DOCUMENT_LINE_ITEM_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_LINE_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_LINE_ITEM_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_LINE_ITEM_SKU_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_LINE_ITEM_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DOCUMENT_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'documentLineItem',
  namePlural: 'documentLineItems',
  labelSingular: 'Line item',
  labelPlural: 'Line items',
  description: 'A single line on a quote or invoice: an SKU, quantity, unit price and amount.',
  icon: 'IconListNumbers',
  labelIdentifierFieldMetadataUniversalIdentifier:
    DOCUMENT_LINE_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: DOCUMENT_LINE_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Line label, e.g. the SKU name.',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: DOCUMENT_LINE_ITEM_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'quantity',
      label: 'Quantity',
      icon: 'IconNumber',
      universalSettings: { dataType: NumberDataType.INT },
    },
    {
      universalIdentifier: DOCUMENT_LINE_ITEM_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'unitPrice',
      label: 'Unit price',
      icon: 'IconCurrency',
      universalSettings: { dataType: NumberDataType.FLOAT, decimals: 2 },
    },
    {
      universalIdentifier: DOCUMENT_LINE_ITEM_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'amount',
      label: 'Amount',
      description: 'quantity × unit price.',
      icon: 'IconCalculator',
      universalSettings: { dataType: NumberDataType.FLOAT, decimals: 2 },
    },
  ],
});
