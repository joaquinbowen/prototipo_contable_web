import type { InventoryItem } from '../types';

export function normalizeItemName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\b(de|del|para|con|la|el|los|las)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').map((word) => word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word).join(' ');
}

export function suggestInventoryItem(description: string, inventory: InventoryItem[]): { item: InventoryItem; score: number } | null {
  const source = normalizeItemName(description);
  if (!source) return null;
  const words = source.split(' ').filter((word) => word.length > 2);
  const ranked = inventory.map((item) => {
    const candidate = normalizeItemName(item.nombre);
    const candidateWords = candidate.split(' ').filter((word) => word.length > 2);
    const matching = words.filter((word) => candidateWords.includes(word)).length;
    const score = source === candidate ? 1 : Math.min(words.length, candidateWords.length) ? matching / Math.min(words.length, candidateWords.length) : 0;
    return { item, score };
  }).sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 0.5 ? ranked[0] : null;
}
