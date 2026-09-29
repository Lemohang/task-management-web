
import { MoreHorizontal } from 'lucide-react';
import { ReactNode } from 'react';

type Accent = 'green' | 'blue' | 'orange' | 'purple';

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  accent: Accent;
  description: string;
};

const styles = {
  green: {
    icon: 'border-[#39ff14]/10 bg-[#39ff14]/[0.07] text-[#39ff14]',
    glow: 'bg-[#39ff14]/10',
  },
  blue: {
    icon: 'border-sky-400/10 bg-sky-400/[0.06] text-sky-300',
    glow: 'bg-sky-400/10',
  },
  orange: {
    icon: 'border-orange-400/10 bg-orange-400/[0.06] text-orange-300',
    glow: 'bg-orange-400/10',
  },
  purple: {
    icon: 'border-purple-400/10 bg-purple-400/[0.06] text-purple-300',
    glow: 'bg-purple-400/10',
  },
};

export default function StatCard({
  label,
  value,
  icon,
  accent,
  description,
}: StatCardProps) {
  const style = styles[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.028]">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full blur-[45px] ${style.glow}`}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${style.icon}`}
          >
            {icon}
          </div>

          <MoreHorizontal className="h-4 w-4 text-white/20" />
        </div>

        <div className="mt-6 text-3xl font-semibold tracking-tight text-white">
          {value}
        </div>

        <div className="mt-1 text-sm font-medium text-white/55">
          {label}
        </div>

        <div className="mt-1 text-[10px] text-white/25">
          {description}
        </div>
      </div>
    </div>
  );
}
