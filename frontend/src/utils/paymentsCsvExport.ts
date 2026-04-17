import type { StaffPaymentEventRow } from '../hooks/usePayments';

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[;"'\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function targetDetail(r: StaffPaymentEventRow): string {
  if (!r.target) return '';
  if (r.target.kind === 'order') return `${r.target.clientName} — ${r.target.city}`;
  return `${r.target.clientName} — ${r.target.clientPhone}`;
}

function targetKind(r: StaffPaymentEventRow): string {
  if (!r.target) return '';
  return r.target.kind === 'order' ? 'commande' : 'réservation';
}

/**
 * Export CSV (séparateur `;`, UTF-8 avec BOM) pour ouverture correcte dans Excel locale FR.
 */
export function downloadStaffPaymentsCsv(rows: StaffPaymentEventRow[], baseName: string): void {
  const sep = ';';
  const headers = [
    'Référence',
    'Montant_FCFA',
    'Cumul_confirmé_FCFA',
    'Objectif_FCFA',
    'Reste_objectif_FCFA',
    'Flow',
    'Provider',
    'Statut',
    'Match_cible',
    'Type_cible',
    'Détail_cible',
    'Date_ISO',
  ];

  const lines = [
    headers.join(sep),
    ...rows.map((r) =>
      [
        csvCell(r.reference),
        csvCell(r.amountFcfa),
        csvCell(r.confirmedCumulativeFcfa ?? 0),
        csvCell(r.expectedFcfa ?? ''),
        csvCell(r.balanceAfterFcfa ?? ''),
        csvCell(r.flow),
        csvCell(r.provider ?? ''),
        csvCell(r.status),
        csvCell(r.match ? 'oui' : 'non'),
        csvCell(targetKind(r)),
        csvCell(targetDetail(r)),
        csvCell(r.createdAt),
      ].join(sep)
    ),
  ];

  const blob = new Blob([`\uFEFF${lines.join('\n')}\n`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}.csv`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
