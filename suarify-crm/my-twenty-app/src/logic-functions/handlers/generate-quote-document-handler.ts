import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import {
  QUOTE_DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTE_DOCUMENT_STATUS_GENERATED,
  QUOTE_TEMPLATE_TYPE_INVOICE,
} from 'src/constants/universal-identifiers';
import { generateDocumentPdf } from 'src/logic-functions/utils/generate-document-pdf';
import {
  flattenRecord,
  formatMoney,
  renderTemplate,
} from 'src/logic-functions/utils/render-template';

const toPdfFileName = (documentName: string): string => {
  const slug = documentName
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `${slug || 'document'}.pdf`;
};

const attachGeneratedPdf = async (
  client: CoreApiClient,
  documentId: string,
  documentName: string,
  content: string,
): Promise<void> => {
  const bytes = await generateDocumentPdf(content);
  const fileName = toPdfFileName(documentName);

  const uploaded = await new MetadataApiClient().uploadFile(
    Buffer.from(bytes),
    fileName,
    'application/pdf',
    QUOTE_DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  );

  await client.mutation({
    updateQuoteDocument: {
      __args: {
        id: documentId,
        data: { file: [{ fileId: uploaded.id, label: fileName }] },
      },
      id: true,
    },
  });
};

export type LoadedRecord = {
  found: boolean;
  displayName: string;
  values: Record<string, string>;
};

// Loads a Person or Company by id and returns its fields flattened into the
// dot-path tokens that templates reference (e.g. `name.firstName`, `company.name`).
export const loadCustomerValues = async (
  client: CoreApiClient,
  recordId: string,
): Promise<LoadedRecord> => {
  const { companies } = await client.query({
    companies: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          domainName: { primaryLinkUrl: true },
          address: { addressCity: true, addressCountry: true },
        },
      },
    },
  });

  const company = companies?.edges?.[0]?.node;

  if (company?.id) {
    const { id: _id, ...fields } = company;
    const nested = { name: { firstName: '', lastName: company.name } };

    return {
      found: true,
      displayName: company.name ?? 'Company',
      values: flattenRecord({ ...nested, ...fields } as Record<string, unknown>),
    };
  }

  const { people } = await client.query({
    people: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: {
        node: {
          id: true,
          jobTitle: true,
          city: true,
          name: { firstName: true, lastName: true },
          emails: { primaryEmail: true },
          phones: { primaryPhoneNumber: true },
          company: { name: true },
        },
      },
    },
  });

  const person = people?.edges?.[0]?.node;

  if (!person?.id) {
    return { found: false, displayName: '', values: {} };
  }

  const { id: _id, ...fields } = person;
  const fullName = [person.name?.firstName, person.name?.lastName]
    .filter(Boolean)
    .join(' ');

  return {
    found: true,
    displayName: fullName.length > 0 ? fullName : 'Person',
    values: flattenRecord(fields as Record<string, unknown>),
  };
};

export type GenerateQuoteDocumentInput = {
  templateId: string;
  customerId: string;
  lineItems?: Array<{ skuId: string; quantity: number }>;
};

export type GenerateQuoteDocumentResult = {
  success: boolean;
  message: string;
  status?: number;
  documentId?: string;
  content?: string;
  totalAmount?: number;
  missingTokens?: string[];
};

// Builds the markdown line-items table (SKU / Description / Qty / Unit price / Amount)
// and returns the table plus the grand total.
export const buildLineItemsTable = async (
  client: CoreApiClient,
  lineItems: GenerateQuoteDocumentInput['lineItems'] = [],
): Promise<{ table: string; total: number }> => {
  if (lineItems.length === 0) {
    return { table: '', total: 0 };
  }

  const skuIds = lineItems.map((item) => item.skuId);

  const { skus } = await client.query({
    skus: {
      __args: { filter: { id: { in: skuIds } }, first: 100 },
      edges: { node: { id: true, code: true, name: true, description: true, unitPrice: true } },
    },
  });

  const skuMap = new Map<string, NonNullable<typeof skus>[number]['edges'][number]['node']>();
  for (const edge of skus?.edges ?? []) {
    if (edge?.node?.id) skuMap.set(edge.node.id, edge.node);
  }

  const rows: string[] = [];
  let total = 0;

  for (const item of lineItems) {
    const sku = skuMap.get(item.skuId);
    const quantity = item.quantity ?? 1;
    const unitPrice = sku?.unitPrice ?? 0;
    const amount = quantity * unitPrice;
    total += amount;

    rows.push(
      `| ${sku?.code ?? ''} | ${sku?.name ?? ''}${sku?.description ? ` — ${sku.description}` : ''} | ${quantity} | ${formatMoney(unitPrice)} | ${formatMoney(amount)} |`,
    );
  }

  const header = '| SKU | Description | Qty | Unit price | Amount |\n|---|---|---|---|---|';
  const table = rows.length > 0 ? `${header}\n${rows.join('\n')}\n\n**Total: ${formatMoney(total)}**` : '';

  return { table, total };
};

export const generateQuoteDocumentHandler = async (
  input: GenerateQuoteDocumentInput,
): Promise<GenerateQuoteDocumentResult> => {
  const { templateId, customerId } = input;

  if (!templateId || !customerId) {
    return { success: false, status: 400, message: 'Both templateId and customerId are required.' };
  }

  const client = new CoreApiClient();

  const { quoteTemplates } = await client.query({
    quoteTemplates: {
      __args: { filter: { id: { eq: templateId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          type: true,
          companyName: true,
          companyAddress: true,
          companyEmail: true,
          companyPhone: true,
          footer: true,
          body: { markdown: true } as unknown as true,
        },
      },
    },
  });

  const template = quoteTemplates?.edges?.[0]?.node;

  if (!template?.id) {
    return { success: false, status: 404, message: `No template found with id ${templateId}.` };
  }

  const customer = await loadCustomerValues(client, customerId);

  if (!customer.found) {
    return { success: false, status: 404, message: `No customer found with id ${customerId}.` };
  }

  const { table, total } = await buildLineItemsTable(client, input.lineItems);

  // Merge template-owned company info + customer placeholders.
  const values: Record<string, string> = {
    'seller.companyName': template.companyName ?? '',
    'seller.companyAddress': template.companyAddress ?? '',
    'seller.companyEmail': template.companyEmail ?? '',
    'seller.companyPhone': template.companyPhone ?? '',
    documentType: template.type === QUOTE_TEMPLATE_TYPE_INVOICE ? 'Invoice' : 'Quote',
    ...customer.values,
  };

  const bodyMarkdown =
    (template.body as unknown as { markdown: string | null } | null)?.markdown ?? '';

  const { content: renderedBody, missingTokens } = renderTemplate(bodyMarkdown, values);

  const renderedContent = [
    renderedBody,
    table ? `\n\n${table}` : '',
    template.footer ? `\n\n---\n${template.footer}` : '',
  ]
    .filter(Boolean)
    .join('');

  const documentName = `${template.type === QUOTE_TEMPLATE_TYPE_INVOICE ? 'Invoice' : 'Quote'} — ${customer.displayName}`;

  const { createQuoteDocument } = await client.mutation({
    createQuoteDocument: {
      __args: {
        data: {
          name: documentName,
          status: QUOTE_DOCUMENT_STATUS_GENERATED,
          content: renderedContent,
          totalAmount: total || null,
          templateId: template.id,
        },
      },
      id: true,
      name: true,
    },
  });

  if (!createQuoteDocument?.id) {
    return { success: false, status: 500, message: 'Failed to create the document.' };
  }

  // Create the line-item records linked to the document (with real SKU prices).
  if (input.lineItems && input.lineItems.length > 0) {
    try {
      const { skus: skuRecords } = await client.query({
        skus: {
          __args: { filter: { id: { in: input.lineItems.map((i) => i.skuId) } }, first: 100 },
          edges: { node: { id: true, unitPrice: true } },
        },
      });
      const priceMap = new Map<string, number>();
      for (const edge of skuRecords?.edges ?? []) {
        if (edge?.node?.id) priceMap.set(edge.node.id, edge.node.unitPrice ?? 0);
      }

      await client.mutation({
        createManyDocumentLineItems: {
          __args: {
            data: input.lineItems.map((item) => {
              const unitPrice = priceMap.get(item.skuId) ?? 0;
              const quantity = item.quantity ?? 1;
              return {
                quoteDocumentId: createQuoteDocument.id,
                skuId: item.skuId,
                quantity,
                unitPrice,
                amount: quantity * unitPrice,
              };
            }),
          },
          id: true,
        },
      });
    } catch (error) {
      console.warn('[quote-document-generator] Failed to attach line items:', error);
    }
  }

  // Best-effort PDF attachment: the document already exists, so a PDF failure
  // shouldn't discard it — surface a warning instead.
  let message = `Generated "${createQuoteDocument.name}".`;
  try {
    await attachGeneratedPdf(client, createQuoteDocument.id, createQuoteDocument.name ?? documentName, renderedContent);
  } catch (error) {
    console.warn('[quote-document-generator] PDF attachment failed:', error);
    message += ' (PDF file could not be attached)';
  }

  // Pipeline wiring: push the document into the existing sales pipeline.
  // Quote documents create an OrderQuotation; Invoice documents create a
  // SalesInvoice. Both pipeline objects currently expose only a `name` field.
  try {
    if (template.type === QUOTE_TEMPLATE_TYPE_INVOICE) {
      const { createSalesinvoice } = await client.mutation({
        createSalesinvoice: {
          __args: {
            data: {
              name: createQuoteDocument.name ?? documentName,
            },
          },
          id: true,
          name: true,
        },
      });
      if (createSalesinvoice?.id) {
        message += ' Also created SalesInvoice in the pipeline.';
      }
    } else {
      const { createOrderquotation } = await client.mutation({
        createOrderquotation: {
          __args: {
            data: {
              name: createQuoteDocument.name ?? documentName,
            },
          },
          id: true,
          name: true,
        },
      });
      if (createOrderquotation?.id) {
        message += ' Also created OrderQuotation in the pipeline.';
      }
    }
  } catch (error) {
    console.warn('[quote-document-generator] Pipeline wiring failed:', error);
  }

  return {
    success: true,
    message,
    documentId: createQuoteDocument.id,
    content: renderedContent,
    totalAmount: total,
    missingTokens,
  };
};
