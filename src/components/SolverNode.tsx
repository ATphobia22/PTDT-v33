import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, CircleDashed, Loader2, XCircle, Activity, Database, FileText, Droplets, Mountain, Waves, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap = {
  swmm: Droplets,
  hecras: Waves,
  modflow: Database,
  scour: Activity,
  bishop: Mountain,
  enkf: Zap,
  evidence: FileText,
};

export function SolverNode({ data }: any) {
  const status = data.status || 'pending';
  const Icon = iconMap[data.icon as keyof typeof iconMap] || Activity;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border dark:bg-[#0F172A] bg-white shadow-lg min-w-[220px] flex items-center gap-3 transition-all duration-500",
      status === 'pending' && "dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-500",
      status === 'running' && "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:text-slate-100 text-slate-900",
      status === 'success' && "border-emerald-500/30 dark:bg-[#064E3B]/10 bg-emerald-50 dark:text-slate-100 text-slate-900",
      status === 'failed' && "border-red-500/50 dark:bg-[#7F1D1D]/10 bg-red-50 dark:text-slate-100 text-slate-900"
    )}>
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-slate-600 !border-none" />
      
      <div className={cn(
        "p-2 rounded-lg transition-colors duration-500",
        status === 'pending' && "dark:bg-slate-800 bg-white/50 dark:text-slate-500 text-slate-400",
        status === 'running' && "bg-amber-500/20 text-amber-400",
        status === 'success' && "bg-emerald-500/20 text-emerald-400",
        status === 'failed' && "bg-red-500/20 text-red-400"
      )}>
        <Icon size={18} />
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-medium tracking-wide">{data.label}</div>
        <div className="text-[10px] uppercase opacity-50 font-mono tracking-wider mt-0.5">{data.sublabel}</div>
      </div>

      <div className="ml-2">
        {status === 'pending' && <CircleDashed size={16} className="opacity-30" />}
        {status === 'running' && <Loader2 size={16} className="animate-spin text-amber-400" />}
        {status === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
        {status === 'failed' && <XCircle size={16} className="text-red-400" />}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-slate-600 !border-none" />
    </div>
  );
}
