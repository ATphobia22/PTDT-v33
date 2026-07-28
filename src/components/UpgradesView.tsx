import React from 'react';
import { ArrowUpRight, CheckCircle2, GitPullRequest, Layers, ShieldCheck, Zap } from 'lucide-react';

export function UpgradesView() {
  const initiatives = [
    {
      id: 'hydro-ml',
      title: 'ML Hydrological Modeling',
      description: 'Integrate advanced machine learning for predictive flood modeling, improving lead times by 48+ hours over traditional physics-based models.',
      icon: <Layers size={16} className="text-indigo-400" />,
      status: 'Proposed',
      priority: 'High',
      metric: 'Data Training',
      progress: 25
    },
    {
      id: 'usace-sync',
      title: 'USACE Data Synchronization',
      description: 'Direct API integration with US Army Corps of Engineers (USACE) reservoir schedules to account for upstream dam releases in real-time.',
      icon: <GitPullRequest size={16} className="text-emerald-400" />,
      status: 'In Review',
      priority: 'Critical',
      metric: 'Integration Test',
      progress: 65
    },
    {
      id: 'fema-hazus',
      title: 'FEMA HAZUS Export',
      description: 'Automated export of flood inundation polygons directly into FEMA HAZUS format for rapid economic damage assessment.',
      icon: <CheckCircle2 size={16} className="text-amber-400" />,
      status: 'Planned',
      priority: 'Medium',
      metric: 'Schema Design',
      progress: 10
    },
    {
      id: 'fed-auth',
      title: 'FedRAMP Compliance Auth',
      description: 'Upgrade identity and access management to meet FedRAMP Moderate baseline, enabling federal agency adoption.',
      icon: <ShieldCheck size={16} className="text-blue-400" />,
      status: 'Active',
      priority: 'High',
      metric: 'Audit Prep',
      progress: 85
    }
  ];

  return (
    <div className="flex flex-col gap-4 font-sans text-slate-100 h-full">
      <div className="border-b border-slate-800 pb-3 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400">
          <Zap size={16} />
          <h2 className="text-sm font-bold uppercase tracking-wider">Strategic Upgrades</h2>
        </div>
        <span className="text-[10px] text-indigo-400 font-mono border border-indigo-400/30 bg-indigo-400/10 px-2 py-0.5 rounded">ROADMAP</span>
      </div>
      
      <div className="text-xs text-slate-400 mb-2 leading-relaxed">
        System enhancements required to achieve federal/state agency operational certification and realize full predictive flood-prevention capabilities.
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pb-4 pr-1 scrollbar-hide">
        {initiatives.map((item) => (
          <div key={item.id} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 hover:bg-slate-900/60 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-bold text-xs text-slate-200">{item.title}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                  item.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  item.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-700/50 text-slate-300'
                }`}>
                  {item.priority}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              {item.description}
            </p>
            
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1 text-[9px] font-mono uppercase text-slate-500">
                <span>Phase: {item.metric}</span>
                <span>{item.progress}%</span>
              </div>
              <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    item.status === 'Active' ? 'bg-blue-500' :
                    item.status === 'In Review' ? 'bg-emerald-500' :
                    item.status === 'Proposed' ? 'bg-indigo-500' :
                    'bg-slate-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Status: <span className={item.status === 'Active' ? 'text-blue-400' : 'text-slate-300'}>{item.status}</span></span>
              <button className="text-[10px] text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                View Spec <ArrowUpRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
