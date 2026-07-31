import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Ruler, 
  Printer, 
  Layers, 
  MousePointer2,
  Info,
  ChevronDown,
  ChevronRight,
  Database,
  Building,
  Navigation
} from 'lucide-react';

interface PoseyGISToolsProps {
  onSearch?: (query: string) => void;
}

export function PoseyGISTools({ onSearch }: PoseyGISToolsProps) {
  const [activeSection, setActiveSection] = useState<string>('search');
  const [searchType, setSearchType] = useState<'owner' | 'address' | 'parcel'>('address');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    parcels: true,
    floodplains: false,
    cityLimits: true,
    townships: false,
    roads: true
  });

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const sections = [
    { id: 'search', title: 'Quick Search', icon: Search },
    { id: 'layers', title: 'Map Layers', icon: Layers },
    { id: 'tools', title: 'Measurement & Tools', icon: Ruler },
    { id: 'identify', title: 'Identify Property', icon: MousePointer2 }
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex gap-3 items-center">
        <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Posey County GIS</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">ThinkGIS® Integrated Data</p>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map(section => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;

          return (
            <div key={section.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => setActiveSection(isActive ? '' : section.id)}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                  isActive ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {section.title}
                  </span>
                </div>
                {isActive ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {isActive && (
                <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                  
                  {/* Search Section */}
                  {section.id === 'search' && (
                    <div className="space-y-3 pt-3">
                      <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                        {(['address', 'owner', 'parcel'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setSearchType(type)}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md capitalize transition-all cursor-pointer ${
                              searchType === type 
                                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`Search by ${searchType}...`}
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                        />
                        <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center">
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Layers Section */}
                  {section.id === 'layers' && (
                    <div className="space-y-2 pt-3">
                      {[
                        { id: 'parcels', label: 'Property Parcels', desc: 'Boundary lines and IDs' },
                        { id: 'cityLimits', label: 'City Limits', desc: 'Municipal boundaries' },
                        { id: 'townships', label: 'Townships', desc: 'Civil township areas' },
                        { id: 'floodplains', label: 'Floodplains', desc: 'FEMA designated zones' },
                        { id: 'roads', label: 'Road Network', desc: 'Street centerlines' }
                      ].map(layer => (
                        <label key={layer.id} className="flex items-start gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={activeLayers[layer.id]}
                            onChange={() => toggleLayer(layer.id)}
                            className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <div>
                            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{layer.label}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">{layer.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Tools Section */}
                  {section.id === 'tools' && (
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      {[
                        { icon: Ruler, label: 'Measure Line' },
                        { icon: Building, label: 'Measure Area' },
                        { icon: MapPin, label: 'Add Marker' },
                        { icon: Printer, label: 'Print Map' }
                      ].map((tool, idx) => (
                        <button key={idx} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all group">
                          <tool.icon className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{tool.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Identify Section */}
                  {section.id === 'identify' && (
                    <div className="pt-3 flex flex-col items-center justify-center p-4 text-center space-y-3">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                        <MousePointer2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Identify Active</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          Click any property on the map to view owner, assessment, and parcel information.
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
