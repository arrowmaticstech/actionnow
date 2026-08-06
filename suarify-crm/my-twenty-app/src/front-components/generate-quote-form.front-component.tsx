import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { GENERATE_QUOTE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type Template = { id: string; name: string; type: string };
type Sku = { id: string; code: string; name: string; unitPrice: number };

const GenerateQuoteForm = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const recordId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [skus, setSkus] = useState<Sku[]>([]);
  const [lines, setLines] = useState<Array<{ skuId: string; quantity: number }>>([]);

  useEffect(() => {
    new CoreApiClient()
      .query({
        quoteTemplates: {
          __args: { first: 100 },
          edges: { node: { id: true, name: true, type: true } },
        },
        skus: {
          __args: { first: 100 },
          edges: { node: { id: true, code: true, name: true, unitPrice: true } },
        },
      })
      .then(({ quoteTemplates, skus: skusResult }) => {
        const templateList = quoteTemplates?.edges?.map((e) => e.node) ?? [];
        const skuList = skusResult?.edges?.map((e) => e.node) ?? [];
        setTemplates(templateList);
        setSkus(skuList);
        if (templateList[0]) setTemplateId(templateList[0].id);
      });
  }, []);

  const addLine = () => setLines((prev) => [...prev, { skuId: skus[0]?.id ?? '', quantity: 1 }]);

  const updateLine = (index: number, patch: Partial<{ skuId: string; quantity: number }>) =>
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, i) => i !== index));

  const generate = async () => {
    if (!templateId || !recordId) {
      await enqueueSnackbar({
        message: 'Select a template and a customer first.',
        variant: 'error',
      });
      return;
    }

    const res = await new RestApiClient().post<{ success: boolean; message: string }>(
      '/s/documents/generate',
      { templateId, customerId: recordId, lineItems: lines },
    );

    await enqueueSnackbar({
      message: res.success ? res.message : `Generation failed: ${res.message ?? ''}`,
      variant: res.success ? 'success' : 'error',
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #d9d9d9',
    fontSize: '13px',
    background: '#fff',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
    display: 'block',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '6px',
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
        Generate quote / invoice
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Template</label>
        <select
          style={inputStyle}
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          {templates.length === 0 && <option value="">No templates yet</option>}
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.type})
            </option>
          ))}
        </select>
      </div>

      {recordId ? (
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
          Customer selected: 1 record
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#c0392b', marginBottom: '12px' }}>
          Select exactly one Company to generate a document for.
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={labelStyle}>Line items</label>
          <button
            onClick={addLine}
            style={{
              fontSize: '12px',
              border: '1px solid #d9d9d9',
              background: '#fff',
              borderRadius: '6px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            + Add
          </button>
        </div>

        {lines.length === 0 && (
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            No line items yet.
          </div>
        )}

        {lines.map((line, index) => (
          <div key={index} style={rowStyle}>
            <select
              style={{ flex: 2, ...inputStyle }}
              value={line.skuId}
              onChange={(e) => updateLine(index, { skuId: e.target.value })}
            >
              {skus.length === 0 && <option value="">No SKUs yet</option>}
              {skus.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name} ({s.unitPrice})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              style={{ flex: 1, ...inputStyle }}
              value={line.quantity}
              onChange={(e) => updateLine(index, { quantity: Number(e.target.value) || 1 })}
            />
            <button
              onClick={() => removeLine(index)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#c0392b',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={!recordId}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          background: recordId ? '#3b82f6' : '#cbd5e1',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: recordId ? 'pointer' : 'not-allowed',
          marginTop: '8px',
        }}
      >
        Generate
      </button>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GENERATE_QUOTE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'generate-quote-form',
  description: 'Side-panel form to pick a template, add SKU line items, and generate a quote or invoice.',
  component: GenerateQuoteForm,
});
