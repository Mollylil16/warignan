import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { useActivePromotions } from '../../hooks/usePromotions';

export default function ActivePromotionsBanner() {
  const { data: promos = [] } = useActivePromotions();

  const display = useMemo(() => promos.slice(0, 3), [promos]);
  if (display.length === 0) return null;

  return (
    <div className="border-b border-white/10 bg-[#0b0b0b]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          <Tag className="h-4 w-4 text-tiktok-cyan" strokeWidth={2} aria-hidden />
          Codes promo actifs aujourd’hui
        </div>
        <div className="flex flex-wrap gap-2">
          {display.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-neutral-200"
              title={p.label}
            >
              <span className="font-bold tracking-wide text-white">{p.code}</span>
              <span className="text-neutral-400">
                {p.type === 'percent' ? `-${p.value}%` : `-${p.value} FCFA`}
              </span>
            </span>
          ))}
          {promos.length > display.length && (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-400">
              +{promos.length - display.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

