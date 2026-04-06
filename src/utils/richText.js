/**
 * Detect whether a string contains HTML markup.
 * Used to handle legacy plain-text descriptions alongside new rich-text HTML.
 */
export function isHtml(str) {
  return /<[a-z][\s\S]*>/i.test(str ?? '');
}
