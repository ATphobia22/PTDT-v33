export interface EvidenceNode {
  provenance_id: string;
  source: string;
  source_record_id: string;
  role: string;
  authority: string;
  observed_at?: string | null;
  retrieved_at: string;
  spatial_ref?: string | null;
  vertical_datum?: string | null;
  units?: string | null;
  payload: Record<string, unknown>;
  payload_sha256: string;
  parent_ids: string[];
}

export interface EvidenceEdge {
  edge_id: string;
  from_id: string;
  to_id: string;
  relation: string;
  semantics: string;
}

export interface EvidenceSelection {
  root: EvidenceNode;
  related: EvidenceNode[];
  edges: EvidenceEdge[];
  read_only: true;
  calculation_authority: 'archimedes';
}

export function renderEvidenceSelection(selection: EvidenceSelection): string {
  const lines = [
    'EVIDENCE CHAIN',
    `ROOT ${selection.root.provenance_id}`,
    `SOURCE ${selection.root.source}`,
    `ROLE ${selection.root.role}`,
    `AUTHORITY ${selection.root.authority}`,
    `RECORD ${selection.root.source_record_id}`,
    `PAYLOAD SHA256 ${selection.root.payload_sha256}`,
    `RELATED ${selection.related.length}`,
    `EDGES ${selection.edges.length}`,
    'CALCULATION AUTHORITY ARCHIMEDES',
    'READ ONLY TRUE',
  ];
  return lines.join('\n');
}
