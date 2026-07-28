import { create } from 'zustand';

interface HydroState {
  stageFt: number;
  dischargeCfs: number;
  depthM: number;
  velocityMs: number;
  governanceDecision: string;
  setTelemetry: (stage: number, flow: number, depth: number, velocity: number) => void;
  setGovernance: (decision: string) => void;
}

export const useHydroStore = create<HydroState>((set) => ({
  stageFt: 381.2,
  dischargeCfs: 142000,
  depthM: 3.41,
  velocityMs: 1.45,
  governanceDecision: 'STANDBY',
  setTelemetry: (stage, flow, depth, velocity) =>
    set({ stageFt: stage, dischargeCfs: flow, depthM: depth, velocityMs: velocity }),
  setGovernance: (decision) => set({ governanceDecision: decision }),
}));
