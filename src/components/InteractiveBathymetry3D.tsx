import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TargetAnomaly } from '../types';
import { SURVEY_BATHYMETRY, getBathymetryDepthAt } from '../data/bathymetryGrid';
import { SURVEY_LINES } from '../data/mockSurveyTrack';
import {
  Compass,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Target
} from 'lucide-react';

interface InteractiveBathymetry3DProps {
  targets: TargetAnomaly[];
  selectedTargetCode: string | null;
  onSelectTarget: (code: string) => void;
  showCoverage?: boolean;
  showSurveyLines?: boolean;
  showAnomalies?: boolean;
  showSignalHalos?: boolean;
}

// Helper to create high-contrast, always-visible billboard badge pills for targets
function createTargetLabelSprite(
  code: string,
  signal: number,
  isPriority: boolean,
  isHigh: boolean
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d')!;

  // Background rounded pill with crisp border
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = isPriority ? '#B85C5C' : isHigh ? '#B78332' : '#CBD9DA';
  ctx.lineWidth = isPriority ? 4 : 2.5;

  const x = 6;
  const y = 6;
  const w = 244;
  const h = 60;
  const r = 14;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Target Code (bold, crisp text)
  ctx.font = isPriority ? 'bold 26px monospace' : 'bold 23px monospace';
  ctx.fillStyle = isPriority ? '#B85C5C' : isHigh ? '#B78332' : '#1F4B60';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, 20, 36);

  // Signal Value
  ctx.font = '600 18px monospace';
  ctx.fillStyle = isPriority ? '#B85C5C' : isHigh ? '#B78332' : '#60868C';
  ctx.textAlign = 'right';
  ctx.fillText(`${signal}mV`, 236, 36);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  // depthTest: false ensures labels are never clipped or occluded by terrain/survey tracks
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.renderOrder = 999;
  return sprite;
}

export const InteractiveBathymetry3D: React.FC<InteractiveBathymetry3DProps> = ({
  targets,
  selectedTargetCode,
  onSelectTarget,
  showCoverage = true,
  showSurveyLines = true,
  showAnomalies = true,
  showSignalHalos = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const anomalyObjectsRef = useRef<{ [code: string]: THREE.Group }>({});
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [hoveredTarget, setHoveredTarget] = useState<TargetAnomaly | null>(null);
  const [cameraAzimuth, setCameraAzimuth] = useState<number>(0);
  const [isTopDown, setIsTopDown] = useState<boolean>(false);

  // Coordinate mapping:
  // Survey coordinates X [0, 960] -> [-48, 48]
  // Survey coordinates Y [0, 550] -> [-27.5, 27.5]
  // Vertical Exaggeration 8x: preserves ridges, slopes, and crater depression
  const toWorldX = (surveyX: number) => ((surveyX - 480) / 960) * 96;
  const toWorldZ = (surveyY: number) => ((surveyY - 275) / 550) * 55;
  const toWorldY = (depth: number) => {
    const norm = (depth - (-4410)) / ((-4200) - (-4410)); // 0 (deepest) to 1 (shallowest)
    return (norm - 0.5) * 18.5;
  };

  // Subtle depth color gradient across the terrain (restrained SAGAR palette):
  // - Shallower ridge (-4,200m): slightly lighter blue-gray / teal (#EAF4F6)
  // - Middle depth (-4,300m): muted teal (#8FBCC5)
  // - Deeper basin (-4,390m): slightly darker blue-gray / teal (#3B6774)
  const getDepthColor = (depth: number): THREE.Color => {
    // Calibrated across actual terrain depth span [-4390m, -4200m]
    const t = THREE.MathUtils.clamp((depth - (-4390)) / ((-4200) - (-4390)), 0, 1);

    const cDeeper = new THREE.Color(0x3b6774);       // -4390m: deeper basin / depression (darker blue-gray/teal)
    const cLowerSlope = new THREE.Color(0x60939f);   // -4350m: lower slope
    const cIntermediate = new THREE.Color(0x8fbcc5); // -4300m: middle depth (muted teal)
    const cUpperSlope = new THREE.Color(0xc1dfe5);   // -4250m: upper slope (soft light teal)
    const cShallower = new THREE.Color(0xeaf4f6);    // -4200m: shallower ridge (slightly lighter blue-gray/teal)

    const result = new THREE.Color();
    if (t < 0.25) {
      result.lerpColors(cDeeper, cLowerSlope, t / 0.25);
    } else if (t < 0.55) {
      result.lerpColors(cLowerSlope, cIntermediate, (t - 0.25) / 0.3);
    } else if (t < 0.8) {
      result.lerpColors(cIntermediate, cUpperSlope, (t - 0.55) / 0.25);
    } else {
      result.lerpColors(cUpperSlope, cShallower, (t - 0.8) / 0.2);
    }
    return result;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE SETUP (Light scientific marine environment matching SAGAR)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xedf4f6); // Light blue-gray / off-white background

    // 2. CAMERA SETUP (Elevated Oblique Perspective scaled up by ~25% to fill viewport)
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Camera positioned closer by ~25% so terrain fills 80-85% of viewport
    camera.position.set(-4.5, 43.5, 39.5);
    camera.lookAt(0, -1, -2);

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2.15; // Prevent camera from flipping beneath the seafloor
    controls.minDistance = 20;
    controls.maxDistance = 110;
    controls.target.set(0, -1, -2);
    controls.update();

    // 5. ENHANCED SOFT SCIENTIFIC RELIEF LIGHTING (REVEALS SLOPES & TERRAIN CURVATURE)
    // Ambient light provides soft base illumination without washing out slope curvature
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.48);
    scene.add(ambientLight);

    // Key directional light from North-West at 50° angle
    // Generates clear, gentle shaded relief across south-facing slopes, the ridge crest, and crater rims
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(-38, 68, -42);
    scene.add(dirLight);

    // Counter-slope soft fill light for gentle abyssal contrast
    const fillLight = new THREE.DirectionalLight(0xc2dee6, 0.28);
    fillLight.position.set(38, 15, 38);
    scene.add(fillLight);

    // 6. BUILD SEABED TERRAIN SURFACE (NO EXTRUDED BOX OR VERTICAL WALLS)
    const grid = SURVEY_BATHYMETRY;
    const cols = grid.cols;
    const rows = grid.rows;

    const terrainWidth = 96;
    const terrainHeight = 55;

    const planeGeo = new THREE.PlaneGeometry(terrainWidth, terrainHeight, cols - 1, rows - 1);
    planeGeo.rotateX(-Math.PI / 2); // Orient onto horizontal X-Z plane

    const posAttr = planeGeo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < posAttr.count; i++) {
      const colIndex = i % cols;
      const rowIndex = Math.floor(i / cols);

      const depth = grid.depthGrid[rowIndex][colIndex];
      const yElev = toWorldY(depth);
      posAttr.setY(i, yElev);

      const color = getDepthColor(depth);
      colors.push(color.r, color.g, color.b);
    }

    planeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    planeGeo.computeVertexNormals();

    // Geological matte finish with soft micro-contrast to clearly express terrain curvature
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.74,
      metalness: 0.0,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(planeGeo, terrainMaterial);
    terrainMesh.name = 'bathymetry-terrain-mesh';
    scene.add(terrainMesh);

    // Subtle, clean GIS boundary line around the surveyed grid edge
    const edgePoints: THREE.Vector3[] = [];
    for (let c = 0; c < cols; c++) {
      const d = grid.depthGrid[0][c];
      edgePoints.push(new THREE.Vector3(toWorldX((c / (cols - 1)) * 960), toWorldY(d) + 0.03, toWorldZ(0)));
    }
    for (let r = 0; r < rows; r++) {
      const d = grid.depthGrid[r][cols - 1];
      edgePoints.push(new THREE.Vector3(toWorldX(960), toWorldY(d) + 0.03, toWorldZ((r / (rows - 1)) * 550)));
    }
    for (let c = cols - 1; c >= 0; c--) {
      const d = grid.depthGrid[rows - 1][c];
      edgePoints.push(new THREE.Vector3(toWorldX((c / (cols - 1)) * 960), toWorldY(d) + 0.03, toWorldZ(550)));
    }
    for (let r = rows - 1; r >= 0; r--) {
      const d = grid.depthGrid[r][0];
      edgePoints.push(new THREE.Vector3(toWorldX(0), toWorldY(d) + 0.03, toWorldZ((r / (rows - 1)) * 550)));
    }

    const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePoints);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x2a7c7a, transparent: true, opacity: 0.35 });
    const edgeLine = new THREE.Line(edgeGeo, edgeMat);
    scene.add(edgeLine);

    // 7. BUILD CONFORMING SURVEY TRANSECT TRACKS (L-01 to L-23)
    const surveyGroup = new THREE.Group();
    surveyGroup.name = 'survey-lines-group';

    SURVEY_LINES.forEach((line) => {
      const points: THREE.Vector3[] = [];
      const steps = 30; // High sampling for continuous adherence to slopes
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const curX = line.x1 + (line.x2 - line.x1) * t;
        const curY = line.y1 + (line.y2 - line.y1) * t;
        const depth = getBathymetryDepthAt(curX, curY);
        points.push(new THREE.Vector3(toWorldX(curX), toWorldY(depth) + 0.06, toWorldZ(curY)));
      }

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: line.completed ? 0x2a7c7a : 0x60868c,
        transparent: true,
        opacity: line.completed ? 0.45 : 0.22,
        linewidth: 1,
      });

      const lineMesh = new THREE.Line(lineGeo, lineMat);
      surveyGroup.add(lineMesh);
    });
    scene.add(surveyGroup);

    // 8. BUILD CONFORMING SURVEY SWATH BOUNDARY (1.84 km² Mapped Swath)
    const swathPerimeter: [number, number][] = [
      [70, 65], [710, 65], [710, 485], [70, 485], [70, 65]
    ];
    const swath3DPoints: THREE.Vector3[] = [];
    for (let i = 0; i < swathPerimeter.length - 1; i++) {
      const p1 = swathPerimeter[i];
      const p2 = swathPerimeter[i + 1];
      const segSteps = 20;
      for (let s = 0; s <= segSteps; s++) {
        const t = s / segSteps;
        const sx = p1[0] + (p2[0] - p1[0]) * t;
        const sy = p1[1] + (p2[1] - p1[1]) * t;
        const d = getBathymetryDepthAt(sx, sy);
        swath3DPoints.push(new THREE.Vector3(toWorldX(sx), toWorldY(d) + 0.08, toWorldZ(sy)));
      }
    }
    const swathGeo = new THREE.BufferGeometry().setFromPoints(swath3DPoints);
    const swathMat = new THREE.LineDashedMaterial({
      color: 0x2a7c7a,
      dashSize: 1.6,
      gapSize: 0.9,
      transparent: true,
      opacity: 0.65,
    });
    const swathLine = new THREE.Line(swathGeo, swathMat);
    swathLine.computeLineDistances();
    swathLine.name = 'swath-boundary-line';
    scene.add(swathLine);

    // 9. ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Update camera azimuth compass
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position.clone().sub(controls.target));
      setCameraAzimuth((spherical.theta * 180) / Math.PI);

      // Animate pulsing intensity halos on anomaly targets
      targets.forEach((tgt) => {
        const obj = anomalyObjectsRef.current[tgt.code];
        if (obj) {
          const haloGroup = obj.getObjectByName('halo-group');
          if (haloGroup) {
            const isPriority = tgt.code === 'A-03';
            const pulseRate = isPriority ? 2.8 : 1.6;
            const s = 1.0 + Math.sin(elapsed * pulseRate) * (isPriority ? 0.12 : 0.05);
            haloGroup.scale.set(s, 1, s);
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. RESIZE LISTENER
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      planeGeo.dispose();
      terrainMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update visibility of survey lines & swath
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const surveyGroup = scene.getObjectByName('survey-lines-group');
    if (surveyGroup) {
      surveyGroup.visible = showSurveyLines;
    }

    const swathLine = scene.getObjectByName('swath-boundary-line');
    if (swathLine) {
      swathLine.visible = showCoverage;
    }
  }, [showSurveyLines, showCoverage]);

  // ANCHOR ANOMALIES DIRECTLY TO TERRAIN WITH DISTINCT CONTRAST & VISIBILITY
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up previous anomaly groups
    Object.values(anomalyObjectsRef.current).forEach((grp) => scene.remove(grp));
    anomalyObjectsRef.current = {};

    if (!showAnomalies) return;

    targets.forEach((tgt) => {
      const group = new THREE.Group();
      group.name = `target-${tgt.code}`;

      const worldX = toWorldX(tgt.coordinates.x);
      const worldZ = toWorldZ(tgt.coordinates.y);
      const depth = getBathymetryDepthAt(tgt.coordinates.x, tgt.coordinates.y);
      const seabedY = toWorldY(depth);

      // Anchor group position directly on the seabed surface
      group.position.set(worldX, seabedY, worldZ);

      const isA03 = tgt.code === 'A-03';
      const isHigh = tgt.status === 'HIGH';
      const isSelected = selectedTargetCode === tgt.code;

      // Color scheme:
      // A-03: Solid vibrant high-priority red (#B85C5C / 0xC94A4A)
      // High: Solid amber-ochre (#B78332 / 0xD4892A)
      // Others: Solid deep ocean teal (#1F4B60)
      const hexColor = isA03 ? 0xc94a4a : isHigh ? 0xd4892a : 0x1f4b60;

      // 1. Ground Anomaly Footprint Disc with High-Contrast White Border Ring
      if (showSignalHalos) {
        const haloGroup = new THREE.Group();
        haloGroup.name = 'halo-group';

        const outerRadius = isA03 ? 4.8 : isHigh ? 3.2 : 2.2;

        // Outer contrasting white border ring (pops vividly on light seabed)
        const whiteBorderGeo = new THREE.RingGeometry(outerRadius * 0.94, outerRadius * 1.02, 32);
        whiteBorderGeo.rotateX(-Math.PI / 2);
        const whiteBorderMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        });
        const whiteBorderMesh = new THREE.Mesh(whiteBorderGeo, whiteBorderMat);
        whiteBorderMesh.position.set(0, 0.05, 0);
        haloGroup.add(whiteBorderMesh);

        // Core colored halo ring
        const ringGeo = new THREE.RingGeometry(outerRadius * 0.65, outerRadius * 0.95, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: hexColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isA03 ? 0.70 : 0.45,
          depthWrite: false,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(0, 0.04, 0);
        haloGroup.add(ringMesh);

        // Translucent inner response disk
        const innerDiskGeo = new THREE.CircleGeometry(outerRadius * 0.62, 32);
        innerDiskGeo.rotateX(-Math.PI / 2);
        const innerDiskMat = new THREE.MeshBasicMaterial({
          color: hexColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isA03 ? 0.32 : 0.16,
          depthWrite: false,
        });
        const innerDisk = new THREE.Mesh(innerDiskGeo, innerDiskMat);
        innerDisk.position.set(0, 0.03, 0);
        haloGroup.add(innerDisk);

        group.add(haloGroup);
      }

      // 2. Short Anchored Ground Pin
      const pinHeight = isA03 ? 1.05 : 0.85;
      const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, pinHeight, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 0.95 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(0, pinHeight / 2, 0);
      group.add(pinMesh);

      // 3. Clear Solid Target Marker Beacon with White Contrast Halo
      const sphereRadius = isA03 ? 0.68 : isHigh ? 0.50 : 0.42;

      // Outer contrasting white sphere ring
      const whiteBackGeo = new THREE.SphereGeometry(sphereRadius * 1.22, 16, 16);
      const whiteBackMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const whiteBackMesh = new THREE.Mesh(whiteBackGeo, whiteBackMat);
      whiteBackMesh.position.set(0, pinHeight + sphereRadius, 0);
      group.add(whiteBackMesh);

      // Core colored solid sphere
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.2,
        metalness: 0.25,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(0, pinHeight + sphereRadius, 0);
      sphereMesh.userData = { targetCode: tgt.code };
      group.add(sphereMesh);

      // 4. Distinct Billboard Label Pill (clearly readable above terrain from camera)
      const labelSprite = createTargetLabelSprite(tgt.code, tgt.signalStrength, isA03, isHigh);
      const spriteScale = isA03 ? [8.2, 2.3, 1] : isHigh ? [6.8, 1.9, 1] : [5.8, 1.6, 1];
      labelSprite.scale.set(spriteScale[0], spriteScale[1], spriteScale[2]);
      labelSprite.position.set(0, pinHeight + sphereRadius + (isA03 ? 2.0 : 1.6), 0);
      group.add(labelSprite);

      // 5. Interactive Focus Reticle for Selected Anomaly
      if (isSelected) {
        const reticleRadius = isA03 ? 4.8 : 3.4;
        const reticleGeo = new THREE.RingGeometry(reticleRadius, reticleRadius + 0.35, 32);
        reticleGeo.rotateX(-Math.PI / 2);
        const reticleMat = new THREE.MeshBasicMaterial({
          color: isA03 ? 0xb85c5c : 0x2a7c7a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        });
        const reticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
        reticleMesh.position.set(0, 0.06, 0);
        group.add(reticleMesh);

        // Ground crosshair ticks
        const tickMat = new THREE.LineBasicMaterial({ color: isA03 ? 0xb85c5c : 0x2a7c7a });
        const tickPoints = [
          new THREE.Vector3(-reticleRadius - 1.2, 0.07, 0), new THREE.Vector3(-reticleRadius + 0.2, 0.07, 0),
          new THREE.Vector3(reticleRadius - 0.2, 0.07, 0), new THREE.Vector3(reticleRadius + 1.2, 0.07, 0),
          new THREE.Vector3(0, 0.07, -reticleRadius - 1.2), new THREE.Vector3(0, 0.07, -reticleRadius + 0.2),
          new THREE.Vector3(0, 0.07, reticleRadius - 0.2), new THREE.Vector3(0, 0.07, reticleRadius + 1.2),
        ];
        const tickGeo = new THREE.BufferGeometry().setFromPoints(tickPoints);
        const ticks = new THREE.LineSegments(tickGeo, tickMat);
        group.add(ticks);
      }

      scene.add(group);
      anomalyObjectsRef.current[tgt.code] = group;
    });
  }, [targets, selectedTargetCode, showAnomalies, showSignalHalos]);

  // Raycasting for Target Click & Hover
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const hitObjects: THREE.Object3D[] = [];
    Object.values(anomalyObjectsRef.current).forEach((grp) => {
      grp.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData?.targetCode) {
          hitObjects.push(child);
        }
      });
    });

    const intersects = raycasterRef.current.intersectObjects(hitObjects);
    if (intersects.length > 0) {
      const targetCode = intersects[0].object.userData.targetCode;
      const found = targets.find((t) => t.code === targetCode) || null;
      setHoveredTarget(found);
      container.style.cursor = 'pointer';
    } else {
      setHoveredTarget(null);
      container.style.cursor = 'grab';
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary mouse button

    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const hitObjects: THREE.Object3D[] = [];
    Object.values(anomalyObjectsRef.current).forEach((grp) => {
      grp.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData?.targetCode) {
          hitObjects.push(child);
        }
      });
    });

    const intersects = raycasterRef.current.intersectObjects(hitObjects);
    if (intersects.length > 0) {
      const targetCode = intersects[0].object.userData.targetCode;
      onSelectTarget(targetCode);
    }
  };

  // Camera preset actions (scaled up to fill 80-85% of viewport)
  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(-4.5, 43.5, 39.5);
    controlsRef.current.target.set(0, -1, -2);
    controlsRef.current.update();
    setIsTopDown(false);
  };

  const toggleTopDown = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (!isTopDown) {
      cameraRef.current.position.set(0, 66, 0.1);
      controlsRef.current.target.set(0, -1, 0);
      controlsRef.current.update();
      setIsTopDown(true);
    } else {
      resetCamera();
    }
  };

  const zoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dir = new THREE.Vector3();
    cameraRef.current.getWorldDirection(dir);
    cameraRef.current.position.addScaledVector(dir, 8);
    controlsRef.current.update();
  };

  const zoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dir = new THREE.Vector3();
    cameraRef.current.getWorldDirection(dir);
    cameraRef.current.position.addScaledVector(dir, -8);
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#EDF4F6]">
      {/* 1. MANDATORY SIMULATED BATHYMETRY & VERTICAL EXAGGERATION LABELS */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#FFFFFF]/95 backdrop-blur-[6px] px-3 py-1.5 rounded-[4px] border border-[#CBD9DA] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#2A7C7A]" />
          <span className="font-mono text-xs font-bold text-[#1F4B60] tracking-wider uppercase">
            BATHYMETRY — SIMULATED DATA
          </span>
          <span className="text-[10px] font-mono text-[#60868C] border-l border-[#CBD9DA] pl-2 font-semibold">
            VERTICAL EXAGGERATION: 8×
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#60868C] bg-[#FFFFFF]/90 px-2.5 py-1 rounded-[3px] border border-[#CBD9DA]/70 shadow-sm max-w-[285px]">
          3D digital terrain model interpolated from CIOB-04 tectonic framework & isobaths
        </div>
      </div>

      {/* 2. 3D NAVIGATION & CAMERA TOOLBAR */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#FFFFFF]/95 backdrop-blur-[6px] p-1.5 rounded-[6px] border border-[#CBD9DA] shadow-sm text-xs font-sans">
        {/* Dynamic North Arrow Indicator */}
        <div
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-[#1F4B60] border-r border-[#CBD9DA]"
          title="Grid North Orientation"
        >
          <Compass
            className="w-3.5 h-3.5 text-[#2A7C7A] transition-transform duration-75"
            style={{ transform: `rotate(${-cameraAzimuth}deg)` }}
          />
          <span className="font-bold">N</span>
        </div>

        {/* 3D / Plan Toggle */}
        <button
          onClick={toggleTopDown}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            isTopDown
              ? 'bg-[#2A7C7A] text-[#FFFFFF]'
              : 'text-[#1F4B60] hover:bg-[#F2F6F6]'
          }`}
          title="Toggle Top-Down / 3D Oblique View"
        >
          {isTopDown ? '3D VIEW' : 'TOP-DOWN'}
        </button>

        {/* Zoom In */}
        <button
          onClick={zoomIn}
          className="p-1.5 text-[#60868C] hover:text-[#1F4B60] hover:bg-[#F2F6F6] rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          className="p-1.5 text-[#60868C] hover:text-[#1F4B60] hover:bg-[#F2F6F6] rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={resetCamera}
          className="p-1.5 text-[#60868C] hover:text-[#1F4B60] hover:bg-[#F2F6F6] rounded transition-colors"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. SCIENTIFIC COMPACT 3D LEGEND (Updated gradient matching subtle depth palette) */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#FFFFFF]/95 backdrop-blur-[6px] p-2.5 rounded-[6px] border border-[#CBD9DA] shadow-sm flex flex-col gap-2 pointer-events-none max-w-[280px]">
        <div className="flex items-center justify-between text-[10px] font-sans font-semibold text-[#1F4B60] uppercase tracking-wider">
          <span>SEAFLOOR DEPTH (BATHYMETRY)</span>
          <span className="font-mono text-[#60868C] font-normal">CI: 50m</span>
        </div>

        {/* Depth Hypsometric Color Ramp */}
        <div className="space-y-1">
          <div className="h-2 rounded-[2px] w-full bg-gradient-to-r from-[#EAF4F6] via-[#8FBCC5] to-[#3B6774] border border-[#CBD9DA]" />
          <div className="flex items-center justify-between text-[9px] font-mono text-[#60868C]">
            <span>-4,200m (Ridge)</span>
            <span>-4,300m</span>
            <span>-4,390m (Basin)</span>
          </div>
        </div>

        {/* Feature Keys */}
        <div className="pt-1.5 border-t border-[#CBD9DA]/70 grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px] font-mono text-[#60868C]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-[1.5px] bg-[#2A7C7A]" />
            <span>Survey Coverage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B85C5C] border border-[#FFFFFF]" />
            <span className="text-[#B85C5C] font-semibold">Priority Anomaly (A-03)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B78332] border border-[#FFFFFF]" />
            <span className="text-[#B78332]">Metal-related Anomaly</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-[#2A7C7A] bg-[#2A7C7A]/25" />
            <span>Signal Intensity Halo</span>
          </div>
        </div>
      </div>

      {/* 4. MOUSE NAVIGATION HINT FOOTNOTE */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-2 bg-[#FFFFFF]/90 backdrop-blur-[4px] px-2.5 py-1 rounded-[4px] border border-[#CBD9DA] text-[9.5px] font-mono text-[#60868C] shadow-sm pointer-events-none">
        <span>LEFT CLICK: ORBIT</span>
        <span>•</span>
        <span>RIGHT CLICK: PAN</span>
        <span>•</span>
        <span>SCROLL: ZOOM</span>
      </div>

      {/* 5. 3D WEBGL CANVAS MOUNT */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      />

      {/* 6. HOVERED ANOMALY TARGET TOOLTIP */}
      {hoveredTarget && (
        <div
          className="absolute z-20 pointer-events-none bg-[#FFFFFF]/98 backdrop-blur-[6px] border border-[#CBD9DA] p-2.5 rounded-[6px] shadow-lg text-xs font-mono max-w-xs transition-all"
          style={{
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center justify-between border-b border-[#CBD9DA] pb-1 mb-1 gap-4">
            <div className="flex items-center gap-1.5">
              <Target className={`w-3.5 h-3.5 ${hoveredTarget.code === 'A-03' ? 'text-[#B85C5C]' : 'text-[#2A7C7A]'}`} />
              <span className="font-bold text-[#1F4B60]">CANDIDATE TARGET {hoveredTarget.code}</span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                hoveredTarget.status === 'PRIORITY'
                  ? 'bg-[#F9E8E8] text-[#B85C5C] border-[#B85C5C]/30'
                  : hoveredTarget.status === 'HIGH'
                  ? 'bg-[#F8EFE3] text-[#B78332] border-[#B78332]/30'
                  : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
              }`}
            >
              {hoveredTarget.status}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[10.5px] text-[#60868C]">
            <span>Seafloor Depth: <strong className="text-[#1F4B60]">-{hoveredTarget.depth}m</strong></span>
            <span>Signal Response: <strong className="text-[#1F4B60]">{hoveredTarget.signalStrength} mV/V</strong></span>
            <span>Transect: <strong className="text-[#1F4B60]">{hoveredTarget.surveyLine}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveBathymetry3D;
