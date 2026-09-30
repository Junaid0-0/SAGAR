import { SurveyMission } from '../types';

export const MOCK_MISSIONS: SurveyMission[] = [
  {
    id: 'SURVEY-07',
    name: 'SURVEY 07',
    date: 'Current (30 SEP 2026)',
    depth: 4286,
    distance: 2.84,
    area: 1.84,
    measurements: 12842,
    anomalies: 7,
    status: 'ACTIVE',
    vessel: 'RV SAMUDRA',
    location: 'Central Indian Ridge / Carlsberg South Sector',
    primaryZone: 'Hydrothermal Sulphide & Nodule Prospect Alpha',
    summary: 'Active deep-tow deployment testing high-frequency electromagnetic inductive array. Primary focus on seabed conductivity gradients and magnetic dip anomaly screening.'
  },
  {
    id: 'SURVEY-06',
    name: 'SURVEY 06',
    date: '18 SEP 2026',
    depth: 4210,
    distance: 3.21,
    area: 2.10,
    measurements: 15203,
    anomalies: 4,
    status: 'COMPLETED',
    vessel: 'RV SAMUDRA',
    location: 'Rodrigues Triple Junction Basin Sector 4',
    primaryZone: 'Pelagic Ferromanganese Crust Candidate Field',
    summary: 'Completed systematic 50m line spacing survey. Identified 4 candidate exploration targets with elevated magnetic susceptibility. Transferred coordinates to national oceanographic registry.'
  },
  {
    id: 'SURVEY-05',
    name: 'SURVEY 05',
    date: '12 SEP 2026',
    depth: 4382,
    distance: 2.76,
    area: 1.72,
    measurements: 11940,
    anomalies: 9,
    status: 'COMPLETED',
    vessel: 'RV SAGAR KANYA',
    location: 'Central Indian Ocean Basin (CIOB) Sector B',
    primaryZone: 'Polymetallic Nodule High-Density Terrace',
    summary: 'Abyssal plain transect over siliceous ooze substrate. High density of metal-related acoustic/inductive anomalies observed along northwest escarpment.'
  },
  {
    id: 'SURVEY-04',
    name: 'SURVEY 04',
    date: '04 SEP 2026',
    depth: 4125,
    distance: 2.42,
    area: 1.48,
    measurements: 9832,
    anomalies: 3,
    status: 'COMPLETED',
    vessel: 'RV SAMUDRA',
    location: 'Ninety East Ridge Lateral Flank',
    primaryZone: 'Sub-Seafloor Basaltic Crust Exploration',
    summary: 'Sensor pod stability trial in moderate bottom currents (0.3 m/s). IMU compensation validated; 3 localized magnetic deviation points logged.'
  },
  {
    id: 'SURVEY-03',
    name: 'SURVEY 03',
    date: '28 AUG 2026',
    depth: 3980,
    distance: 1.95,
    area: 1.15,
    measurements: 8420,
    anomalies: 2,
    status: 'COMPLETED',
    vessel: 'RV SAMUDRA',
    location: 'Southern Bay of Bengal Deep Terrace',
    primaryZone: 'Rare-Earth-Bearing Sedimentary Shelf',
    summary: 'Shallow abyssal baseline survey. Verified inductive coil sensitivity at depths under 4000m. Signal-to-noise ratio maintained above 28 dB.'
  }
];
