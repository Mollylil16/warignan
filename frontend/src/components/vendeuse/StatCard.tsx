import { Link } from 'react-router-dom';

type Tone = 'pink' | 'purple' | 'cyan' | 'green' | 'orange';

const toneBox: Record<Tone, string> = {
  pink: 'border-tiktok-pink/25 bg-tiktok-pink/[0.07]',
  purple: 'border-reserve-purple/25 bg-reserve-purple/[0.07]',
  cyan: 'border-tiktok-cyan/25 bg-tiktok-cyan/[0.07]',
  green: 'border-status-green/25 bg-status-green/[0.07]',
  orange: 'border-status-orange/25 bg-status-orange/[0.07]',
};

const toneValue: Record<Tone, string> = {
  pink: 'text-tiktok-pink',
  purple: 'text-reserve-purple',
  cyan: 'text-tiktok-cyan',
  green: 'text-status-green',
  orange: 'text-status-orange',
};

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  to?: string;
}

const StatCard = ({ label, value, hint, tone = 'purple', to }: StatCardProps) => {
  const inner = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${toneValue[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </>
  );

  const className = `rounded-xl border p-4 transition hover:border-white/20 ${toneBox[tone]}`;

  if (to) {
    return (
      <Link to={to} className={`block ${className} hover:bg-white/[0.04]`}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
};

export default StatCard;
