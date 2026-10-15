'use client';
import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

/** Decode the entity forms already handled by existing detail-page rendering. */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Decode repeated and numeric entities used in WordPress listing fields. */
function decodeListingEntities(str: string): string {
  let decoded = str;
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decoded
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const codePoint = parseInt(hex, 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '';
      })
      .replace(/&#([0-9]+);/g, (_, dec) => {
        const codePoint = parseInt(dec, 10);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '';
      })
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ');
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

const RICH_CONTENT_TAGS = [
  'a', 'b', 'blockquote', 'br', 'del', 'div', 'em', 'figcaption', 'figure',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'li', 'ol',
  'p', 's', 'span', 'strong', 'sub', 'sup', 'u', 'ul',
];
const INLINE_CONTENT_TAGS = ['a', 'b', 'br', 'del', 'em', 'i', 'ins', 's', 'span', 'strong', 'sub', 'sup', 'u'];
const RICH_CONTENT_ATTRIBUTES = ['alt', 'href', 'rel', 'src', 'target', 'title'];

function sanitizeRichHtml(content: string, inline = false): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: inline ? INLINE_CONTENT_TAGS : RICH_CONTENT_TAGS,
    ALLOWED_ATTR: RICH_CONTENT_ATTRIBUTES,
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
  });
}

/** Convert rich HTML to safe plain text for image alternatives and navigation labels. */
export function richTextToPlainText(content: string): string {
  if (!content) return '';
  return decodeListingEntities(DOMPurify.sanitize(decodeListingEntities(content), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
  })).replace(/\s+/g, ' ').trim();
}

/** Render a WordPress name/title with safe inline formatting. */
export function RichInlineContent({ content, className = '' }: { content: string; className?: string }) {
  if (!content) return null;

  const safeHtml = sanitizeRichHtml(decodeListingEntities(content), true);
  return <span className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}

/**
 * Strip layout wrapper divs that WP sometimes saves around content,
 * leaving only the inner semantic HTML (p, a, strong, etc.).
 * Handles patterns like: <div class="md:col-span-6 ..."><div ...><p>text</p></div></div>
 */
export function stripWrapperDivs(html: string): string {
  let result = html.trim();
  // Repeatedly unwrap outermost <div ...>...</div> if it contains no sibling elements
  const divPattern = /^<div[^>]*>([\s\S]*)<\/div>\s*$/i;
  for (let i = 0; i < 10; i++) {
    const match = result.match(divPattern);
    if (!match) break;
    const inner = match[1].trim();
    // Only unwrap if the inner content doesn't start with multiple sibling divs
    // (i.e. this div is purely a wrapper, not a layout container with siblings)
    result = inner;
  }
  return result;
}

/**
 * Auto-link bare URLs in text content.
 */
export function autoLink(text: string): string {
  return text.replace(
    /(?<!href=")(?<!src=")(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">$1</a>'
  );
}

/**
 * Render content with double paragraph spacing and auto-linked URLs.
 * Handles both plain text (\n\n separated) and HTML (<p> tagged) content.
 */
export function RichContent({
  content,
  className = '',
  bold = false,
}: {
  content: string;
  className?: string;
  bold?: boolean;
}) {
  if (!content) return null;

  const decoded = decodeEntities(content);
  const isHtml = /<[a-z][\s\S]*>/i.test(decoded);

  if (isHtml) {
    const linked = autoLink(decoded);
    return (
      <div
        className={`rich-content ${bold ? '[&_a]:font-bold' : ''} ${className}`}
        dangerouslySetInnerHTML={{ __html: linked }}
      />
    );
  }

  // Plain text — split on double newlines into paragraphs
  const paragraphs = decoded
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className={`rich-content ${className}`}>
      {paragraphs.map((para, i) => {
        const linked = autoLink(para.replace(/\n/g, '<br/>'));
        return (
          <p
            key={i}
            className={bold ? '[&_a]:font-bold' : ''}
            dangerouslySetInnerHTML={{ __html: linked }}
          />
        );
      })}
    </div>
  );
}

/** Render listing descriptions with formatting allow-listed for WP HTML. */
export function SafeRichContent({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;

  const decoded = decodeListingEntities(content);
  const isHtml = /<[a-z][\s\S]*>/i.test(decoded);
  const safeAutoLink = (text: string) => text.replace(
    /(?<!href=")(?<!src=")(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  if (isHtml) {
    return (
      <div
        className={`rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(decoded) }}
      />
    );
  }

  const paragraphs = decoded
    .split(/\n\n+/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={`rich-content ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichHtml(safeAutoLink(paragraph.replace(/\n/g, '<br/>'))),
          }}
        />
      ))}
    </div>
  );
}
