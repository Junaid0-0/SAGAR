export interface ContourLine {
  id: string;
  depth: number;
  d: string;
  color: string;
  labelX: number;
  labelY: number;
}

export interface SurveyPathSegment {
  id: string;
  name: string;
  points: [number, number][];
  completed: boolean;
}

// Coordinate space: 900 x 550 viewBox for SVG Bathymetric Seafloor Map
export const BATHYMETRIC_CONTOURS: ContourLine[] = [
  {
    id: 'c-4200',
    depth: 4200,
    d: 'M 40,70 Q 220,40 420,85 T 750,60 Q 840,90 890,80',
    color: '#1e3d6f',
    labelX: 80,
    labelY: 65,
  },
  {
    id: 'c-4250',
    depth: 4250,
    d: 'M 30,170 Q 200,140 380,180 T 670,165 Q 780,210 880,180',
    color: '#162e54',
    labelX: 90,
    labelY: 165,
  },
  {
    id: 'c-4300',
    depth: 4300,
    d: 'M 30,290 Q 180,260 370,300 T 660,285 Q 770,330 880,310',
    color: '#102342',
    labelX: 90,
    labelY: 285,
  },
  {
    id: 'c-4350',
    depth: 4350,
    d: 'M 30,410 Q 240,380 430,425 T 700,395 Q 810,440 880,430',
    color: '#0c1b33',
    labelX: 90,
    labelY: 415,
  },
  {
    id: 'c-4400',
    depth: 4400,
    d: 'M 30,490 Q 260,470 510,510 T 780,480 880,500',
    color: '#081324',
    labelX: 90,
    labelY: 490,
  }
];

// 23 lawnmower survey lines spanning the operational grid
export const SURVEY_LINES: { id: string; name: string; x1: number; y1: number; x2: number; y2: number; completed: boolean }[] = [
  { id: 'L-01', name: 'L-01', x1: 90, y1: 80, x2: 90, y2: 470, completed: true },
  { id: 'L-02', name: 'L-02', x1: 125, y1: 470, x2: 125, y2: 80, completed: true },
  { id: 'L-03', name: 'L-03', x1: 160, y1: 80, x2: 160, y2: 470, completed: true },
  { id: 'L-04', name: 'L-04', x1: 195, y1: 470, x2: 195, y2: 80, completed: true },
  { id: 'L-05', name: 'L-05', x1: 230, y1: 80, x2: 230, y2: 470, completed: true },
  { id: 'L-06', name: 'L-06', x1: 265, y1: 470, x2: 265, y2: 80, completed: true },
  { id: 'L-07', name: 'L-07', x1: 300, y1: 80, x2: 300, y2: 470, completed: true },
  { id: 'L-08', name: 'L-08', x1: 335, y1: 470, x2: 335, y2: 80, completed: true },
  { id: 'L-09', name: 'L-09', x1: 370, y1: 80, x2: 370, y2: 470, completed: true },
  { id: 'L-10', name: 'L-10', x1: 405, y1: 470, x2: 405, y2: 80, completed: true },
  { id: 'L-11', name: 'L-11', x1: 440, y1: 80, x2: 440, y2: 470, completed: true },
  { id: 'L-12', name: 'L-12', x1: 475, y1: 470, x2: 475, y2: 80, completed: true },
  { id: 'L-13', name: 'L-13', x1: 510, y1: 80, x2: 510, y2: 470, completed: true },
  { id: 'L-14', name: 'L-14', x1: 545, y1: 470, x2: 545, y2: 80, completed: true },
  { id: 'L-15', name: 'L-15', x1: 580, y1: 80, x2: 580, y2: 470, completed: true },
  { id: 'L-16', name: 'L-16', x1: 615, y1: 470, x2: 615, y2: 80, completed: true },
  { id: 'L-17', name: 'L-17', x1: 650, y1: 80, x2: 650, y2: 470, completed: true },
  { id: 'L-18', name: 'L-18', x1: 685, y1: 470, x2: 685, y2: 80, completed: true }, // Current line
  { id: 'L-19', name: 'L-19', x1: 720, y1: 80, x2: 720, y2: 470, completed: false },
  { id: 'L-20', name: 'L-20', x1: 755, y1: 470, x2: 755, y2: 80, completed: false },
  { id: 'L-21', name: 'L-21', x1: 790, y1: 80, x2: 790, y2: 470, completed: false },
  { id: 'L-22', name: 'L-22', x1: 825, y1: 470, x2: 825, y2: 80, completed: false },
  { id: 'L-23', name: 'L-23', x1: 860, y1: 80, x2: 860, y2: 470, completed: false }
];

export interface StaticMeasurementPoint {
  id: string;
  x: number;
  y: number;
  response: number;
  depth: number;
  time: string;
  line: string;
}

// Generate realistic background measurement points along completed survey lines
export const GENERATED_MEASUREMENTS: StaticMeasurementPoint[] = [
  { id: 'm-1', x: 90, y: 120, response: 0.28, depth: 4280, time: '14:02:11', line: 'L-01' },
  { id: 'm-2', x: 90, y: 220, response: 0.32, depth: 4282, time: '14:03:45', line: 'L-01' },
  { id: 'm-3', x: 90, y: 340, response: 0.30, depth: 4285, time: '14:05:18', line: 'L-01' },
  { id: 'm-4', x: 125, y: 390, response: 0.31, depth: 4286, time: '14:07:02', line: 'L-02' },
  { id: 'm-5', x: 125, y: 270, response: 0.35, depth: 4284, time: '14:08:44', line: 'L-02' },
  { id: 'm-6', x: 125, y: 150, response: 0.54, depth: 4278, time: '14:10:15', line: 'L-02' }, // A-05
  { id: 'm-7', x: 160, y: 160, response: 0.32, depth: 4281, time: '14:12:00', line: 'L-03' },
  { id: 'm-8', x: 160, y: 310, response: 0.33, depth: 4284, time: '14:13:30', line: 'L-03' },
  { id: 'm-9', x: 195, y: 410, response: 0.36, depth: 4288, time: '14:15:10', line: 'L-04' },
  { id: 'm-10', x: 195, y: 220, response: 0.51, depth: 4287, time: '14:19:12', line: 'L-04' }, // A-01
  { id: 'm-11', x: 230, y: 180, response: 0.34, depth: 4283, time: '14:21:05', line: 'L-05' },
  { id: 'm-12', x: 230, y: 360, response: 0.35, depth: 4288, time: '14:23:00', line: 'L-05' },
  { id: 'm-13', x: 265, y: 320, response: 0.62, depth: 4290, time: '14:24:45', line: 'L-06' }, // A-02
  { id: 'm-14', x: 265, y: 170, response: 0.37, depth: 4285, time: '14:27:10', line: 'L-06' },
  { id: 'm-15', x: 300, y: 210, response: 0.39, depth: 4286, time: '14:29:20', line: 'L-07' },
  { id: 'm-16', x: 300, y: 285, response: 0.78, depth: 4291, time: '14:31:04', line: 'L-07' }, // A-03 Primary
  { id: 'm-17', x: 335, y: 350, response: 0.44, depth: 4293, time: '14:34:00', line: 'L-08' },
  { id: 'm-18', x: 370, y: 380, response: 0.44, depth: 4302, time: '14:38:20', line: 'L-09' }, // A-04
  { id: 'm-19', x: 440, y: 410, response: 0.49, depth: 4282, time: '14:44:02', line: 'L-11' }, // A-06
  { id: 'm-20', x: 545, y: 390, response: 0.68, depth: 4295, time: '14:52:19', line: 'L-14' }, // A-07
];
