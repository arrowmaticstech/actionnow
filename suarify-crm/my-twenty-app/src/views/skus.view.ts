import { defineView } from 'twenty-sdk/define';

import {
  SKUS_VIEW_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  SKUS_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SKUS_VIEW_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  SKUS_VIEW_UNIVERSAL_IDENTIFIER,
  SKU_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  SKU_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: SKUS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All SKUs',
  objectUniversalIdentifier: SKU_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconBarcode',
  position: 0,
  fields: [
    {
      universalIdentifier: SKUS_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: SKU_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: SKUS_VIEW_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: SKU_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: SKUS_VIEW_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: SKU_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 120,
    },
  ],
});
