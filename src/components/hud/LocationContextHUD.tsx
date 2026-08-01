import React from "react";
import { MapPin, Globe, Compass } from "lucide-react";
import { BONEBANK_SITE } from "../../lib/siteConstants";

export const LocationContextHUD: React.FC = () => {
  const details = [
    { label: "Parcel / Owner", value: `${BONEBANK_SITE.owner} · ${BONEBANK_SITE.acreage} ac` },
    { label: "Anchor Node", value: BONEBANK_SITE.name },
    {
      label: "Jurisdiction",
      value: `${BONEBANK_SITE.city}, ${BONEBANK_SITE.state} ${BONEBANK_SITE.zip}`,
    },
    {
      label: "Coordinates",
      value: `${BONEBANK_SITE.lat.toFixed(4)}° N, ${Math.abs(BONEBANK_SITE.lon).toFixed(4)}° W`,
    },
    {
      label: "BFE / LAG (NAVD88)",
      value: `${BONEBANK_SITE.bfe_ft_navd88.toFixed(1)} / ${BONEBANK_SITE.lag_ft_navd88.toFixed(1)} ft`,
    },
    {
      label: "Section / Township",
      value: `S${BONEBANK_SITE.section}, ${BONEBANK_SITE.township}, ${BONEBANK_SITE.range}`,
    },
    { label: "USGS Gauge", value: BONEBANK_SITE.usgs_gauge },
    { label: "State Parcel Prefix", value: BONEBANK_SITE.stateParcelPrefix },
  ];

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 w-64 pointer-events-auto flex flex-col gap-3 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <MapPin size={14} className="text-emerald-500" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Location Context
        </span>
      </div>

      <div className="space-y-2.5">
        {details.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider">{item.label}</span>
            <span className="text-[11px] text-white font-bold tracking-wide">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
        <div className="flex-1 flex flex-col items-center p-1.5 bg-slate-900/50 rounded-sm">
          <Globe size={12} className="text-slate-600 mb-1" />
          <span className="text-[8px] text-slate-400 uppercase font-mono">WGS84</span>
        </div>
        <div className="flex-1 flex flex-col items-center p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
          <Compass size={12} className="text-emerald-500 mb-1" />
          <span className="text-[8px] text-emerald-500 uppercase font-mono">NAVD88</span>
        </div>
      </div>
    </div>
  );
};
