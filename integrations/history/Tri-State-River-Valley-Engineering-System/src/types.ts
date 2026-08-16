export interface ReasoningStep {
  id: string;
  name: string;
  status: "pending" | "running" | "resolved" | "failed";
  output?: string;
  timestamp: string;
}

export interface RalphIteration {
  depth: number;
  thought: string;
  action: string;
  observation: string;
  status: "active" | "complete" | "reset";
}

export interface Qubit {
  x: number;
  y: number;
  type: "data" | "stabilizer_x" | "stabilizer_z";
  error: boolean;
  syndrome: boolean;
  matched: boolean;
}

export interface MedicalTarget {
  name: string;
  gene: string;
  mutation: string;
  plddt: number;
  cure: string;
  editor: string;
  smiles: string;
}

export interface CodeFile {
  name: string;
  path: string;
  category: string;
  language: string;
  content: string;
}
