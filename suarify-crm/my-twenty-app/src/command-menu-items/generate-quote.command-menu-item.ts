import {
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  GENERATE_QUOTE_COMMAND_UNIVERSAL_IDENTIFIER,
  GENERATE_QUOTE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: GENERATE_QUOTE_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Generate quote/invoice',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  frontComponentUniversalIdentifier:
    GENERATE_QUOTE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
