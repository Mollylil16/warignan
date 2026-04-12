import type { ReactNode } from 'react';

interface OrderCardProps {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  children?: ReactNode;
}

/** Carte récap pour listes admin / vendeuse (contenu libre). */
const OrderCard = ({ title, subtitle, meta, children }: OrderCardProps) => {
  return (
    <article className="rounded-xl border border-white/10 bg-[#111] p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
        {meta}
      </div>
      {children}
    </article>
  );
};

export default OrderCard;
