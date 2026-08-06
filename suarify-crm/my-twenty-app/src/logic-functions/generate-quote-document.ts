import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-sdk/logic-function';

import { GENERATE_QUOTE_DOCUMENT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { generateQuoteDocumentHandler } from 'src/logic-functions/handlers/generate-quote-document-handler';
import { generateQuoteDocumentInputSchema } from 'src/logic-functions/schemas/generate-quote-document-input.schema';

// Same function, exposed two ways:
//  - as an AI tool, so agents can call it,
//  - as a workflow action, so it can be dropped into the visual workflow builder.
export default defineLogicFunction({
  universalIdentifier: GENERATE_QUOTE_DOCUMENT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'generate-quote-document',
  description:
    'Generate a quote or invoice from a template and a customer record, filling placeholders and adding a line-items table with SKU pricing.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: generateQuoteDocumentInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Generate Quote/Invoice',
    icon: 'IconFileText',
    inputSchema: jsonSchemaToInputSchema(generateQuoteDocumentInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          documentId: { type: 'string' },
          content: { type: 'string' },
          totalAmount: { type: 'number' },
          missingTokens: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  },
  handler: generateQuoteDocumentHandler,
});
