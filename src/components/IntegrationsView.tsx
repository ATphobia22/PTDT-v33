import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Waves, Activity, Cpu, Layers, GitBranch, Server, Settings, Droplets } from 'lucide-react';

export function IntegrationsView() {
  const integrationCategories = [
    {
      name: "Hydraulic & HEC-RAS Ecosystem",
      icon: <Waves className="w-5 h-5 text-cyan-500" />,
      items: [
        {
          name: "ras-commander",
          desc: "Python API and agentic features for automating HEC-RAS 6.x and accessing HDF data.",
          url: "https://github.com/ATphobia22/ras-commander",
          tags: ["Python", "HEC-RAS", "LLM", "Agentic"]
        },
        {
          name: "ras2fim",
          desc: "Creation of flood inundation raster libraries and rating curves from HEC-RAS models.",
          url: "https://github.com/ATphobia22/ras2fim",
          tags: ["Raster", "HEC-RAS", "Flood", "Inundation"]
        },
        {
          name: "mcat-ras",
          desc: "HEC-RAS Model Content and Analysis Tool (MCAT).",
          url: "https://github.com/ATphobia22/mcat-ras",
          tags: ["Analysis", "HEC-RAS", "Modeling"]
        },
        {
          name: "rgis (RiverGIS)",
          desc: "QGIS plugin for creating HEC-RAS flow model geometry from spatial data.",
          url: "https://github.com/ATphobia22/rgis",
          tags: ["QGIS", "Geometry", "HEC-RAS", "Python"]
        }
      ]
    },
    {
      name: "USACE & Hydrologic Infrastructure",
      icon: <Database className="w-5 h-5 text-indigo-500" />,
      items: [
        {
          name: "cwms-database",
          desc: "The USACE/CWMS Database for storing hydrologic data.",
          url: "https://github.com/ATphobia22/cwms-database",
          tags: ["Oracle", "USACE", "Database", "Hydrology"]
        },
        {
          name: "cwms-cli",
          desc: "Command line utilities used for Corps Water Management Systems (CWMS) processes.",
          url: "https://github.com/ATphobia22/cwms-cli",
          tags: ["CLI", "USACE", "CWMS", "Automation"]
        },
        {
          name: "rts-utils",
          desc: "Data acquisition utilities that work with HEC-RTS.",
          url: "https://github.com/ATphobia22/rts-utils",
          tags: ["HEC-RTS", "USACE", "Data Acquisition"]
        },
        {
          name: "USACE-AR-Simulator",
          desc: "An AR educational simulator built for the U.S. Army Corps of Engineers to visualize stormwater runoff.",
          url: "https://github.com/ATphobia22/USACE-AR-Simulator",
          tags: ["AR", "Unity", "USACE", "Education"]
        }
      ]
    },
    {
      name: "FEMA & Flood Intelligence",
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      items: [
        {
          name: "mcp-openfema",
          desc: "OpenFEMA MCP — US Federal Emergency Management Agency open data.",
          url: "https://github.com/ATphobia22/mcp-openfema",
          tags: ["MCP", "FEMA", "API", "Open Data"]
        },
        {
          name: "federal-emergency-management-agency",
          desc: "FEMA agency tools and disaster response coordination implementations.",
          url: "https://github.com/ATphobia22/federal-emergency-management-agency",
          tags: ["FEMA", "Disaster Response", "Coordination"]
        },
        {
          name: "Flood-Risk-Assessment",
          desc: "Flood Insurance Rate Map (FIRM) improvement and processing algorithms for FEMA.",
          url: "https://github.com/ATphobia22/Flood-Risk-Assessment",
          tags: ["FEMA", "FIRM", "Risk", "Mapping"]
        },
        {
          name: "Flood-Insurance-claim-Using-Deep-Learning",
          desc: "Deep learning models for FEMA insurance claims and visualization in Power BI.",
          url: "https://github.com/ATphobia22/Flood-Insurance-claim-Using-Deep-Learning",
          tags: ["Deep Learning", "FEMA", "Claims", "Analysis"]
        },
        {
          name: "h2oai-flood-intelligence-agent",
          desc: "AI-powered flood intelligence system featuring H2O GPTe Agent + NVIDIA NIM integration.",
          url: "https://github.com/ATphobia22/h2oai-flood-intelligence-agent",
          tags: ["AI", "NVIDIA NIM", "Flood Intelligence", "LLM"]
        }
      ]
    },
    {
      name: "Digital Twins & Extended Analytics",
      icon: <Cpu className="w-5 h-5 text-purple-500" />,
      items: [
        {
          name: "awesome-digital-twins",
          desc: "Curated repository of awesome Digital Twin resources and implementations.",
          url: "https://github.com/ATphobia22/awesome-digital-twins",
          tags: ["Digital Twin", "Resources", "Curated"]
        },
        {
          name: "forge-digital-twin",
          desc: "Autodesk Forge application demonstrating various use cases in digital twins.",
          url: "https://github.com/ATphobia22/forge-digital-twin",
          tags: ["Autodesk Forge", "Digital Twin", "3D"]
        },
        {
          name: "modflow-setup",
          desc: "Python package for automating the setup of MODFLOW groundwater flow models.",
          url: "https://github.com/ATphobia22/modflow-setup",
          tags: ["Python", "MODFLOW", "Groundwater", "Simulation"]
        },
        {
          name: "nfie-floodmap",
          desc: "National Inundation Mapping collaboration among CyberGIS, NFIE, and HydroShare.",
          url: "https://github.com/ATphobia22/nfie-floodmap",
          tags: ["HydroShare", "Inundation", "CyberGIS", "NFIE"]
        }
      ]
    },
    {
      name: "3D Visualization & Cinema Software",
      icon: <Layers className="w-5 h-5 text-amber-500" />,
      items: [
        {
          name: "openmoonray",
          desc: "MoonRay is a state-of-the-art production path tracing renderer, initially developed at DreamWorks Animation.",
          url: "https://github.com/ATphobia22/openmoonray",
          tags: ["Render", "VFX", "Cinema", "Raytracing"]
        },
        {
          name: "appleseed",
          desc: "A modern, open-source physical rendering engine for animation and visual effects.",
          url: "https://github.com/ATphobia22/appleseed",
          tags: ["Animation", "Visual Effects", "Render"]
        },
        {
          name: "cesium",
          desc: "An open-source JavaScript library for world-class 3D globes and maps.",
          url: "https://github.com/ATphobia22/cesium",
          tags: ["WebGL", "3D Globe", "Maps", "Simulation"]
        },
        {
          name: "Matterport3DSimulator",
          desc: "AI Research Platform for Reinforcement Learning from Real Panoramic Images.",
          url: "https://github.com/ATphobia22/Matterport3DSimulator",
          tags: ["Matterport", "Simulation", "AI", "3D"]
        },
        {
          name: "awesome-blender",
          desc: "A curated list of awesome Blender addons, tools, tutorials, and 3D resources.",
          url: "https://github.com/ATphobia22/awesome-blender",
          tags: ["Blender", "3D Resources", "Addons"]
        }
      ]
    }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Ecosystem Integrations & Data Sources</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-3xl">
            A comprehensive mapping of available proprietary and open-source systems that can be interconnected to power the Digital Twin engine. Leveraging repositories from USACE, FEMA, USGS, and deep learning models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationCategories.map((category, idx) => (
            <Card key={idx} className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#020617]/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {category.icon}
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {category.items.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5 pb-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1.5"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      {item.name}
                    </a>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.tags.map((tag, t) => (
                        <span key={t} className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-800 text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
