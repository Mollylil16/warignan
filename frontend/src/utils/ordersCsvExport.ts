import type { StaffOrderRow } from '../hooks/useOrders';

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[;"'\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadOrdersCsv(rows: StaffOrderRow[], baseName: string): void {
  const sep = ';';
  const headers = [
    'Référence', 'Client', 'Téléphone', 'Ville', 'Articles',
    'Total_FCFA', 'Encaissé_FCFA', 'Reste_FCFA',
    'Statut_paiement', 'Étape', 'Livreur', 'Créée_ISO',
  ];
  const lines = [
    headers.join(sep),
    ...rows.map((o) =>
      [
        csvCell(o.reference),
        csvCell(o.clientName),
        csvCell(o.clientPhone ?? ''),
        csvCell(o.city),
        csvCell(o.itemsSummary),
        csvCell(o.totalFcfa),
        csvCell(o.paidFcfaConfirmed),
        csvCell(o.balanceDueFcfa),
        csvCell(o.paymentStatus),
        csvCell(o.step),
        csvCell(o.courierName ?? ''),
        csvCell(o.createdAt),
      ].join(sep)
    ),
  ];
  const blob = new Blob([`﻿${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8;' });
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
