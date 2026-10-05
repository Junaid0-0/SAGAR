/**
 * SAGAR (Seafloor Analysis and Geospatial Assessment for Resource Exploration)
 * Server-side Gemini AI Interpretation Service
 *
 * This module runs strictly in Node.js on the server side.
 * GEMINI_API_KEY is never exposed to the client bundle.
 */

export interface TargetSensorPayload {
  targetId: string;
  code: string;
  depth: number;
  temperature?: number;
  pressure?: number;
  metalResponse: number;
  baselineResponse: number;
  threshold: number;
  responseDeviation: number;
  detectionDuration: string;
  surveyLine: string;
  coordinates: {
    lat: string;
    lng: string;
    x: number;
    y: number;
  };
  rm3100?: {
    bx: number;
    by: number;
    bz: number;
    totalField: number;
    baselineField: number;
    deviation: number;
    threshold: number;
  };
  nearbyTargetsCount?: number;
}

export interface TargetAiResult {
  targetId: string;
  code: string;
  classification: 'METAL_RESPONSE' | 'MAGNETIC_ANOMALY' | 'UNCLASSIFIED_ANOMALY' | 'BACKGROUND' | 'INSUFFICIENT_DATA';
  confidence: number;
  magnetic_behavior: string;
  mineral_potential: number; // 0 - 100
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
  explanation: string;
  source: 'gemini-live' | 'local-deterministic';
  modelUsed?: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatMissionContext {
  telemetry: {
    depth: number;
    pressure: number;
    temperature: number;
    roll: number;
    pitch: number;
    yaw: number;
    metalResponse: number;
    baselineResponse: number;
    threshold: number;
    surveyDistance: number;
    areaSurveyed: number;
    currentLine: string;
    completedLines: number;
    totalLines: number;
    sensorLatitude: string;
    sensorLongitude: string;
    status: string;
  };
  targets: Array<{
    id: string;
    code: string;
    classification: string;
    depth: number;
    signalStrength: number;
    coordinates: { lat: string; lng: string };
    surveyLine: string;
    detectionDuration: string;
    status: string;
  }>;
  rm3100: {
    bx: number;
    by: number;
    bz: number;
    totalField: number;
    baselineField: number;
    deviation: number;
    threshold: number;
  };
}

export interface ChatResponsePayload {
  answer: string;
  source: 'gemini-live' | 'local-deterministic';
  modelUsed?: string;
}

export interface ZoneClusterPayload {
  zoneId: string;
  name: string;
  targetCodes: string[];
  centroid: {
    lat: string;
    lng: string;
    x: number;
    y: number;
  };
  radius: number;
  avgMetalResponse: number;
  maxMetalResponse: number;
  avgMagneticDeviation: number;
  dominantClassification: string;
  supportingTargetCount: number;
  calculatedScore: number; // 0 - 5 deterministic score
}

export interface ZoneAiResult {
  zoneId: string;
  potentialScore: number; // 0 - 5
  scoreLabel: 'Very Low' | 'Low' | 'Weak' | 'Moderate' | 'High' | 'Very High';
  reason: string;
  recommendedAction: string;
}

export interface ZonesAnalysisResponse {
  zones: ZoneAiResult[];
  missionRecommendations: string[];
  source: 'gemini-live' | 'local-deterministic';
  modelUsed?: string;
  timestamp: string;
}

// System prompt enforcing defensible scientific subsea instrumentation behavior
const SYSTEM_PROMPT = `You are the scientific AI interpretation layer for SAGAR (Seafloor Analysis and Geospatial Assessment for Resource Exploration), a deployable tethered deep-seafloor sensor pod used in ocean resource exploration.
The pod is equipped with:
- Inductive metal detection sensor (measures electromagnetic induction in mV/V relative to baseline 0.31 mV/V and detection threshold 0.65 mV/V)
- RM3100 3-axis magnetometer (measures geomagnetic flux vector Bx, By, Bz in microteslas uT)
- Hydrostatic pressure and deep-sea water temperature sensors
- Tether umbilical positioning and acoustic USBL tracking

SCIENTIFIC CONSTRAINTS & BEHAVIOR:
1. You are strictly an INTERPRETATION LAYER. The physical sensors detect the signals.
2. DO NOT make unscientific elemental claims such as "Gold detected", "Cobalt crust confirmed", or "High grade copper deposit". The electromagnetic and magnetic sensors measure conductivity and magnetic permeability, NOT chemical composition.
3. Classify detections into exactly one of:
   - "METAL_RESPONSE": Confirmed inductive sensor response significantly exceeding baseline and threshold.
   - "MAGNETIC_ANOMALY": Significant magnetic field deviation detected by the RM3100 magnetometer without elevated induction.
   - "UNCLASSIFIED_ANOMALY": Transient or ambiguous sensor deviation near threshold that cannot be reliably categorized.
   - "BACKGROUND": Sensor signals consistent with ambient deep-seafloor sediment baseline noise.
   - "INSUFFICIENT_DATA": Sensor readings too brief or incomplete.
4. Output MUST be strictly valid JSON matching the requested schema. No conversational preamble or markdown code blocks if possible.`;

/**
 * Deterministic fallback analysis when Gemini API key is missing or unavailable
 */
export function analyzeTargetDeterministic(payload: TargetSensorPayload): TargetAiResult {
  const metalExcess = payload.metalResponse - payload.threshold;
  const magDeviation = payload.rm3100?.deviation ?? Math.abs(payload.metalResponse - payload.baselineResponse) * 2;
  const isHighMetal = payload.metalResponse >= payload.threshold;
  const isElevatedMetal = payload.metalResponse >= 0.50;
  const isHighMag = magDeviation >= 1.2;

  let classification: TargetAiResult['classification'] = 'UNCLASSIFIED_ANOMALY';
  let confidence = 0.72;
  let priority: TargetAiResult['priority'] = 'LOW';
  let potential = 40;
  let behavior = 'Nominal ambient magnetic field gradient consistent with regional background.';
  let recommendation = 'Maintain standard survey transect spacing; log for regional baseline.';
  let explanation = 'Sensor response is slightly above baseline but does not exceed primary detection threshold.';

  if (isHighMetal && isHighMag) {
    classification = 'METAL_RESPONSE';
    confidence = Math.min(0.96, 0.85 + metalExcess * 0.4);
    priority = 'HIGH';
    potential = Math.min(95, Math.round(75 + metalExcess * 80));
    behavior = `High localized magnetic flux deviation (${magDeviation.toFixed(2)} µT) correlated with peak inductive response.`;
    recommendation = 'PRIORITY RE-SURVEY: Execute high-density cross-line transects at 10m spacing over target coordinates.';
    explanation = `Strong inductive response (${payload.metalResponse.toFixed(2)} mV/V vs ${payload.threshold.toFixed(2)} mV/V threshold) strongly coupled with a localized magnetic field anomaly indicates a concentrated conductive metallic body.`;
  } else if (isHighMetal) {
    classification = 'METAL_RESPONSE';
    confidence = Math.min(0.92, 0.82 + metalExcess * 0.3);
    priority = 'HIGH';
    potential = Math.min(90, Math.round(70 + metalExcess * 70));
    behavior = `Moderate magnetic field gradient (${magDeviation.toFixed(2)} µT) without dominant dipolar signature.`;
    recommendation = 'Close-range optical and sensor inspection recommended during phase 2 tethered deployment.';
    explanation = `Inductive metal sensor response (${payload.metalResponse.toFixed(2)} mV/V) significantly exceeds threshold across survey line ${payload.surveyLine}, confirming an electromagnetic anomaly.`;
  } else if (isHighMag) {
    classification = 'MAGNETIC_ANOMALY';
    confidence = 0.84;
    priority = 'MEDIUM';
    potential = 62;
    behavior = `Pronounced RM3100 tri-axial magnetic field deviation (${magDeviation.toFixed(2)} µT) with anomalous vector distortion.`;
    recommendation = 'Re-survey target with orthogonal transects to determine magnetic dip and gradient polarity.';
    explanation = `Significant magnetic field distortion recorded by RM3100 magnetometer without strong inductive coupling; consistent with magnetic rock or sub-surface structure.`;
  } else if (isElevatedMetal) {
    classification = 'UNCLASSIFIED_ANOMALY';
    confidence = 0.76;
    priority = 'MEDIUM';
    potential = 48;
    behavior = `Subtle magnetic gradient variation within normal regional limits.`;
    recommendation = 'Flag target for secondary review during bathymetric coverage consolidation.';
    explanation = `Sensor response (${payload.metalResponse.toFixed(2)} mV/V) is elevated above baseline (${payload.baselineResponse.toFixed(2)} mV/V) but remains below formal confirmation threshold.`;
  } else {
    classification = 'BACKGROUND';
    confidence = 0.88;
    priority = 'LOW';
    potential = 18;
    behavior = 'Undisturbed geomagnetic field profile.';
    recommendation = 'No immediate action required. Sensor reading logged as background seafloor baseline.';
    explanation = 'Signal response is within nominal deep-sea sediment baseline variation.';
  }

  return {
    targetId: payload.targetId,
    code: payload.code,
    classification,
    confidence: parseFloat(confidence.toFixed(2)),
    magnetic_behavior: behavior,
    mineral_potential: potential,
    priority,
    recommendation,
    explanation,
    source: 'local-deterministic',
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Deterministic fallback for spatial zone analysis
 */
export function analyzeZonesDeterministic(clusters: ZoneClusterPayload[]): ZonesAnalysisResponse {
  const scoreLabels: Record<number, ZoneAiResult['scoreLabel']> = {
    0: 'Very Low',
    1: 'Low',
    2: 'Weak',
    3: 'Moderate',
    4: 'High',
    5: 'Very High',
  };

  const zones: ZoneAiResult[] = clusters.map((c) => {
    const score = Math.max(0, Math.min(5, Math.round(c.calculatedScore)));
    let reason = '';
    let action = '';

    if (score >= 4) {
      reason = `Dense spatial cluster of ${c.supportingTargetCount} targets (${c.targetCodes.join(', ')}) showing high inductive responses (max ${c.maxMetalResponse.toFixed(2)} mV/V) and correlated magnetic anomalies.`;
      action = `Establish primary high-resolution survey polygon around centroid (${c.centroid.lat}, ${c.centroid.lng}) with 10m line spacing.`;
    } else if (score === 3) {
      reason = `Moderate potential zone centered on ${c.targetCodes.join(', ')} with elevated metal sensor signatures requiring tighter transect density.`;
      action = `Conduct cross-transect verification and maintain pod altitude at 2.5m for enhanced inductive resolution.`;
    } else if (score === 2) {
      reason = `Weak spatial signal cluster (${c.targetCodes.join(', ')}); anomalies are near threshold and lack strong magnetic field coupling.`;
      action = `Log coordinates for regional exploration database; prioritize higher-scoring zones first.`;
    } else {
      reason = `Low confidence or isolated transient reading (${c.targetCodes.join(', ')}); values are consistent with ambient seafloor background.`;
      action = `No re-survey required at this time.`;
    }

    return {
      zoneId: c.zoneId,
      potentialScore: score,
      scoreLabel: scoreLabels[score] || 'Moderate',
      reason,
      recommendedAction: action,
    };
  });

  const missionRecs = [
    'Prioritize high-potential clusters (Score 4–5) for detailed low-altitude tethered re-survey.',
    'Reduce transect spacing from 50m to 10m over the central-western cluster to delineate anomaly continuity.',
    'Cross-reference RM3100 magnetic deviations with inductive peaks to filter false positives caused by geological terrain.',
    'Maintain continuous 120V tether umbilical telemetry logging during all stationary hovers.'
  ];

  return {
    zones,
    missionRecommendations: missionRecs,
    source: 'local-deterministic',
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Call Gemini API on server side for target analysis
 */
export async function analyzeTargetWithGemini(
  payload: TargetSensorPayload,
  apiKey: string,
  modelName: string = 'gemini-flash-latest'
): Promise<TargetAiResult> {
  const prompt = `Analyze this seafloor sensor pod target detection:
Target Code: ${payload.code} (${payload.targetId})
Coordinates: ${payload.coordinates.lat}, ${payload.coordinates.lng} (SVG X:${payload.coordinates.x}, Y:${payload.coordinates.y})
Depth: ${payload.depth} m
Survey Transect Line: ${payload.surveyLine}
Detection Duration: ${payload.detectionDuration}
Metal Sensor Response: ${payload.metalResponse.toFixed(3)} mV/V
Metal Sensor Baseline: ${payload.baselineResponse.toFixed(3)} mV/V
Detection Threshold: ${payload.threshold.toFixed(3)} mV/V
Signal Response Margin Above Baseline: ${(payload.metalResponse - payload.baselineResponse).toFixed(3)} mV/V
RM3100 Magnetometer:
  Bx: ${payload.rm3100?.bx.toFixed(1) ?? 'N/A'} µT, By: ${payload.rm3100?.by.toFixed(1) ?? 'N/A'} µT, Bz: ${payload.rm3100?.bz.toFixed(1) ?? 'N/A'} µT
  Total Field: ${payload.rm3100?.totalField.toFixed(1) ?? 'N/A'} µT
  Magnetic Deviation: ${payload.rm3100?.deviation.toFixed(2) ?? 'N/A'} µT (Threshold: ${payload.rm3100?.threshold.toFixed(2) ?? 'N/A'} µT)
Surrounding Target Context: ${payload.nearbyTargetsCount ?? 1} target(s) detected in adjacent survey segments.

Provide your scientific interpretation in strict JSON format with the following fields:
{
  "classification": "METAL_RESPONSE" | "MAGNETIC_ANOMALY" | "UNCLASSIFIED_ANOMALY" | "BACKGROUND" | "INSUFFICIENT_DATA",
  "confidence": number between 0.0 and 1.0,
  "magnetic_behavior": "concise description of magnetic vector variation",
  "mineral_potential": integer score between 0 and 100,
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "recommendation": "specific actionable survey instruction",
  "explanation": "scientific explanation of the combined sensor response without claiming specific metals or elements"
}`;

  let activeModel = modelName;
  let url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  // If model is busy (503) or not found (404), fallback to gemini-3.5-flash-lite
  if ((response.status === 404 || response.status === 503) && activeModel !== 'gemini-3.5-flash-lite') {
    activeModel = 'gemini-3.5-flash-lite';
    url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned an empty response.');
  }

  const parsed = JSON.parse(rawText);

  return {
    targetId: payload.targetId,
    code: payload.code,
    classification: parsed.classification || 'UNCLASSIFIED_ANOMALY',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
    magnetic_behavior: parsed.magnetic_behavior || 'Nominal magnetic behavior observed.',
    mineral_potential: typeof parsed.mineral_potential === 'number' ? parsed.mineral_potential : 70,
    priority: parsed.priority || 'MEDIUM',
    recommendation: parsed.recommendation || 'Continue routine survey operations.',
    explanation: parsed.explanation || 'Interpretation based on multi-sensor inductive and magnetic parameters.',
    source: 'gemini-live',
    modelUsed: modelName,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Call Gemini API on server side for spatial zone analysis
 */
export async function analyzeZonesWithGemini(
  clusters: ZoneClusterPayload[],
  apiKey: string,
  modelName: string = 'gemini-flash-latest'
): Promise<ZonesAnalysisResponse> {
  const prompt = `Interpret these spatial anomaly clusters/potential zones identified from the seafloor survey:
${JSON.stringify(clusters, null, 2)}

Provide your interpretation in strict JSON format:
{
  "zones": [
    {
      "zoneId": string,
      "potentialScore": integer between 0 and 5,
      "scoreLabel": "Very Low" | "Low" | "Weak" | "Moderate" | "High" | "Very High",
      "reason": "concise scientific justification based on spatial density and sensor strengths",
      "recommendedAction": "specific maritime exploration guidance"
    }
  ],
  "missionRecommendations": [
    "actionable exploration recommendation 1",
    "actionable exploration recommendation 2",
    "actionable exploration recommendation 3"
  ]
}`;

  let activeModel = modelName;
  let url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if ((response.status === 404 || response.status === 503) && activeModel !== 'gemini-3.5-flash-lite') {
    activeModel = 'gemini-3.5-flash-lite';
    url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned empty response for zones.');
  }

  const parsed = JSON.parse(rawText);

  return {
    zones: parsed.zones || [],
    missionRecommendations: parsed.missionRecommendations || [],
    source: 'gemini-live',
    modelUsed: modelName,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Intelligent deterministic conversational assistant when Gemini API key is unset
 */
export function chatDeterministic(
  messages: ChatMessage[],
  context: ChatMissionContext
): ChatResponsePayload {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content.trim() || '';
  const lower = lastUserMsg.toLowerCase();

  // Find previous context if this is a follow-up
  const previousUserMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
  const contextStr = previousUserMessages.join(' ');

  let answer = '';

  // 1. Target prioritization
  if (lower.includes('investigate first') || lower.includes('prioritize') || lower.includes('strongest') || lower.includes('highest priority') || lower.includes('which target')) {
    answer = `Based on the active seafloor survey data, **Target A-03** is the highest priority candidate for immediate investigation.

### Target Prioritization Ranking:
1. **Target A-03 (Transect L-07)**:
   - **Peak Metal Response**: **0.78 mV/V** (Exceeds threshold 0.65 mV/V by +0.13 mV/V, and +0.47 mV/V above baseline).
   - **Persistence**: Sustained signal peak over **01:42**.
   - **RM3100 Correlation**: Pronounced localized magnetic deviation (**1.90 µT**).
   - **Depth**: 4,291 m.
   - **Classification**: **METAL DETECTED**.

2. **Target A-05 (Transect L-14)**:
   - **Peak Metal Response**: **0.68 mV/V** (Exceeds threshold by +0.03 mV/V).
   - **Classification**: **METAL DETECTED** (isolated eastern transect anomaly).

3. **Target A-02 (Transect L-06)**:
   - **Peak Metal Response**: **0.62 mV/V** (High response, adjacent to A-03 forming the **Zone Alpha** prospect corridor).

4. **Target A-01 (Transect L-04)**:
   - **Classification**: **MAGNETIC ANOMALY** (RM3100 deviation **2.40 µT**, inductive signal 0.51 mV/V).

5. **Target A-04 (Transect L-09)**:
   - **Classification**: **UNCLASSIFIED ANOMALY** (0.44 mV/V, below 0.65 threshold). Low priority background noise.

**Recommended Action**: Maintain station-keeping over **A-03** for close-range optical illumination and execute 10m infill cross-lines between L-06 and L-07.`;
  }
  // 2. Explaining A-03
  else if (lower.includes('a-03') || lower.includes('a03') || (lower.includes('why') && (contextStr.includes('a-03') || contextStr.includes('strongest')))) {
    answer = `**Target A-03** (located at **12°42.18'S, 74°31.82'E**, depth **4,291 m**) is considered the primary exploration anomaly of this expedition for three key physical reasons:

1. **Extreme Inductive Response**:
   The primary electromagnetic induction coil registered **0.78 mV/V**. The operational baseline is **0.31 mV/V** and the trigger threshold is **0.65 mV/V**. This represents a sharp +151% signal rise.

2. **Spatial Correlation with RM3100**:
   The 3-axis RM3100 magnetometer registered a localized magnetic vector deviation of **1.90 µT** (total field flux 44.8 µT vs 42.5 µT background), indicating that the conductive body also possesses anomalous magnetic permeability.

3. **Cluster Envelope (Zone Alpha)**:
   A-03 is situated within 50m of Target A-02 (0.62 mV/V) and Target A-01 (magnetic anomaly), forming a continuous spatial anomaly zone across transects L-04, L-06, and L-07.

*Note: The sensors measure inductive eddy currents and magnetic flux. This confirms a concentrated conductive metallic body, but physical grab sampling is required to determine exact mineral chemistry.*`;
  }
  // 3. Comparing targets (A-03 and A-05)
  else if ((lower.includes('compare') && lower.includes('a-05')) || (lower.includes('a-03') && lower.includes('a-05')) || (lower.includes('difference') && (lower.includes('a-03') || lower.includes('a-05')))) {
    answer = `Here is a side-by-side sensor comparison between **Target A-03** and **Target A-05**:

| Parameter | Target A-03 | Target A-05 | Operational Significance |
| :--- | :--- | :--- | :--- |
| **Transect Line** | **L-07** (Central) | **L-14** (East) | Separated by ~245m lateral distance |
| **Depth** | **4,291 m** | **4,295 m** | Similar bathymetric contour terrace |
| **Peak Inductive Response** | **0.78 mV/V** | **0.68 mV/V** | A-03 is **14.7% stronger** |
| **Signal Duration** | **01:42** | **01:25** | A-03 exhibits greater spatial persistence |
| **RM3100 Mag Deviation** | **1.90 µT** | **0.85 µT** | A-03 has stronger magnetic coupling |
| **Spatial Context** | **Zone Alpha Cluster** | **Isolated Anomaly** | A-03 has adjacent supporting targets |
| **Classification** | **METAL DETECTED** | **METAL DETECTED** | Both exceed 0.65 mV/V threshold |

### Strategic Summary:
- **A-03** is part of an aggregated, high-confidence cluster (Zone Alpha) that justifies a dedicated multi-pass grid survey.
- **A-05** is a valid confirmed metal response on L-14, but represents an isolated hit requiring adjacent infill transects (L-13, L-15) to confirm its lateral boundary.`;
  }
  // 4. Survey line L-07
  else if (lower.includes('line l-07') || lower.includes('transect l-07') || lower.includes('l-07') || lower.includes('l07')) {
    answer = `**Survey Line L-07** is the most significant operational transect in the current survey grid.

### Key Events on Line L-07:
- **Target A-03 Logged**: At coordinates **12°42.18'S, 74°31.82'E** (depth **4,291 m**), the pod crossed a localized electromagnetic peak reaching **0.78 mV/V**.
- **RM3100 Response**: The Z-axis magnetic flux vector shifted by +3.2 µT, producing an aggregate vector deviation of **1.90 µT**.
- **Pod Altitude**: Maintained between 2.2 m and 2.8 m above the seabed during the pass.
- **Tether Voltage**: Steady at **120 VDC** with zero telemetry dropped frames.

**Operational Recommendation**: Establish secondary cross-line transects perpendicular to L-07 at 10m spacing to delineate anomaly strike orientation.`;
  }
  // 5. Magnetic anomalies & RM3100
  else if (lower.includes('magnetic') || lower.includes('rm3100') || lower.includes('magnetometer') || lower.includes('field')) {
    answer = `### RM3100 Tri-Axial Magnetometer Status & Observations:

The RM3100 magnetometer operates as a complementary sensor to the inductive coil, measuring geomagnetic flux components ($B_x, B_y, B_z$) in microteslas (µT).

- **Current Geomagnetic Vector**:
  - $B_x$: **18.4 µT**
  - $B_y$: **-12.1 µT**
  - $B_z$: **39.8 µT**
  - **Total Magnetic Field**: **44.8 µT** (Regional baseline: **42.5 µT**)
  - **Active Deviation**: **1.90 µT** (Deviation threshold: **1.20 µT**)

### Key Magnetic Findings:
1. **Target A-01 (Transect L-04)**: Classified specifically as a **MAGNETIC ANOMALY** with **2.40 µT deviation** but moderate metal response (0.51 mV/V). This indicates magnetic rock or sub-surface geological structure.
2. **Target A-03 (Transect L-07)**: Shows co-located magnetic deviation (**1.90 µT**) and strong inductive response (**0.78 mV/V**), consistent with a conductive ferromagnetic source.
3. **Target A-04**: Shows zero significant magnetic distortion, supporting its classification as unclassified/background noise.`;
  }
  // 6. Why A-04 is background / unclassified
  else if (lower.includes('a-04') || lower.includes('a04') || (lower.includes('background') && lower.includes('why'))) {
    answer = `**Target A-04** (Transect L-09, depth **4,302 m**) was classified as an **UNCLASSIFIED ANOMALY** rather than a confirmed detection for the following scientific reasons:

1. **Below Confirmation Threshold**:
   The peak signal was **0.44 mV/V**. While this is slightly above ambient sediment baseline (**0.31 mV/V**), it fails to reach the **0.65 mV/V** detection threshold required for confirmation.

2. **Brief Duration**:
   The response persisted for only **00:38** (covering less than 15 meters of seafloor track), indicating a transient surface fluctuation or sensor drift rather than an extensive seabed body.

3. **Absence of Magnetic Coupling**:
   The RM3100 registered only **0.45 µT** deviation, well within nominal deep-ocean geomagnetism.

**Recommendation**: Screen A-04 as localized background variance. Do not alter vessel track or divert tethered pod resources.`;
  }
  // 7. Resource potential & zones
  else if (lower.includes('resource potential') || lower.includes('zone') || lower.includes('cluster') || lower.includes('highest potential')) {
    answer = `### Seafloor Resource Potential Zones:

Based on spatial density and multi-sensor correlation, the survey area is partitioned into three distinct prospect zones:

1. **Zone Alpha — Central-West Cluster (SCORE: 5/5 [VERY HIGH])**:
   - **Centroid**: **12°42.10'S, 74°31.70'E** (Encompasses Targets A-01, A-02, and A-03).
   - **Evidence**: Peak inductive response of **0.78 mV/V**, combined with co-located magnetic anomalies across 3 adjacent survey transects.
   - **Assessment**: Represents the primary exploration target corridor.

2. **Zone Gamma — Eastern Corridor (SCORE: 4/5 [HIGH])**:
   - **Centroid**: **12°42.61'S, 74°32.28'E** (Target A-05).
   - **Evidence**: Isolated peak of **0.68 mV/V** on transect L-14.
   - **Assessment**: Strong candidate requiring infill lines to establish boundaries.

3. **Zone Beta — Southern Boundary (SCORE: 2/5 [WEAK])**:
   - **Centroid**: **12°42.35'S, 74°31.95'E** (Target A-04).
   - **Evidence**: Weak sub-threshold signature (0.44 mV/V).
   - **Assessment**: Background sediment variation.`;
  }
  // 8. Next steps / operational recommendations
  else if (lower.includes('next') || lower.includes('what should we do') || lower.includes('recommendation') || lower.includes('action')) {
    answer = `### Recommended Operational Next Steps:

1. **Execute Infill Transects over Zone Alpha (Critical)**:
   Reduce survey line spacing from 50m to **10m** between transects L-04 and L-07. This will delineate the continuity and spatial geometry of the A-02/A-03 anomaly.

2. **Station-Keeping Hover at Target A-03 (High Priority)**:
   Command winch hold to hover the pod at **2.5m altitude** over coordinates **12°42.18'S, 74°31.82'E** for high-resolution optical inspection and stationary time-series logging.

3. **Orthogonal Cross-Line at Target A-01**:
   Run an East-West transect across L-04 to determine the dip angle and magnetic vector orientation of the 2.40 µT anomaly.

4. **Maintain Continuous 120V Umbilical Telemetry**:
   Pod power and data link are nominal. Continue real-time inductive and RM3100 logging.`;
  }
  // 9. Chemical identification / gold / cobalt queries
  else if (lower.includes('gold') || lower.includes('copper') || lower.includes('cobalt') || lower.includes('nickel') || lower.includes('what metal') || lower.includes('what mineral') || lower.includes('exact mineral')) {
    answer = `**Scientific Clarification on Mineral Identification:**

SAGAR's deployable sensor pod utilizes an **electromagnetic inductive sensor** and an **RM3100 fluxgate magnetometer**. 

- These sensors measure **electrical conductivity** (via eddy-current induction) and **magnetic permeability** (via geomagnetic vector flux).
- **They cannot determine elemental chemical composition** (e.g., whether the target is polymetallic nodules, massive sulphides, copper, gold, or ferrous seafloor basalt).

### What We Can Confirm:
1. Target **A-03 (0.78 mV/V)** and Target **A-05 (0.68 mV/V)** are confirmed **conductive metallic bodies** with ferromagnetic coupling.
2. Target **A-01** represents a **magnetic geological anomaly**.

**Next Phase Requirement**: Physical grab sampling, seafloor coring, or optical spectrometry is required to assay the exact mineral chemistry.`;
  }
  // 10. Default / general response
  else {
    answer = `SAGAR AI is monitoring the active seafloor mission in the Central Indian Ocean Basin.

### Current Mission Status:
- **Sensor Pod Depth**: **${context.telemetry.depth.toFixed(1)} m** (Hydrostatic Pressure: **${context.telemetry.pressure.toFixed(1)} MPa**)
- **Active Transect**: **${context.telemetry.currentLine}** (${context.telemetry.completedLines}/${context.telemetry.totalLines} lines completed)
- **Current Inductive Response**: **${context.telemetry.metalResponse.toFixed(2)} mV/V** (Baseline: 0.31 mV/V, Threshold: 0.65 mV/V)
- **RM3100 Magnetometer**: Total field **${context.rm3100.totalField.toFixed(1)} µT** (Deviation: **${context.rm3100.deviation.toFixed(2)} µT**)
- **Detected Targets**: **5 targets logged** (A-01 through A-05)

**You can ask me to:**
- Prioritize targets for investigation
- Compare specific detections (e.g., A-03 vs A-05)
- Analyze survey transects (e.g., Line L-07)
- Explain RM3100 magnetic anomaly readings
- Recommend operational next steps for the tethered pod`;
  }

  return {
    answer,
    source: 'local-deterministic',
  };
}

/**
 * Call Gemini API on server side for multi-turn chat conversation
 */
export async function chatWithGemini(
  messages: ChatMessage[],
  context: ChatMissionContext,
  apiKey: string,
  modelName: string = 'gemini-flash-latest'
): Promise<ChatResponsePayload> {
  const contextSummary = `CURRENT MISSION TELEMETRY & SURVEY CONTEXT:
- Deployment: Tethered Deep-Seafloor Sensor Pod from RV Samudra (120 VDC Umbilical link nominal)
- Operational Depth: ${context.telemetry.depth.toFixed(1)} m | Pressure: ${context.telemetry.pressure.toFixed(1)} MPa | Temp: ${context.telemetry.temperature.toFixed(1)}°C
- Active Survey Line: ${context.telemetry.currentLine} | Lines Completed: ${context.telemetry.completedLines}/${context.telemetry.totalLines}
- Current Pod Position: Lat ${context.telemetry.sensorLatitude}, Lng ${context.telemetry.sensorLongitude}
- Inductive Metal Sensor: Current response: ${context.telemetry.metalResponse.toFixed(3)} mV/V | Baseline: ${context.telemetry.baselineResponse.toFixed(3)} mV/V | Threshold: ${context.telemetry.threshold.toFixed(3)} mV/V
- RM3100 Magnetometer: Bx=${context.rm3100.bx.toFixed(1)}, By=${context.rm3100.by.toFixed(1)}, Bz=${context.rm3100.bz.toFixed(1)} µT | Total Field: ${context.rm3100.totalField.toFixed(1)} µT | Deviation: ${context.rm3100.deviation.toFixed(2)} µT (Threshold: ${context.rm3100.threshold.toFixed(2)} µT)
- Logged Targets (5 Total):
${context.targets.map(t => `  * ${t.id} (${t.code}): Classification=${t.classification}, Signal=${t.signalStrength} mV/V, Depth=${t.depth}m, Line=${t.surveyLine}, Coords=(${t.coordinates.lat}, ${t.coordinates.lng}), Duration=${t.detectionDuration}`).join('\n')}
- Spatial Resource Zones:
  * Zone Alpha: High cluster (A-01, A-02, A-03) on L-04, L-06, L-07. Potential Score 5/5 (Very High).
  * Zone Gamma: Isolated high metal detection A-05 on L-14. Potential Score 4/5 (High).
  * Zone Beta: Weak unclassified anomaly A-04 on L-09. Potential Score 2/5 (Weak).`;

  const systemInstructionText = `${SYSTEM_PROMPT}

You are SAGAR AI, the Mission Intelligence Assistant for the SAGAR (Seafloor Analysis and Geospatial Assessment for Resource Exploration) deep-seafloor tethered sensor pod.
Answer questions accurately, conversationally, and scientifically based on the mission context below.
Always adhere strictly to these rules:
1. NEVER claim chemical elemental identification (no "gold detected", "nickel deposit", "copper confirmed"). State that inductive coils detect electrical conductivity and the RM3100 detects magnetic permeability.
2. Use standard categories: "METAL DETECTED", "MAGNETIC ANOMALY", "UNCLASSIFIED ANOMALY", "BACKGROUND".
3. Use markdown with bold headers, bullet lists, and clear concise operational recommendations.
4. Maintain conversational context across multi-turn questions.

${contextSummary}`;

  const formattedContents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  let activeModel = modelName;
  let url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents: formattedContents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1200,
    },
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  // If specified model returned 404 or 503, fallback to gemini-3.5-flash-lite
  if ((response.status === 404 || response.status === 503) && activeModel !== 'gemini-3.5-flash-lite') {
    activeModel = 'gemini-3.5-flash-lite';
    url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned empty response for chat.');
  }

  return {
    answer: rawText,
    source: 'gemini-live',
    modelUsed: activeModel,
  };
}
