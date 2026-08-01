import { CodeFile, MedicalTarget } from "./types";

export interface DigitalTwinLayer {
  no: number;
  name: string;
  role: string;
  status: "active" | "locked" | "standby";
  type?: string;
}

export interface DigitalTwinArc {
  id: string;
  name: string;
  range: string;
  description: string;
  icon: string;
  status: string;
  efficiency: string;
  layers: DigitalTwinLayer[];
}

export const DIGITAL_TWIN_ARCS: DigitalTwinArc[] = [
  {
    id: "arc-1",
    name: "System Foundations",
    range: "Layers 1-10",
    description: "Establishes core mission graphs, registries, and low-level state mappings.",
    icon: "Layers",
    status: "locked",
    efficiency: "99.99%",
    layers: [
      { no: 1, name: "Foundry Roots", role: "Identity mapping", status: "locked" },
      { no: 2, name: "ESL Syntax Parser", role: "IR translation", status: "active" },
      { no: 3, name: "Core Mission Graphs", role: "DAG management", status: "locked" }
    ]
  },
  {
    id: "arc-2",
    name: "Distributed & Macro-Systems",
    range: "Layers 11-20",
    description: "Orchestrates distributed routing, agent teams, and acceleration lanes.",
    icon: "Network",
    status: "active",
    efficiency: "98.5%",
    layers: [
      { no: 11, name: "Distributed Fabric", role: "Metadata routing", status: "active" }
    ]
  }
];

export const MEDICAL_TARGETS: MedicalTarget[] = [
  {
    name: "ALZHEIMERS",
    gene: "PSEN1",
    mutation: "M146L",
    plddt: 94.1,
    cure: "BaseEditor_BE4max + Cerium Oxide Nanoparticles",
    editor: "BaseEditor",
    smiles: "CC(C)CC(C(=O)NC(C)C(=O)O)NC(=O)C(CC1=CC=C(C=C1)O)N"
  },
  {
    name: "ALS",
    gene: "SOD1",
    mutation: "G93A",
    plddt: 95.3,
    cure: "PrimeEditor_PE7-La-Fusion with Gold Nanoparticle Carriers",
    editor: "PrimeEditor_PE7",
    smiles: "CC(C)C(C(=O)NC(CO)C(=O)NC(CC(=O)O)C(=O)O)NC(=O)C(CC1=CC=C(C=C1)O)N"
  }
];

export const CORE_CODE_FILES: CodeFile[] = [
  {
    name: "EverythingEverywhere.sh",
    path: "/EverythingEverywhere.sh",
    category: "bootstrap",
    language: "bash",
    content: `#!/bin/bash
# Minimal bootstrap placeholder
set -e
echo "Initializing Tri-State Node..."
`
  },
  {
    name: "governance.py",
    path: "/backend/governance.py",
    category: "governance",
    language: "python",
    content: `# Governance engine placeholder\n# Original large content archived.\n` 
  }
];
