/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RegionInfo, CropDiseaseGuide, WeatherForecast } from "../types";

export const WEST_AFRICAN_REGIONS: RegionInfo[] = [
  {
    id: "south-nigeria",
    name: "Southern Nigeria (Humid Forest)",
    country: "Nigeria",
    climateZone: "Humid Tropical Forest",
    soilType: "Sandy Clay Loam / Ferralsols",
    typicalCrops: ["Cassava", "Yam", "Cocoa", "Plantain", "Maize"]
  },
  {
    id: "north-ghana",
    name: "Northern Ghana (Savannah)",
    country: "Ghana",
    climateZone: "Sudano-Sahelian Savannah",
    soilType: "Sandy Loams / Lixisols",
    typicalCrops: ["Cowpea", "Maize", "Groundnut", "Sorghum", "Millet"]
  },
  {
    id: "sw-nigeria",
    name: "Southwest Nigeria (Transition Zone)",
    country: "Nigeria",
    climateZone: "Derived Savannah Corridor",
    soilType: "Luvisols / Clayey Sand",
    typicalCrops: ["Cassava", "Yam", "Maize", "Cocoa"]
  },
  {
    id: "casamance-senegal",
    name: "Casamance Region",
    country: "Senegal",
    climateZone: "Sub-Guinean Forest-Savannah",
    soilType: "Gleysols / Alluvial Sand",
    typicalCrops: ["Rice", "Cashew", "Cassava", "Maize"]
  },
  {
    id: "ivory-coast",
    name: "South Ivory Coast (Forest belt)",
    country: "Ivory Coast",
    climateZone: "Equatorial Wet Rainforest",
    soilType: "Acrisols / Highly weathered loam",
    typicalCrops: ["Cocoa", "Plantain", "Yam", "Rubber"]
  }
];

export const WEST_AFRICAN_LANGUAGES = [
  { code: "en", name: "English", direction: "ltr", flag: "🌍" },
  { code: "fr", name: "Français (French)", direction: "ltr", flag: "🌍" },
  { code: "ha", name: "Hausa (Harshen Hausa)", direction: "ltr", flag: "🇳🇬" },
  { code: "yo", name: "Yoruba (Èdè Yorùbá)", direction: "ltr", flag: "🇳🇬" },
  { code: "ig", name: "Igbo (Asụsụ Igbo)", direction: "ltr", flag: "🇳🇬" },
  { code: "tw", name: "Akan / Twi (Kasa Twi)", direction: "ltr", flag: "🇬🇭" },
  { code: "wo", name: "Wolof (Kadd Wolof)", direction: "ltr", flag: "🇸🇳" },
  { code: "bm", name: "Bamanankan (Bambara)", direction: "ltr", flag: "🇲🇱" },
  { code: "ee", name: "Ewe (Èʋegbe)", direction: "ltr", flag: "🇹🇬" }
];

export const PRE_CACHED_DISEASES: CropDiseaseGuide[] = [
  {
    id: "cassava-mosaic",
    name: "Cassava Mosaic Disease (CMD)",
    symptoms: "Yellow mosaic patterns on leaves, leaf distortion, crumpled leaflets, and severe stunting of the plant stalks.",
    prevention: "Plant resistant cultivars (e.g., TMS series), utilize clean disease-free stem cuttings, and control whitefly populations.",
    treatment: "No direct chemical cure. Rogue (pull out and burn) infected young plants immediately to limit spread.",
    organicRemedy: "Spray neem tree leaf extracts (boiled neem solution) to suppress whitefly vectors naturally."
  },
  {
    id: "maize-fall-armyworm",
    name: "Fall Armyworm Damage",
    symptoms: "Ragged papery holes in central maize leaves, heavy crumbly sawdust-like yellow-brown frass inside the crop whorl.",
    prevention: "Intercrop maize with leguminous species (Desmodium, Cowpea). Implement early crop scouting. Rotate crops.",
    treatment: "Handpick larvae early in the morning. For severe cases, localized applications of bio-pesticides.",
    organicRemedy: "Apply fresh neem oil extract or biological Bacillus thuringiensis (Bt) solution inside the leaf whorl."
  },
  {
    id: "cocoa-black-pod",
    name: "Cocoa Black Pod (Phytophthora)",
    symptoms: "Dark brown necrotic spots expanding rapidly into velvety black fungal fur across the entire pod capsule, eventually rotting beans.",
    prevention: "Maintain regular pruning to increase air circulation, remove weeds to reduce shade humidity, and use disease-free tools.",
    treatment: "Remove infected pods early. Apply copper-based organic fungicides before the peak wet season.",
    organicRemedy: "Apply wood ash paste on stems, discard rotten pods far away, and use Trichoderma biological antagonists."
  },
  {
    id: "yam-anthracnose",
    name: "Yam Anthracnose Disease",
    symptoms: "Black lesions surrounded by yellow halos on yam leaves, followed by rapid dark vine dieback, resembling scorched earth.",
    prevention: "Plant resistant water-yam cultivars, treat tubers with charcoal powder before planting, and avoid waterlogging.",
    treatment: "Prune affected leaves immediately. Avoid crop injuries where spores multiply.",
    organicRemedy: "Foliar spray of diluted wood ash mixed with cow urine, or copper soap mixtures to suppress fungal breeding."
  }
];

export const CROP_PROFILES = [
  {
    name: "Cassava",
    optimalRainfall: "1000mm - 1500mm",
    soilPh: "5.5 - 6.5",
    maturityPeriod: "9 - 12 Months",
    iconName: "Sprout",
    description: "Extremely drought-resistant staple crop grown for starch-rich roots. Thrives in sandy clay."
  },
  {
    name: "Maize",
    optimalRainfall: "600mm - 1200mm",
    soilPh: "6.0 - 7.0",
    maturityPeriod: "3 - 4 Months",
    iconName: "Wheat",
    description: "Essential cereal grain requiring medium rainfall and rich soil nutrients. Highly sensitive to timing."
  },
  {
    name: "Yam",
    optimalRainfall: "1200mm - 1800mm",
    soilPh: "5.5 - 6.5",
    maturityPeriod: "7 - 9 Months",
    iconName: "Potato",
    description: "Premium tuber cultivating stake support. Culturally significant, requires deep, loose soils with high compost."
  },
  {
    name: "Cocoa",
    optimalRainfall: "1500mm - 2000mm",
    soilPh: "5.0 - 7.5",
    maturityPeriod: "3 - 5 Years to maturity",
    iconName: "Apple",
    description: "Perennial orchard cash crop. Prefers warm humid shadow valleys, sensitive to high wind or sudden dry periods."
  },
  {
    name: "Cowpea",
    optimalRainfall: "300mm - 700mm",
    soilPh: "6.0 - 7.5",
    maturityPeriod: "2 - 3 Months",
    iconName: "Leaf",
    description: "Highly versatile localized legume. Improves soil nitrogen levels, extremely drought resilient."
  }
];

export const MOCK_WEATHER_ALERTS: { [key: string]: WeatherForecast[] } = {
  "south-nigeria": [
    {
      month: "June (Current Month)",
      tempRange: "24°C - 30°C",
      rainfallStatus: "Wet Season",
      advisory: "Peak Rainfall. Great for planting plantain and root crops. Keep drainage channels open to avoid waterlogging and cassava rot.",
      hazardRisk: "Medium",
      hazardDetail: "Heavy flash floods during rain peaks. Fungal spore growth likely in tomato or cocoa farms."
    },
    {
      month: "July",
      tempRange: "23°C - 29°C",
      rainfallStatus: "Short Dry Spell",
      advisory: "Short dry season (August break precursors). Ideal for weeding, fertilizer top-dressing, and harvesting early-season maize crops.",
      hazardRisk: "Low"
    }
  ],
  "north-ghana": [
    {
      month: "June (Current Month)",
      tempRange: "28°C - 34°C",
      rainfallStatus: "Wet Season",
      advisory: "Rainy season starts. Best time to plant drought-resistant Maize varieties, Groundnuts, and Cowpeas. Apply organic manure beforehand.",
      hazardRisk: "Low"
    },
    {
      month: "July",
      tempRange: "26°C - 32°C",
      rainfallStatus: "Wet Season",
      advisory: "Sustained rains. Ensure proper row spacing for Sorghum. Watch for striga weed and pull out manual roots promptly.",
      hazardRisk: "Medium",
      hazardDetail: "Sudden heavy winds might lodge immature high-height corn. Ensure soil banking around root collars."
    }
  ],
  "sw-nigeria": [
    {
      month: "June (Current Month)",
      tempRange: "25°C - 31°C",
      rainfallStatus: "Wet Season",
      advisory: "Intense moisture. Excellent conditions for staking yams and mounding cassavas. Avoid waterlogging around root mounds.",
      hazardRisk: "Low"
    },
    {
      month: "July",
      tempRange: "24°C - 29°C",
      rainfallStatus: "Wet Season",
      advisory: "High precipitation. Ideal for top-dressing maize, weeding, and checking cocoa pods for early-stage black pod symptoms.",
      hazardRisk: "Medium",
      hazardDetail: "High fungal spore activity on leaves. Avoid dense planting layouts."
    }
  ],
  "casamance-senegal": [
    {
      month: "June (Current Month)",
      tempRange: "27°C - 33°C",
      rainfallStatus: "Harmattan",
      advisory: "Ending dry spell. Prepare rice beds and clean community nursery bunds before intense rainfalls begin.",
      hazardRisk: "Low"
    },
    {
      month: "July",
      tempRange: "26°C - 31°C",
      rainfallStatus: "Wet Season",
      advisory: "Strong rains commence. Sow rice in prepared nursery beds. Monitor cashew trees for stem borer larvae.",
      hazardRisk: "Medium",
      hazardDetail: "Water logging in low-lying alluvial basins. Ensure nursery drainage paths."
    }
  ],
  "ivory-coast": [
    {
      month: "June (Current Month)",
      tempRange: "24°C - 29°C",
      rainfallStatus: "Wet Season",
      advisory: "Heaviest rainfall peaks. Cocoa tree care: keep undergrowth clear to decrease moisture retention and prevent black pod fungus spore maturation.",
      hazardRisk: "High",
      hazardDetail: "Black Pod warning! Harvest near-ripe pods immediately. Spray biological Trichoderma copper alternative helper."
    },
    {
      month: "July",
      tempRange: "23°C - 28°C",
      rainfallStatus: "Short Dry Spell",
      advisory: "Transitioning to lighter rains. Clean dead foliage, inspect rubber stands for latex collection channels, and prune cocoa fan branches.",
      hazardRisk: "Low"
    }
  ]
};

export const OFFLINE_AGRICULTURAL_GUIDEBOOKS = [
  {
    title: "Eco-Friendly Organic Cassava Cultivation",
    category: "Root Crops",
    description: "Comprehensive guide on selecting TMS resistant cuttings, mounding layouts, and natural insect controls (neem decoction) for humid zones.",
    fileSize: "1.2 MB",
    downloaded: true,
    chapters: [
      { num: "01", name: "Selecting healthy CMD-resistant stem cuttings", detail: "Avoid stems with twisted, mottled, or small curled leaves. Choose stems 8 - 18 months old from virus-free zones." },
      { num: "02", name: "Soil preparation and ridging", detail: "Create ridges or mounds spaced 1m x 1m. Ridging concentrates organic compost directly around tuber expand zones." },
      { num: "03", name: "Controlling Whitefly vectors naturally", detail: "Boil 1kg of fresh crushed neem tree leaves in 5L of water. Dilute this solution 1:5 with pure water and spray weekly." }
    ]
  },
  {
    title: "Maize Fall Armyworm Organic Mitigation Protocol",
    category: "Pests & Disease",
    description: "Step-by-step instructions for early scouting, biological pest disruption (Bt), intercropping repellents, and physical trap setups.",
    fileSize: "840 KB",
    downloaded: true,
    chapters: [
      { num: "01", name: "Early visual scouting techniques", detail: "Examine 20 plants per row. Look for small pinholes and crumbly brown dust-frass in corn whorls starting at week 3." },
      { num: "02", name: "The 'Push-Pull' habitat strategy", detail: "Plant Desmodium legumes inside corn rows to repel moths (Push), while planting Napier Grass on borders to attract/trap moths (Pull)." },
      { num: "03", name: "Low-cost soap and ash leaf applications", detail: "Spoonfuls of fine clean wood ash applied inside whorls physically suffocates armyworms and prevents leaf boring." }
    ]
  },
  {
    title: "Organic Cocoa Black Pod Suppression Guide",
    category: "Orchards / Cocoa",
    description: "Practical canopy thinning strategies, cocoa field hygiene guidelines, and Trichoderma biological control preparation.",
    fileSize: "1.5 MB",
    downloaded: false,
    chapters: [
      { num: "01", name: "Canopy and light levels balance", detail: "Pruning water shoots ensures sun rays penetrate the soil floor. Dry ground reduces pathogen germination by 80%." },
      { num: "02", name: "Mummified pod harvesting sanitation", detail: "Buried infected pods 2 feet deep away from active trees prevent wind-blown soil dust from carrying phytophthora spores." }
    ]
  },
  {
    title: "Fast-Maturing Cowpeas & Soil Fixation",
    category: "Legumes",
    description: "How to use cowpea rotation to restore degraded savannah soils, natural pod-borer controls, and grain post-harvest dry storage.",
    fileSize: "950 KB",
    downloaded: false,
    chapters: [
      { num: "01", name: "Rhizobium inoculation & dynamic rotation", detail: "Alternating cowpea with demanding maize crops naturally infuses over 40kg of soil nitrogen per hectare entirely free." }
    ]
  }
];
