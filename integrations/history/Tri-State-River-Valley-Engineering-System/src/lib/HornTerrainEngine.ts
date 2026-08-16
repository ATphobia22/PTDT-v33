/**
 * HORN TERRAIN ENGINE
 * Implements Horn's Algorithm (1981) for slope and gradient calculus.
 */

export type ElevMatrix3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export interface HornSlopeResult {
  dzdx: number;
  dzdy: number;
  gradient: number;
  slopeDeg: number;
  aspect: number;
}

/**
 * Computes slope from a 3x3 elevation matrix.
 * Matrix layout:
 * [ [a, b, c],
 *   [d, e, f],
 *   [g, h, i] ]
 */
export function hornSlope(matrix: ElevMatrix3, dxM = 1.0, dyM = 1.0): HornSlopeResult {
  const [
    [a, b, c],
    [d, e, f],
    [g, h, i]
  ] = matrix;

  // Partial derivatives using weighted central differences
  const dzdx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * dxM);
  const dzdy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * dyM);

  const gradient = Math.sqrt(dzdx * dzdx + dzdy * dzdy);
  const slopeDeg = Math.atan(gradient) * (180 / Math.PI);

  // Aspect calculation (optional but standard in Horn's)
  // atan2(dz/dy, -dz/dx) gives radians from West (counter-clockwise)
  const aspect = Math.atan2(dzdy, -dzdx);

  return {
    dzdx,
    dzdy,
    gradient,
    slopeDeg,
    aspect
  };
}
