import { defineObject, FieldType, NumberDataType } from 'twenty-sdk/define';

import {
  BUNDLED_SKU_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  BUNDLED_SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  BUNDLED_SKU_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
  BUNDLED_SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  BUNDLED_SKU_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: BUNDLED_SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'bundledSku',
  namePlural: 'bundledSkus',
  labelSingular: 'Bundled SKU',
  labelPlural: 'Bundled SKUs',
  description:
    'A bundle that groups existing SKUs or hand-entered items (as notes) into one sellable package.',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    BUNDLED_SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: BUNDLED_SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Bundle name, e.g. "SME Starter Pack".',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: BUNDLED_SKU_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'What this bundle includes.',
      icon: 'IconFileText',
    },
    {
      universalIdentifier: BUNDLED_SKU_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'price',
      label: 'Bundle price',
      description: 'Selling price of the whole bundle.',
      icon: 'IconCurrency',
      universalSettings: { dataType: NumberDataType.FLOAT, decimals: 2 },
    },
    {
      universalIdentifier: BUNDLED_SKU_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'note',
      label: 'Included items',
      description:
        'Hand-entered list of what is in the bundle, e.g. "SIP line + LLM minutes + setup". Use when not linking to catalog SKUs.',
      icon: 'IconNotes',
    },
  ],
});
