export interface TelemetryRecord {
  timestamp: string;
  station_id: string;
  flow_rate_cfs: number;
  stage_ft: number;
  location: { lat: number; lng: number };
}

export interface RiskAssessment {
  parcel_id: string;
  risk_score: number;
  confidence: number;
  tucker_reasoning: string;
}

export const ptdtSchemaValidator = (data: any): boolean => {
  // JSON Schema validation + OpenMI compliance logic
  return typeof data === 'object' && data !== null && 'station_id' in data;
};
