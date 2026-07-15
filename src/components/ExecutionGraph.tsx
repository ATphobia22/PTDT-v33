import { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SolverNode } from './SolverNode';
import { Play, RotateCcw } from 'lucide-react';

const nodeTypes = {
  solver: SolverNode,
};

const defaultNodes: Node[] = [
  { id: 'n1', type: 'solver', position: { x: 300, y: 50 }, data: { label: 'SWMM', sublabel: 'Hydrologic Forcing', icon: 'swmm', status: 'pending' } },
  { id: 'n2', type: 'solver', position: { x: 100, y: 180 }, data: { label: 'HEC-RAS 2D', sublabel: 'Surface Routing', icon: 'hecras', status: 'pending' } },
  { id: 'n3', type: 'solver', position: { x: 500, y: 180 }, data: { label: 'MODFLOW 6', sublabel: 'Groundwater Flow', icon: 'modflow', status: 'pending' } },
  { id: 'n4', type: 'solver', position: { x: 100, y: 310 }, data: { label: 'Sediment Scour', sublabel: 'Bed Shear & Scour', icon: 'scour', status: 'pending' } },
  { id: 'n5', type: 'solver', position: { x: 500, y: 310 }, data: { label: 'Bishop Stability', sublabel: 'Factor of Safety', icon: 'bishop', status: 'pending' } },
  { id: 'n6', type: 'solver', position: { x: 300, y: 440 }, data: { label: 'EnKF Assimilation', sublabel: 'State Update', icon: 'enkf', status: 'pending' } },
  { id: 'n7', type: 'solver', position: { x: 300, y: 570 }, data: { label: 'Evidence Manifest', sublabel: 'Governance', icon: 'evidence', status: 'pending' } },
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2' },
  { id: 'e1-3', source: 'n1', target: 'n3' },
  { id: 'e2-4', source: 'n2', target: 'n4' },
  { id: 'e3-5', source: 'n3', target: 'n5' },
  { id: 'e4-5', source: 'n4', target: 'n5' },
  { id: 'e2-6', source: 'n2', target: 'n6' },
  { id: 'e3-6', source: 'n3', target: 'n6' },
  { id: 'e5-6', source: 'n5', target: 'n6' },
  { id: 'e6-7', source: 'n6', target: 'n7' },
];

const scenario = [
  { time: 500, updates: { n1: 'running' } },
  { time: 2000, updates: { n1: 'success', n2: 'running', n3: 'running' } },
  { time: 4000, updates: { n3: 'success' } }, // MODFLOW fast
  { time: 6000, updates: { n2: 'success', n4: 'running' } }, // HEC-RAS finishes, scour starts
  { time: 8000, updates: { n4: 'success', n5: 'running' } }, // Scour finishes, bishop starts
  { time: 10000, updates: { n5: 'success', n6: 'running' } }, // Bishop finishes, EnKF starts
  { time: 12000, updates: { n6: 'success', n7: 'running' } },
  { time: 13500, updates: { n7: 'success' } },
];

export function ExecutionGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Derive edges dynamically based on node status
  useMemo(() => {
    const updatedEdges = defaultEdges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const isSourceSuccess = sourceNode?.data.status === 'success';
      const isSourceRunning = sourceNode?.data.status === 'running';
      
      return {
        ...edge,
        animated: isSourceRunning || isSourceSuccess,
        style: {
          stroke: isSourceSuccess ? '#10b981' : isSourceRunning ? '#f59e0b' : '#334155',
          strokeWidth: isSourceSuccess || isSourceRunning ? 2 : 1,
          transition: 'stroke 0.5s ease',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSourceSuccess ? '#10b981' : isSourceRunning ? '#f59e0b' : '#334155',
        },
      };
    });
    setEdges(updatedEdges);
  }, [nodes, setEdges]);

  const startSimulation = () => {
    setIsPlaying(true);
    setNodes(defaultNodes);
    
    scenario.forEach(({ time, updates }) => {
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => {
            if (updates[n.id as keyof typeof updates]) {
              return {
                ...n,
                data: { ...n.data, status: updates[n.id as keyof typeof updates] },
              };
            }
            return n;
          })
        );
      }, time);
    });

    setTimeout(() => {
      setIsPlaying(false);
    }, scenario[scenario.length - 1].time + 500);
  };

  const resetSimulation = () => {
    setNodes(defaultNodes);
    setIsPlaying(false);
  };

  return (
    <div className="w-full h-full relative dark:bg-[#020617] bg-slate-50">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <h2 className="text-xl font-bold dark:text-slate-100 text-slate-900 tracking-tight">PTDT v32 Execution Graph</h2>
        <p className="text-sm dark:text-slate-400 text-slate-500 font-mono">Prefect / Temporal Orchestration</p>
      </div>

      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <button
          onClick={resetSimulation}
          disabled={isPlaying}
          className="flex items-center gap-2 px-4 py-2 rounded-md dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 font-medium text-sm transition-colors disabled:opacity-50"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          onClick={startSimulation}
          disabled={isPlaying}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
        >
          <Play size={16} />
          Run DAG
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="dark:bg-[#020617] bg-slate-50"
      >
        <Background color="#1e293b" gap={24} size={2} />
        <Controls className="dark:!bg-slate-900 bg-slate-100 dark:!border-slate-800 border-slate-200 !fill-slate-400" />
      </ReactFlow>
    </div>
  );
}
