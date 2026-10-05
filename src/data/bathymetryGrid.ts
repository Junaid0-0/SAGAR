/**
 * Bathymetry Grid Data Layer for SAGAR
 * 
 * Structured elevation/depth grid representation decoupled from rendering.
 * Architecture allows seamless replacement of simulated bathymetry with 
 * real GEBCO or MBES (Multi-Beam Echo Sounder) GeoTIFF/NetCDF datasets.
 */

export interface BathymetryGridData {
  cols: number; // Grid horizontal resolution (X)
  rows: number; // Grid vertical resolution (Y)
  minDepth: number; // Minimum depth in meters (e.g., -4200 m)
  maxDepth: number; // Maximum depth in meters (e.g., -4410 m)
  xBounds: [number, number]; // Survey coordinate range X [0, 960]
  yBounds: [number, number]; // Survey coordinate range Y [0, 550]
  /**
   * 2D elevation grid where depthGrid[row][col] represents depth in meters (negative values).
   * Format: depthGrid[yIndex][xIndex] = depth (meters)
   */
  depthGrid: number[][];
  metadata: {
    source: 'SIMULATED DATA';
    description: 'Synthetic regional bathymetry based on CIOB-04 tectonic framework & isobath interpolation';
    resolutionMeters: number; // Nominal grid cell size (e.g., 25m)
    verticalDatum: 'Mean Sea Level (MSL)';
    coordinateSystem: 'UTM Zone 43S / WGS-84';
  };
}

/**
 * Generate a scientifically plausible simulated deep-ocean seafloor terrain model
 * representing the survey area (4,200m to 4,410m depths).
 * Features:
 * - Distinct northern ridge crest (-4,200m) with gentle undulating peaks
 * - Structural terrace and fault-controlled south-facing slopes
 * - Pronounced localized tectonic depression at Target A-03 (-4,291m to -4,315m crater/trough)
 * - Deep southern abyssal basin (-4,380m to -4,410m)
 * - Subtle pelagic sediment micro-relief
 */
export function generateSimulatedBathymetry(cols: number = 88, rows: number = 66): BathymetryGridData {
  const depthGrid: number[][] = [];
  const minDepth = -4200;
  const maxDepth = -4410;

  for (let r = 0; r < rows; r++) {
    const rowValues: number[] = [];
    const vNorm = r / (rows - 1); // 0 at top (North), 1 at bottom (South)

    for (let c = 0; c < cols; c++) {
      const uNorm = c / (cols - 1); // 0 at left (West), 1 at right (East)

      // 1. Regional gradient: shallow northern ridge (~-4,200m) sloping to southern basin (~-4,385m)
      const baseDepth = minDepth - Math.pow(vNorm, 1.15) * 185;

      // 2. Distinct Northern Ridge Crest (prominent elevated crest structure in the northern 25%)
      const ridgeProfile = Math.exp(-Math.pow((vNorm - 0.12) / 0.14, 2));
      const ridgeElevation = (14 + Math.sin(uNorm * Math.PI * 2.2 + 0.4) * 12) * ridgeProfile;

      // 3. East-West structural undulating morphology
      const structWave1 = Math.sin(uNorm * Math.PI * 1.8 + 0.2) * 16 * (1 - vNorm * 0.4);
      const structWave2 = Math.cos(uNorm * Math.PI * 3.2) * 8 * (1 - vNorm * 0.6);

      // 4. Fault Scarp Terrace Step around mid-slope (v ~ 0.48 - 0.58)
      const scarpStep = Math.tanh((vNorm - 0.52) * 7.5) * 18;

      // 5. Pronounced Localized Tectonic Depression at A-03
      // A-03 coordinates: x=300 (u = 300/960 = 0.3125), y=285 (v = 285/550 = 0.518)
      const dxA03 = (uNorm - 0.3125) * 1.5;
      const dyA03 = (vNorm - 0.518) * 1.1;
      const distA03Sq = dxA03 * dxA03 + dyA03 * dyA03;
      // Well-defined crater bowl with rim and trough
      const a03Depression = -42 * Math.exp(-distA03Sq / 0.016);
      const a03Rim = 7 * Math.exp(-Math.pow(Math.sqrt(distA03Sq) - 0.18, 2) / 0.005);

      // 6. Secondary structural depressions around other detected targets
      // A-01: u=0.203, v=0.400
      const dA01Sq = Math.pow((uNorm - 0.203) * 1.5, 2) + Math.pow(vNorm - 0.400, 2);
      const a01Dep = -14 * Math.exp(-dA01Sq / 0.010);

      // A-02: u=0.276, v=0.582
      const dA02Sq = Math.pow((uNorm - 0.276) * 1.5, 2) + Math.pow(vNorm - 0.582, 2);
      const a02Dep = -18 * Math.exp(-dA02Sq / 0.010);

      // A-07: u=545/960=0.568, v=390/550=0.709
      const dA07Sq = Math.pow((uNorm - 0.568) * 1.5, 2) + Math.pow(vNorm - 0.709, 2);
      const a07Dep = -15 * Math.exp(-dA07Sq / 0.012);

      // 7. Subtle pelagic sediment micro-relief
      const microRelief =
        Math.sin(uNorm * 22 + vNorm * 10) * 3.2 +
        Math.cos(uNorm * 14 - vNorm * 16) * 2.5;

      let depth =
        baseDepth +
        ridgeElevation +
        structWave1 +
        structWave2 +
        scarpStep +
        a03Depression +
        a03Rim +
        a01Dep +
        a02Dep +
        a07Dep +
        microRelief;

      // Clamp within realistic ocean floor range
      depth = Math.max(maxDepth, Math.min(minDepth, depth));

      rowValues.push(Number(depth.toFixed(1)));
    }
    depthGrid.push(rowValues);
  }

  return {
    cols,
    rows,
    minDepth,
    maxDepth,
    xBounds: [0, 960],
    yBounds: [0, 550],
    depthGrid,
    metadata: {
      source: 'SIMULATED DATA',
      description: 'Synthetic regional bathymetry based on CIOB-04 tectonic framework & isobath interpolation',
      resolutionMeters: 25,
      verticalDatum: 'Mean Sea Level (MSL)',
      coordinateSystem: 'UTM Zone 43S / WGS-84',
    },
  };
}

/**
 * Singleton instance of simulated survey bathymetry
 */
export const SURVEY_BATHYMETRY = generateSimulatedBathymetry(88, 66);

/**
 * Bilinear interpolation helper to query depth at arbitrary survey coordinates (x, y)
 */
export function getBathymetryDepthAt(
  x: number,
  y: number,
  dataset: BathymetryGridData = SURVEY_BATHYMETRY
): number {
  const [minX, maxX] = dataset.xBounds;
  const [minY, maxY] = dataset.yBounds;

  const u = Math.max(0, Math.min(1, (x - minX) / (maxX - minX)));
  const v = Math.max(0, Math.min(1, (y - minY) / (maxY - minY)));

  const colFloat = u * (dataset.cols - 1);
  const rowFloat = v * (dataset.rows - 1);

  const c0 = Math.floor(colFloat);
  const c1 = Math.min(dataset.cols - 1, c0 + 1);
  const r0 = Math.floor(rowFloat);
  const r1 = Math.min(dataset.rows - 1, r0 + 1);

  const du = colFloat - c0;
  const dv = rowFloat - r0;

  const d00 = dataset.depthGrid[r0][c0];
  const d10 = dataset.depthGrid[r0][c1];
  const d01 = dataset.depthGrid[r1][c0];
  const d11 = dataset.depthGrid[r1][c1];

  const interpolated =
    (1 - du) * (1 - dv) * d00 +
    du * (1 - dv) * d10 +
    (1 - du) * dv * d01 +
    du * dv * d11;

  return Number(interpolated.toFixed(1));
}
