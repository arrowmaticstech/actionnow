import { defineSkill } from 'twenty-sdk/define';

import { QUOTE_DOCUMENT_SKILL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineSkill({
  universalIdentifier: QUOTE_DOCUMENT_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'quote-invoice-drafting',
  label: 'Quote & invoice drafting',
  icon: 'IconFileText',
  content: [
    'To generate a quote or invoice, call the `generate-quote-document` tool with:',
    '- `templateId`: the id of the quote/invoice template to use.',
    '- `customerId`: the id of the Person or Company the document is for.',
    '- `lineItems`: an optional array of { skuId, quantity } picked from the SKU catalog.',
    '',
    'If the user names a template or customer instead of an id, find the record first,',
    'then pass its id. When the user lists products or services, look them up in the',
    'SKU catalog and pass their ids with quantities.',
  ].join('\n'),
});
