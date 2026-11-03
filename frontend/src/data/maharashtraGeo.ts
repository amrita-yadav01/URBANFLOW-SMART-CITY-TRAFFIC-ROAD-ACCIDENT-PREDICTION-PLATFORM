export interface MaharashtraDistrict {
  id: string;
  name: string;
  marathiName: string;
  division: 'Konkan' | 'Pune' | 'Nashik' | 'Chhatrapati Sambhajinagar' | 'Amravati' | 'Nagpur';
  center: [number, number]; // [lat, lon]
  zoomLevel: number;
  hasAccidentData: boolean;
  accidentRecordsCount: number;
  primaryCorridors: string[];
  statusLabel: string;
  description: string;
}

export const MAHARASHTRA_STATE_BOUNDS: [[number, number], [number, number]] = [
  [15.60, 72.60], // Southwest [lat, lon]
  [22.10, 80.90]  // Northeast [lat, lon]
];

export const MAHARASHTRA_CENTER: [number, number] = [19.7515, 75.7139];
export const MAHARASHTRA_DEFAULT_ZOOM = 7;

export const MAHARASHTRA_DISTRICTS: MaharashtraDistrict[] = [
  {
    id: 'mumbai-suburban',
    name: 'Mumbai Suburban',
    marathiName: 'मुंबई उपनगर',
    division: 'Konkan',
    center: [19.1136, 72.8697],
    zoomLevel: 12,
    hasAccidentData: true,
    accidentRecordsCount: 2450,
    primaryCorridors: ['Western Express Hwy', 'Jogeshwari-Vikhroli Link Rd', 'Santacruz-Chembur Link Rd'],
    statusLabel: 'Active Live Telemetry',
    description: 'High-density suburban network with heavy commuter corridors connecting Bandra to Dahisar.'
  },
  {
    id: 'mumbai-city',
    name: 'Mumbai City',
    marathiName: 'मुंबई शहर',
    division: 'Konkan',
    center: [18.9388, 72.8354],
    zoomLevel: 13,
    hasAccidentData: true,
    accidentRecordsCount: 750,
    primaryCorridors: ['Bandra-Worli Sea Link', 'Eastern Freeway', 'Dr. B. Ambedkar Rd'],
    statusLabel: 'Active Live Telemetry',
    description: 'Island city financial district with historical arterial junctions and coastal sea links.'
  },
  {
    id: 'thane',
    name: 'Thane',
    marathiName: 'ठाणे',
    division: 'Konkan',
    center: [19.2183, 72.9781],
    zoomLevel: 12,
    hasAccidentData: true,
    accidentRecordsCount: 380,
    primaryCorridors: ['Eastern Express Hwy', 'Ghodbunder Rd', 'Thane-Belapur Rd'],
    statusLabel: 'Active Live Telemetry',
    description: 'Major industrial and commuter gateway connecting Mumbai to northern and eastern hinterlands.'
  },
  {
    id: 'raigad',
    name: 'Raigad / Navi Mumbai',
    marathiName: 'रायगड / नवी मुंबई',
    division: 'Konkan',
    center: [18.9894, 73.0805],
    zoomLevel: 11,
    hasAccidentData: true,
    accidentRecordsCount: 220,
    primaryCorridors: ['Sion-Panvel Expressway', 'Mumbai-Pune Expressway (Panvel)', 'Palm Beach Rd'],
    statusLabel: 'Active Live Telemetry',
    description: 'Planned satellite growth center with high-speed express corridors and port freight flow.'
  },
  {
    id: 'pune',
    name: 'Pune',
    marathiName: 'पुणे',
    division: 'Pune',
    center: [18.5204, 73.8567],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Mumbai-Pune Expressway', 'Pune-Bengaluru NH 48', 'Pune-Solapur Hwy', 'Katraj-Dehu Bypass'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Cultural and IT capital of Maharashtra. Spatial schema indexed; awaiting local municipal FIR upload.'
  },
  {
    id: 'nashik',
    name: 'Nashik',
    marathiName: 'नाशिक',
    division: 'Nashik',
    center: [19.9975, 73.7898],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Mumbai-Agra NH 3', 'Nashik-Pune NH 50', 'Samruddhi Mahamarg Interchange'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'North Maharashtra logistics hub and industrial corridor connected to the golden quadrilateral.'
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    marathiName: 'नागपूर',
    division: 'Nagpur',
    center: [21.1458, 79.0882],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Samruddhi Mahamarg Terminus', 'North-South Corridor NH 44', 'Nagpur Outer Ring Rd'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Geographical center of India (Zero Mile); critical freight transit hub across Central India.'
  },
  {
    id: 'chhatrapati-sambhajinagar',
    name: 'Chhatrapati Sambhajinagar',
    marathiName: 'छत्रपती संभाजीनगर',
    division: 'Chhatrapati Sambhajinagar',
    center: [19.8762, 75.3433],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Samruddhi Mahamarg Hub', 'Jalna-Aurangabad Rd', 'Aurangabad-Pune Hwy'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Industrial and heritage node of Marathwada connected directly to the Samruddhi Super Expressway.'
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    marathiName: 'कोल्हापूर',
    division: 'Pune',
    center: [16.7050, 74.2433],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['NH 48 Pune-Bengaluru Corridor', 'Kolhapur-Ratnagiri Hwy'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Southern Maharashtra commercial center with major sugar and agro-industrial highway traffic.'
  },
  {
    id: 'solapur',
    name: 'Solapur',
    marathiName: 'सोलापूर',
    division: 'Pune',
    center: [17.6599, 75.9064],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Pune-Solapur NH 65', 'Solapur-Bijapur NH 52'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Major junction linking Maharashtra with Karnataka and Telangana commercial arterial routes.'
  },
  {
    id: 'amravati',
    name: 'Amravati',
    marathiName: 'अमरावती',
    division: 'Amravati',
    center: [20.9374, 77.7796],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['NH 6 Surat-Kolkata Hwy', 'Amravati-Nagpur Expressway Link'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Vidarbha regional administrative center with heavy cotton belt transport corridors.'
  },
  {
    id: 'satara',
    name: 'Satara',
    marathiName: 'सातारा',
    division: 'Pune',
    center: [17.6805, 74.0183],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['NH 48 Western Ghats Pass', 'Satara-Mahabaleshwar Rd'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Foothills of the Sahyadri ranges with prominent hill-section curve accident hazards.'
  },
  {
    id: 'palghar',
    name: 'Palghar',
    marathiName: 'पालघर',
    division: 'Konkan',
    center: [19.6967, 72.7699],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Mumbai-Ahmedabad NH 48', 'Palghar-Manor Rd'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Northern Konkan coastline connecting Maharashtra to Gujarat via high-speed NH 48.'
  },
  {
    id: 'ahmednagar',
    name: 'Ahilyanagar (Ahmednagar)',
    marathiName: 'अहिल्यानगर',
    division: 'Nashik',
    center: [19.0948, 74.7480],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Pune-Ahmednagar-Aurangabad Corridor', 'Kalyan-Nirmal NH 222'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Geographically largest district in Maharashtra connecting western and central zones.'
  },
  {
    id: 'jalgaon',
    name: 'Jalgaon',
    marathiName: 'जळगाव',
    division: 'Nashik',
    center: [21.0077, 75.5626],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['NH 6 Asian Hwy 46', 'Jalgaon-Ajanta Highway'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Khandesh region transit node along the Tapi river basin with heavy inter-state truck movement.'
  },
  {
    id: 'nanded',
    name: 'Nanded',
    marathiName: 'नांदेड',
    division: 'Chhatrapati Sambhajinagar',
    center: [19.1383, 77.3210],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Nanded-Hyderabad NH 161', 'Nanded-Nagpur Link'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Southeastern Marathwada hub with cross-border transport linkages to Telangana.'
  },
  {
    id: 'ratnagiri',
    name: 'Ratnagiri',
    marathiName: 'रत्नागिरी',
    division: 'Konkan',
    center: [16.9902, 73.3120],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Mumbai-Goa NH 66', 'Kashedi Ghat Section'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Coastal Konkan highway with dramatic ghat ascents and high seasonal monsoon rain risks.'
  },
  {
    id: 'chandrapur',
    name: 'Chandrapur',
    marathiName: 'चंद्रपूर',
    division: 'Nagpur',
    center: [19.9615, 79.2961],
    zoomLevel: 11,
    hasAccidentData: false,
    accidentRecordsCount: 0,
    primaryCorridors: ['Nagpur-Chandrapur Corridor', 'Ballarpur Industrial Hwy'],
    statusLabel: 'Ready for Police FIR Ingestion',
    description: 'Mineral and thermal power corridor characterized by heavy coal transit logistics.'
  }
];

export const MAHARASHTRA_EXPRESSWAYS = [
  {
    name: 'Hindu Hrudaysamrat Balasaheb Thackeray Samruddhi Mahamarg',
    shortName: 'Samruddhi Mahamarg (Mumbai-Nagpur Expressway)',
    lengthKm: 701,
    speedLimit: 120,
    lanes: 6,
    districtsTraversed: ['Nagpur', 'Wardha', 'Amravati', 'Washim', 'Buldhana', 'Jalna', 'Chhatrapati Sambhajinagar', 'Ahmednagar', 'Nashik', 'Thane'],
    points: [
      [21.1458, 79.0882], // Nagpur
      [20.7453, 78.6022], // Wardha
      [20.5312, 76.1847], // Buldhana
      [19.8762, 75.3433], // Chhatrapati Sambhajinagar
      [19.9975, 73.7898], // Nashik
      [19.2183, 72.9781]  // Thane / Mumbai
    ]
  },
  {
    name: 'Yashwantrao Chavan Mumbai-Pune Expressway',
    shortName: 'Mumbai-Pune Expressway',
    lengthKm: 94.5,
    speedLimit: 100,
    lanes: 6,
    districtsTraversed: ['Raigad', 'Pune'],
    points: [
      [18.9894, 73.0805], // Panvel (Raigad)
      [18.7562, 73.4072], // Khandala Ghat
      [18.7490, 73.4837], // Lonavala
      [18.5204, 73.8567]  // Pune
    ]
  },
  {
    name: 'Western Express Highway (WEH)',
    shortName: 'WEH (Mumbai Metropolitan)',
    lengthKm: 25.3,
    speedLimit: 80,
    lanes: 8,
    districtsTraversed: ['Mumbai Suburban'],
    points: [
      [19.2500, 72.8590], // Dahisar
      [19.1860, 72.8550], // Malad
      [19.1197, 72.8584], // Andheri Flyover
      [19.0596, 72.8440]  // Bandra
    ]
  },
  {
    name: 'Eastern Express Highway (EEH)',
    shortName: 'EEH (Mumbai-Thane)',
    lengthKm: 23.5,
    speedLimit: 80,
    lanes: 8,
    districtsTraversed: ['Thane', 'Mumbai Suburban'],
    points: [
      [19.2183, 72.9781], // Thane Majiwada
      [19.1550, 72.9350], // Bhandup
      [19.0800, 72.9050], // Ghatkopar
      [19.0400, 72.8650]  // Sion
    ]
  }
];

