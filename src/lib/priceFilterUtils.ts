export function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN');
}

export function parsePrice(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(/,/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export function getPriceSuggestions(value: number): string[] {
  if (value === 0) return [];
  const suggestions: string[] = [];
  const maxPrice = 5000000;
  if (value < 1000) {
    const s1 = value * 100000;
    const s2 = value * 1000000;
    if (s1 <= maxPrice) suggestions.push(formatNumber(s1));
    if (s2 <= maxPrice) suggestions.push(formatNumber(s2));
  } else if (value < 10000) {
    const s1 = value * 100;
    const s2 = value * 1000;
    if (s1 <= maxPrice) suggestions.push(formatNumber(s1));
    if (s2 <= maxPrice) suggestions.push(formatNumber(s2));
  } else if (value < 100000) {
    const s1 = value * 10;
    const s2 = value * 100;
    if (s1 <= maxPrice) suggestions.push(formatNumber(s1));
    if (s2 <= maxPrice) suggestions.push(formatNumber(s2));
  } else if (value < 1000000) {
    const s1 = value * 10;
    if (s1 <= maxPrice) suggestions.push(formatNumber(s1));
  }
  return suggestions.slice(0, 3);
}
