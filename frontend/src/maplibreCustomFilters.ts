/** PTDT v33 — MapLibre expression filters + depth tint */
export const depthColorExpression = [
  "interpolate", ["linear"], ["get", "depth_m"],
  0, "#38bdf8",
  1, "#0ea5e9",
  2, "#1e40af",
  3, "#1e3a8a"
];

export const particleDensity = [
  "interpolate", ["linear"], ["get", "depth_m"],
  0, 0.2,
  1, 0.5,
  2, 1.0,
  3, 1.5
];

export const wetRoadOpacity = [
  "interpolate", ["linear"], ["get", "depth_m"],
  0, 0.1,
  0.5, 0.4,
  1.0, 0.7
];

export function createFloodTintLayer(currentFloodDepth: number) {
  return {
    id: "flood-tint",
    type: "custom" as const,
    renderingMode: "2d" as const,
    onAdd(map: any, gl: WebGL2RenderingContext) {
      (this as any).gl = gl;
      (this as any).program = createTintProgram(gl);
    },
    render(gl: WebGL2RenderingContext, matrix: Float32Array) {
      const prog = (this as any).program;
      if (!prog) return;
      gl.useProgram(prog);
      gl.uniform1f(prog.depthUniform, currentFloodDepth);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };
}

function createTintProgram(gl: WebGL2RenderingContext) {
  // minimal stub — full shaders live in shaders/
  return { depthUniform: 0 };
}
