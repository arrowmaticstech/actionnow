import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { GENERATE_QUOTE_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { generateQuoteDocumentHandler } from 'src/logic-functions/handlers/generate-quote-document-handler';

// HTTP entry point used by the "Generate quote/invoice" front component. The
// shared handler returns a suggested HTTP status on failure (400/404/500); map
// it onto the response so callers get proper status codes.
const handler = async (event: RoutePayload): Promise<Response> => {
  const body = event.body as Record<string, unknown> | null;

  const result = await generateQuoteDocumentHandler({
    templateId: (body?.templateId as string | undefined) ?? '',
    customerId: (body?.customerId as string | undefined) ?? '',
    lineItems: body?.lineItems as Array<{ skuId: string; quantity: number }> | undefined,
  });

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : (result.status ?? 400),
    headers: { 'Content-Type': 'application/json' },
  });
};

export default defineLogicFunction({
  universalIdentifier: GENERATE_QUOTE_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'generate-quote-document-route',
  description: 'HTTP endpoint that generates a quote/invoice for the given customer.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/documents/generate',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
