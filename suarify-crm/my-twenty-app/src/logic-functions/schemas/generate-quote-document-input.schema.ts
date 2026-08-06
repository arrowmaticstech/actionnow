import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const generateQuoteDocumentInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    templateId: {
      type: 'string',
      label: 'Quote/Invoice template',
      description: 'The id of the quote/invoice template to render.',
    },
    customerId: {
      type: 'string',
      label: 'Customer',
      description: 'The id of the Person or Company the document is for.',
    },
    lineItems: {
      type: 'array',
      label: 'Line items',
      description:
        'Optional list of { skuId, quantity }. If omitted, the line-items table is left empty for manual filling.',
      items: {
        type: 'object',
        properties: {
          skuId: { type: 'string', label: 'SKU', description: 'Id of an SKU from your price catalog.' },
          quantity: { type: 'number', label: 'Quantity' },
        },
      },
    },
  },
  required: ['templateId', 'customerId'],
  additionalProperties: false,
};
