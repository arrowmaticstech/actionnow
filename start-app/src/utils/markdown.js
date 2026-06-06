import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function markdownToHtml(markdown) {
  const text = String(markdown ?? '').trim();
  if (!text) return '';
  return marked.parse(text);
}
