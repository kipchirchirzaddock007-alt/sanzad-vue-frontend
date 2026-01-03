// src/symbolCatalog.js

export const SYMBOL_CATEGORIES = [
  {
    id: 'transport',
    label: 'Transport & Mobility',
    color: '#f97316',
  },
  {
    id: 'water',
    label: 'Water & Sanitation',
    color: '#0ea5e9',
  },
  {
    id: 'energy',
    label: 'Energy & Power',
    color: '#eab308',
  },
  {
    id: 'health',
    label: 'Health',
    color: '#f97373',
  },
  {
    id: 'education',
    label: 'Education',
    color: '#22c55e',
  },
  {
    id: 'housing',
    label: 'Housing & Urban Dev',
    color: '#a855f7',
  },
  {
    id: 'agriculture',
    label: 'Agriculture & Food',
    color: '#16a34a',
  },
  {
    id: 'security',
    label: 'Security & Justice',
    color: '#3b82f6',
  },
  {
    id: 'environment',
    label: 'Environment & Climate',
    color: '#10b981',
  },
  {
    id: 'ict',
    label: 'ICT & Digital',
    color: '#6366f1',
  },
  {
    id: 'govt',
    label: 'Govt Services',
    color: '#f59e0b',
  },
  {
    id: 'custom',
    label: 'Custom',
    color: '#9ca3af',
  },
];

export const SYMBOLS = [
  // TRANSPORT & MOBILITY
  {
    id: 'transport.road',
    category: 'transport',
    emoji: '🛣️',
    label: 'Road',
  },
  {
    id: 'transport.bridge',
    category: 'transport',
    emoji: '🌉',
    label: 'Bridge',
  },
  {
    id: 'transport.culvert',
    category: 'transport',
    emoji: '⭕',
    label: 'Culvert',
  },
  {
    id: 'transport.rail',
    category: 'transport',
    emoji: '🚆',
    label: 'Railway',
  },
  {
    id: 'transport.bus-terminus',
    category: 'transport',
    emoji: '🚌',
    label: 'Bus terminus',
  },
  {
    id: 'transport.airport',
    category: 'transport',
    emoji: '✈️',
    label: 'Airport / airstrip',
  },
  {
    id: 'transport.ferry',
    category: 'transport',
    emoji: '⛴️',
    label: 'Ferry/jetty',
  },
  {
    id: 'transport.footpath',
    category: 'transport',
    emoji: '🚶',
    label: 'Footpath',
  },

  // WATER & SANITATION
  {
    id: 'water.borehole',
    category: 'water',
    emoji: '⛲',
    label: 'Borehole',
  },
  {
    id: 'water.pipeline',
    category: 'water',
    emoji: '🚰',
    label: 'Water pipeline',
  },
  {
    id: 'water.dam',
    category: 'water',
    emoji: '🏞️',
    label: 'Dam / reservoir',
  },
  {
    id: 'water.tank',
    category: 'water',
    emoji: '🛢️',
    label: 'Water tank',
  },
  {
    id: 'water.latrine',
    category: 'water',
    emoji: '🚽',
    label: 'Latrines',
  },

  // ENERGY & POWER
  {
    id: 'energy.powerline',
    category: 'energy',
    emoji: '⚡',
    label: 'Power line',
  },
  {
    id: 'energy.substation',
    category: 'energy',
    emoji: '🏭',
    label: 'Substation',
  },
  {
    id: 'energy.solarfarm',
    category: 'energy',
    emoji: '🔆',
    label: 'Solar farm',
  },
  {
    id: 'energy.streetlight',
    category: 'energy',
    emoji: '💡',
    label: 'Street light',
  },

  // HEALTH
  {
    id: 'health.hospital',
    category: 'health',
    emoji: '🏥',
    label: 'Hospital',
  },
  {
    id: 'health.clinic',
    category: 'health',
    emoji: '🩺',
    label: 'Clinic / dispensary',
  },
  {
    id: 'health.maternity',
    category: 'health',
    emoji: '🤱',
    label: 'Maternity',
  },
  {
    id: 'health.lab',
    category: 'health',
    emoji: '🧪',
    label: 'Health lab',
  },

  // EDUCATION
  {
    id: 'education.primary',
    category: 'education',
    emoji: '🏫',
    label: 'Primary school',
  },
  {
    id: 'education.secondary',
    category: 'education',
    emoji: '🎓',
    label: 'Secondary school',
  },
  {
    id: 'education.tvet',
    category: 'education',
    emoji: '🛠️',
    label: 'TVET / polytechnic',
  },
  {
    id: 'education.library',
    category: 'education',
    emoji: '📚',
    label: 'Library',
  },

  // HOUSING & URBAN DEV
  {
    id: 'housing.estate',
    category: 'housing',
    emoji: '🏘️',
    label: 'Housing estate',
  },
  {
    id: 'housing.market',
    category: 'housing',
    emoji: '🛒',
    label: 'Market / trading centre',
  },
  {
    id: 'housing.park',
    category: 'housing',
    emoji: '🌳',
    label: 'Urban park',
  },

  // AGRICULTURE & FOOD
  {
    id: 'agriculture.irrigation-scheme',
    category: 'agriculture',
    emoji: '🚜',
    label: 'Irrigation scheme',
  },
  {
    id: 'agriculture.greenhouse',
    category: 'agriculture',
    emoji: '🏡',
    label: 'Greenhouse',
  },
  {
    id: 'agriculture.veterinary',
    category: 'agriculture',
    emoji: '🐄',
    label: 'Vet centre',
  },
  {
    id: 'agriculture.aggregation-centre',
    category: 'agriculture',
    emoji: '📦',
    label: 'Aggregation / depot',
  },
  {
    id: 'agriculture.silo',
    category: 'agriculture',
    emoji: '🌾',
    label: 'Silo / grain store',
  },
  {
    id: 'agriculture.slaughterhouse',
    category: 'agriculture',
    emoji: '🥩',
    label: 'Abattoir / slaughterhouse',
  },

  // SECURITY & JUSTICE
  {
    id: 'security.police-station',
    category: 'security',
    emoji: '🚔',
    label: 'Police station',
  },
  {
    id: 'security.ap-camp',
    category: 'security',
    emoji: '🛡️',
    label: 'AP / security camp',
  },
  {
    id: 'security.court',
    category: 'security',
    emoji: '⚖️',
    label: 'Court',
  },
  {
    id: 'security.prison',
    category: 'security',
    emoji: '🏚️',
    label: 'Prison / remand',
  },
  {
    id: 'security.fire-station',
    category: 'security',
    emoji: '🚒',
    label: 'Fire station',
  },
  {
    id: 'security.checkpoint',
    category: 'security',
    emoji: '🚧',
    label: 'Roadblock / checkpoint',
  },

  // ENVIRONMENT & CLIMATE
  {
    id: 'environment.tree-planting',
    category: 'environment',
    emoji: '🌲',
    label: 'Tree planting site',
  },
  {
    id: 'environment.dump-site',
    category: 'environment',
    emoji: '🗑️',
    label: 'Dump / landfill',
  },
  {
    id: 'environment.park',
    category: 'environment',
    emoji: '🏞️',
    label: 'Protected area',
  },
  {
    id: 'environment.river-bank',
    category: 'environment',
    emoji: '🌊',
    label: 'River bank protection',
  },

  // ICT & DIGITAL
  {
    id: 'ict.lan',
    category: 'ict',
    emoji: '🖧',
    label: 'LAN / local network',
  },
  {
    id: 'ict.fiber',
    category: 'ict',
    emoji: '🧵',
    label: 'Fibre link',
  },
  {
    id: 'ict.digital-centre',
    category: 'ict',
    emoji: '💻',
    label: 'Digital hub',
  },
  {
    id: 'ict.mast',
    category: 'ict',
    emoji: '📡',
    label: 'Telecom mast',
  },

  // GOVT SERVICES
  {
    id: 'govt.county-office',
    category: 'govt',
    emoji: '🏢',
    label: 'County offices',
  },
  {
    id: 'govt.subcounty-office',
    category: 'govt',
    emoji: '🏬',
    label: 'Sub-county / ward office',
  },
  {
    id: 'govt.huduma-centre',
    category: 'govt',
    emoji: '🆔',
    label: 'Huduma / service centre',
  },
  {
    id: 'govt.land-office',
    category: 'govt',
    emoji: '🗺️',
    label: 'Lands & survey office',
  },
  {
    id: 'govt.revenue-office',
    category: 'govt',
    emoji: '💰',
    label: 'Revenue / licensing office',
  },
  {
    id: 'govt.community-hall',
    category: 'govt',
    emoji: '🏛️',
    label: 'Community hall',
  },

  // CUSTOM
  {
    id: 'custom.generic-point',
    category: 'custom',
    emoji: '📍',
    label: 'Generic point',
  },
  {
    id: 'custom.community-project',
    category: 'custom',
    emoji: '🤝',
    label: 'Community project',
  },
  {
    id: 'custom.pending-review',
    category: 'custom',
    emoji: '⏳',
    label: 'Pending review',
  },
];
