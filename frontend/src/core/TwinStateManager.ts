/** Fail-closed twin state machine. Presentation layers never force VALID. */
export const TWIN_STATES = {
  OFFLINE: { name: 'OFFLINE', color: 'slate', label: 'OFFLINE' },
  BOOTSTRAP: { name: 'BOOTSTRAP', color: 'sky', label: 'BOOTSTRAPPING' },
  LIVE_TELEMETRY: { name: 'LIVE_TELEMETRY', color: 'emerald', label: 'LIVE TELEMETRY' },
  HYDROLOGIC_SIMULATION: { name: 'HYDROLOGIC_SIMULATION', color: 'blue', label: 'SIMULATION RUNNING' },
  DEGRADED_STALE: { name: 'DEGRADED_STALE', color: 'amber', label: 'DEGRADED / STALE' },
  CRITICAL_INUNDATION: { name: 'CRITICAL_INUNDATION', color: 'red', label: 'CRITICAL INUNDATION' },
  FAIL_CLOSED: { name: 'FAIL_CLOSED', color: 'purple', label: 'FAIL CLOSED' },
} as const;

export type TwinStateName = keyof typeof TWIN_STATES;

export interface TransitionRecord {
  state: TwinStateName;
  previous: TwinStateName;
  timestamp: string;
  reason: string;
  evidenceHash?: string;
}

export type TwinEvent =
  | 'CONNECT_TELEMETRY'
  | 'RUN_SIMULATION'
  | 'SIMULATION_COMPLETE'
  | 'MODFLOW_FAILURE'
  | 'HEC_RAS_FAILURE'
  | 'CRITICAL_SURCHARGE'
  | 'SECURITY_BREACH'
  | 'RESET';

export class TwinStateManager {
  private current: TwinStateName;
  private history: TransitionRecord[] = [];
  private onTransition?: (r: TransitionRecord) => void;

  constructor(
    initial: TwinStateName = 'LIVE_TELEMETRY',
    onTransition?: (r: TransitionRecord) => void
  ) {
    this.current = initial;
    this.onTransition = onTransition;
    this.history.push({
      state: initial,
      previous: initial,
      timestamp: new Date().toISOString(),
      reason: 'System Initialization',
    });
  }

  getState(): TwinStateName {
    return this.current;
  }

  getHistory(): readonly TransitionRecord[] {
    return this.history;
  }

  transition(
    event: TwinEvent,
    payload: {
      reason?: string;
      stageFt?: number;
      houseFloorFt?: number;
      modflowStatus?: 'VALID' | 'CONVERGENCE_FAILURE' | 'STALE';
      evidenceHash?: string;
    } = {}
  ): TwinStateName {
    const prev = this.current;
    let next: TwinStateName = prev;
    let reason = payload.reason ?? event;

    switch (event) {
      case 'CONNECT_TELEMETRY':
        next = 'LIVE_TELEMETRY';
        break;
      case 'RUN_SIMULATION':
        next = 'HYDROLOGIC_SIMULATION';
        break;
      case 'SIMULATION_COMPLETE':
        if (
          payload.stageFt !== undefined &&
          payload.houseFloorFt !== undefined &&
          payload.stageFt >= payload.houseFloorFt
        ) {
          next = 'CRITICAL_INUNDATION';
          reason = 'House floor elevation breached';
        } else if (payload.modflowStatus !== 'VALID') {
          next = 'DEGRADED_STALE';
          reason = 'MODFLOW6 status not VALID — fail-closed';
        } else {
          next = 'LIVE_TELEMETRY';
        }
        break;
      case 'MODFLOW_FAILURE':
      case 'HEC_RAS_FAILURE':
        next = 'DEGRADED_STALE';
        reason = payload.reason ?? 'Physics solver failure — fail-closed';
        break;
      case 'CRITICAL_SURCHARGE':
        next = 'CRITICAL_INUNDATION';
        break;
      case 'SECURITY_BREACH':
        next = 'FAIL_CLOSED';
        break;
      case 'RESET':
        next = 'LIVE_TELEMETRY';
        break;
    }

    if (next !== prev) {
      this.current = next;
      const record: TransitionRecord = {
        state: next,
        previous: prev,
        timestamp: new Date().toISOString(),
        reason,
        evidenceHash: payload.evidenceHash,
      };
      this.history.push(record);
      this.onTransition?.(record);
    }
    return this.current;
  }
}
