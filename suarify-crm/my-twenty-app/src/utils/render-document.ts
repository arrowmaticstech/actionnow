import { Marked } from 'marked';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const markdown = new Marked({ async: false, gfm: true, breaks: true });

markdown.use({
  renderer: {
    html() {
      return '';
    },
    image() {
      return '';
    },
    link({ href, text }: { href: string; text: string }) {
      const isSafe = /^(https?:|mailto:)/i.test(href ?? '');
      const safeText = escapeHtml(text ?? '');

      return isSafe
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${safeText}</a>`
        : safeText;
    },
  },
});

export const documentContentToHtml = (content: string): string =>
  markdown.parse(content) as string;

export const DOCUMENT_PAPER_CSS = (accent = '#1961ed'): string => `
  .doc-paper {
    color: #1f2430;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
    line-height: 1.7;
    max-width: 720px;
    margin: 48px auto;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(24, 39, 75, 0.08);
    overflow: hidden;
  }
  .doc-body { padding: 64px 72px 72px; }
  .doc-body h1, .doc-body h2, .doc-body h3 { color: #10152a; line-height: 1.3; margin: 32px 0 12px; }
  .doc-body h1 { font-size: 24px; } .doc-body h2 { font-size: 20px; } .doc-body h3 { font-size: 16px; }
  .doc-body p { margin: 0 0 16px; }
  .doc-body ul, .doc-body ol { margin: 0 0 16px; padding-left: 24px; }
  .doc-body li { margin: 4px 0; }
  .doc-body a { color: ${accent}; text-decoration: none; }
  .doc-body a:hover { text-decoration: underline; }
  .doc-body blockquote {
    margin: 16px 0; padding: 4px 20px; border-left: 3px solid ${accent};
    color: #47506a; background: #f6f8fd;
  }
  .doc-body table {
    border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 13px;
  }
  .doc-body th, .doc-body td {
    border: 1px solid #e6e9f2; padding: 8px 12px; text-align: left;
  }
  .doc-body th { background: ${accent}14; color: #10152a; }
  .doc-body code {
    font-family: 'SFMono-Regular', Menlo, monospace; font-size: 0.9em;
    background: #f1f3f9; padding: 2px 6px; border-radius: 4px;
  }
  .doc-body hr { border: 0; border-top: 1px solid #e6e9f2; margin: 32px 0; }
  @media print {
    body { background: #fff; }
    .doc-paper { box-shadow: none; margin: 0; border-radius: 0; max-width: none; }
  }
`;

export const documentPaperHtml = (content: string, accent?: string): string =>
  `<article class="doc-paper">
      <div class="doc-body">
        ${documentContentToHtml(content)}
      </div>
    </article>`;

const PAGE_BODY_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #eef1f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
  }
`;

export const documentHtmlPage = (title: string, content: string, accent?: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${PAGE_BODY_CSS}${DOCUMENT_PAPER_CSS(accent)}</style>
  </head>
  <body>
    ${documentPaperHtml(content, accent)}
  </body>
</html>`;
