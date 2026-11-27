import { marked } from 'marked';
import xss, { whiteList } from 'xss';

marked.setOptions({
  gfm: true,
  breaks: true
});

const safeWhiteList: Record<string, string[]> = {
  ...whiteList,
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'],
  pre: ['class'],
  table: [],
  thead: [],
  tbody: [],
  tr: [],
  th: ['align'],
  td: ['align'],
  blockquote: [],
  hr: []
};

export function renderSafeMarkdown(markdown: string): string {
  if (!markdown || markdown.trim().length === 0) {
    return '';
  }

  const rawHtml = marked.parse(markdown, { async: false });
  return xss(rawHtml, {
    whiteList: safeWhiteList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
    onTagAttr(tag, name, value) {
      if (tag === 'a' && name === 'href') {
        const trimmed = value.trim().toLowerCase();
        if (
          !trimmed.startsWith('http://') &&
          !trimmed.startsWith('https://') &&
          !trimmed.startsWith('mailto:') &&
          !trimmed.startsWith('/') &&
          !trimmed.startsWith('#')
        ) {
          return '';
        }
      }
      return undefined;
    }
  });
}
