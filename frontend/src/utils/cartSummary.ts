import type { CartLine } from '../stores/cartStore';

export function cartLinesToSummary(lines: CartLine[], maxLen = 1900): string {
  const parts = lines.map((l) => `${l.code} ×${l.quantity}`);
  const s = parts.join(', ');
  return s.length <= maxLen ? s : `${s.slice(0, maxLen - 1)}…`;
}
