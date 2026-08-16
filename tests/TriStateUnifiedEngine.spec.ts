import { describe, it, expect } from 'vitest';
import TriStateUnifiedEngine, { FALLBACK_BUILDING_HEIGHT_M, LEVEL_HEIGHT_M } from '../src/lib/TriStateUnifiedEngine';

describe('TriStateUnifiedEngine.normalizeBuildingHeight', () => {
  it('returns explicit meters when provided as number', () => {
    const result = TriStateUnifiedEngine.normalizeBuildingHeight({ height_m: 5.5 });
    expect(result.heightMeters).toBeCloseTo(5.5);
    expect(result.method).toBe('explicit_height_m');
  });

  it('parses numeric string meters', () => {
    const result = TriStateUnifiedEngine.normalizeBuildingHeight({ height_m: '6.25' });
    expect(result.heightMeters).toBeCloseTo(6.25);
  });

  it('converts feet to meters', () => {
    const result = TriStateUnifiedEngine.normalizeBuildingHeight({ height_ft: 10 });
    expect(result.heightMeters).toBeCloseTo(10 * 0.3048);
    expect(result.method).toBe('explicit_height_ft_to_m');
  });

  it('uses levels heuristic', () => {
    const result = TriStateUnifiedEngine.normalizeBuildingHeight({ levels: 2 });
    expect(result.heightMeters).toBeCloseTo(2 * LEVEL_HEIGHT_M);
    expect(result.method).toBe('levels_heuristic');
  });

  it('returns fallback for primary flag', () => {
    const result = TriStateUnifiedEngine.normalizeBuildingHeight({}, true);
    expect(result.heightMeters).toBeCloseTo(FALLBACK_BUILDING_HEIGHT_M);
  });

  it('returns fallback when no valid inputs provided', () => {
    const result = TriStateUnifiedEngine.normalizeBuildingHeight({ foo: 'bar' });
    expect(result.heightMeters).toBeCloseTo(FALLBACK_BUILDING_HEIGHT_M);
  });
});

describe('TriStateUnifiedEngine.evaluateJurisdictionalCompliance', () => {
  it('throws for non-finite stageFt', () => {
    // @ts-ignore - intentional
    expect(() => TriStateUnifiedEngine.evaluateJurisdictionalCompliance('INDIANA', NaN)).toThrow();
  });

  it('INDIANA: BFE exceedance is critical and non-compliant', () => {
    const stage = TriStateUnifiedEngine.SITE.bfeFt + 1.0;
    const res = TriStateUnifiedEngine.evaluateJurisdictionalCompliance('INDIANA', stage);
    expect(res.compliant).toBe(false);
    expect(res.status).toBe('CRITICAL_EXCEEDED');
    expect(res.notes.some(n => n.includes('exceeds Indiana BFE'))).toBe(true);
  });

  it('ILLINOIS: floodway delta > 0.1 sets non-compliant and notes added', () => {
    const res = TriStateUnifiedEngine.evaluateJurisdictionalCompliance('ILLINOIS', 370, 0.2);
    expect(res.compliant).toBe(false);
    expect(res.notes.some(n => n.includes('Illinois'))).toBe(true);
  });

  it('KENTUCKY: floodway delta > 0 sets non-compliant', () => {
    const res = TriStateUnifiedEngine.evaluateJurisdictionalCompliance('KENTUCKY', 370, 0.01);
    expect(res.compliant).toBe(false);
    expect(res.notes.some(n => n.includes("Kentucky"))).toBe(true);
  });

  it('LAG exceedance sets CRITICAL and preserves floodway notes', () => {
    const stage = TriStateUnifiedEngine.SITE.lagFt + 0.5; // exceed LAG
    const res = TriStateUnifiedEngine.evaluateJurisdictionalCompliance('ILLINOIS', stage, 0.2);
    expect(res.compliant).toBe(false);
    expect(res.status).toBe('CRITICAL_EXCEEDED');
    expect(res.notes.some(n => n.includes('LAG'))).toBe(true);
    expect(res.notes.some(n => n.includes('Illinois'))).toBe(true);
  });
});
