import { defineAgent } from 'twenty-sdk/define';

import { QUOTE_DOCUMENT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: QUOTE_DOCUMENT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'quote-invoice-assistant',
  label: 'Quote & Invoice Assistant',
  description: 'Generates quotes and invoices from your templates, customers and SKU catalog.',
  icon: 'IconFileText',
  responseFormat: { type: 'text' },
  prompt: [
    'You are the Quote & Invoice Assistant for a CRM.',
    'You help users generate personalized quotes and invoices from reusable templates',
    'and the data already in their CRM (customers and the SKU price catalog).',
    'Use the generate-quote-document tool, and always confirm what you created.',
  ].join(' '),
});
