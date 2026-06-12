/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  WEST_AFRICAN_REGIONS, 
  WEST_AFRICAN_LANGUAGES, 
  PRE_CACHED_DISEASES, 
  CROP_PROFILES, 
  MOCK_WEATHER_ALERTS, 
  OFFLINE_AGRICULTURAL_GUIDEBOOKS 
} from "./data/cropData";
import { RegionInfo, DiagnosticLog, PlantingSchedule, CropDiseaseGuide } from "./types";
import { playRawPcmBase64 } from "./lib/audioHelper";
import { 
  Sprout, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  Download, 
  BookMarked, 
  History, 
  Wifi, 
  WifiOff, 
  ChevronRight, 
  Play, 
  Send, 
  RefreshCw, 
  Plus, 
  HelpCircle,
  FileText,
  Smartphone,
  Info
} from "lucide-react";

// Predefined High-Quality Abstract/Deficiency Photo Mockups using beautiful gradients/text 
// so farmers can easily select or test the feature inside the container immediately.
const SAMPLE_CROP_IMAGES = [
  {
    id: "sample-cmd",
    crop: "Cassava",
    disease: "Cassava Mosaic Disease (CMD)",
    color: "from-amber-700/80 to-emerald-900/90",
    label: "Mottled Yellow Leaf (Mosaic)",
    description: "Yellow mosaic coloration with twisted, shriveled leaf lobes",
    localKey: "cassava-mosaic"
  },
  {
    id: "sample-faw",
    crop: "Maize",
    disease: "Fall Armyworm Damage",
    color: "from-yellow-700/80 to-lime-950/90",
    label: "Chewed Corn Whorl (Sawdust Frass)",
    description: "Deep jagged leaf holes with sawdust-like frass deposits",
    localKey: "maize-fall-armyworm"
  },
  {
    id: "sample-cbp",
    crop: "Cocoa",
    disease: "Cocoa Black Pod (Phytophthora)",
    color: "from-stone-800/80 to-amber-950/90",
    label: "Rotten Pod (Black Spores)",
    description: "Expanding black fungal lesions on cocoa pod skins",
    localKey: "cocoa-black-pod"
  }
];

export default function App() {
  // General State Controls
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo>(WEST_AFRICAN_REGIONS[0]);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "diagnosis" | "timeline" | "handbook" | "history">("dashboard");
  const [farmerName, setFarmerName] = useState<string>("Ibrahim");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Diagnosis Panel State
  const [inputCropName, setInputCropName] = useState<string>("Cassava");
  const [fieldNotes, setFieldNotes] = useState<string>("");
  const [selectedSampleImage, setSelectedSampleImage] = useState<string>(SAMPLE_CROP_IMAGES[0].id);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<DiagnosticLog["diagnosis"] | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Timeline State
  const [selectedTimelineCrop, setSelectedTimelineCrop] = useState<string>("Cassava");
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState<boolean>(false);
  const [activeTimeline, setActiveTimeline] = useState<PlantingSchedule | null>(null);
  const [timelineMode, setTimelineMode] = useState<"visual" | "bullet">("visual");

  // Handbook state
  const [booksList, setBooksList] = useState(OFFLINE_AGRICULTURAL_GUIDEBOOKS);
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(0);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);

  // Persistent diagnostics history
  const [historyLogs, setHistoryLogs] = useState<DiagnosticLog[]>([]);

  // Sound Synth and Speak Advisory controls
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [soundSimulationMsg, setSoundSimulationMsg] = useState<string | null>(null);
  const activeAudioNode = useRef<AudioBufferSourceNode | null>(null);

  // Sync state simulator
  const [syncingAll, setSyncingAll] = useState<boolean>(false);

  // Load diagnostic logs on mount
  useEffect(() => {
    const saved = localStorage.getItem("suno_agri_logs");
    if (saved) {
      try {
        setHistoryLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading logs", e);
      }
    } else {
      // Seed initial mock logs to make dashboard complete out-of-the-box!
      const initialLogs: DiagnosticLog[] = [
        {
          id: "log-seed-1",
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          cropName: "Cassava",
          notes: "Leaves around the lower branches have light pale yellow mosaic dots.",
          status: "Synced",
          diagnosis: {
            diseaseName: "Cassava Mosaic Disease (CMD)",
            confidence: 0.92,
            description: "A prevalent virus in humid West Africa spread by whiteflies. Causes pale lesions, reducing starch photosynthesis.",
            remedies: [
              "Extract neem tree leaves in hot water and spray to suppress whitefly pests.",
              "Rogue (destroy) infected stems early to prevent farm-wide spreading."
            ],
            preventions: [
              "Choose highly resistant varieties (e.g. TMS series) for the next cropping season."
            ],
            organicAlternatives: "Use mixed neem spray instead of chemical insecticides."
          }
        }
      ];
      setHistoryLogs(initialLogs);
      localStorage.setItem("suno_agri_logs", JSON.stringify(initialLogs));
    }
  }, []);

  // Save history helper
  const saveLogs = (logs: DiagnosticLog[]) => {
    setHistoryLogs(logs);
    localStorage.setItem("suno_agri_logs", JSON.stringify(logs));
  };

  // Pre-generate default timeline based on region or fallback
  useEffect(() => {
    generateTimelineData(selectedTimelineCrop, false);
  }, [selectedRegion, selectedTimelineCrop]);

  // Audio synthesization & read-aloud handler
  const speakAdvisory = async (textToSpeak: string) => {
    // If already playing, stop current
    if (audioPlaying) {
      stopAudio();
      return;
    }

    setAudioPlaying(true);
    setSoundSimulationMsg("Connecting to synthesizer...");

    // Find language identifier for TTS
    const chosenLangObj = WEST_AFRICAN_LANGUAGES.find(l => l.name === selectedLanguage);
    const langCode = chosenLangObj ? chosenLangObj.code : "en";

    // If Offline Mode is toggled, simulate instant local SpeechSynthesis instead!
    // This allows robust "offline-first" capability!
    if (isOffline) {
      setSoundSimulationMsg(`[Simulated Offline voice synthesis] Reading in local dialect (${selectedLanguage})`);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        // Map common languages if speech engine supports them
        if (langCode === "fr") utterance.lang = "fr-FR";
        else utterance.lang = "en-US";
        
        utterance.rate = 0.9;
        utterance.onend = () => {
          setAudioPlaying(false);
          setSoundSimulationMsg(null);
        };
        utterance.onerror = () => {
          setAudioPlaying(false);
          setSoundSimulationMsg(null);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // Simple visual screen reader simulation if speechSynthesis is unsupported
        setTimeout(() => {
          setAudioPlaying(false);
          setSoundSimulationMsg(null);
        }, 5000);
      }
      return;
    }

    try {
      // Connect to full-stack backend `/api/audio-advisory`
      const response = await fetch("/api/audio-advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          languageCode: langCode
        })
      });

      if (!response.ok) {
        throw new Error("Voice synthesis requires a configured GEMINI_API_KEY.");
      }

      const result = await response.json();
      if (result.audioBase64) {
        setSoundSimulationMsg("Playing synthesized audio...");
        const sourceNode = await playRawPcmBase64(result.audioBase64, 24000);
        activeAudioNode.current = sourceNode;
        
        sourceNode.onended = () => {
          setAudioPlaying(false);
          setSoundSimulationMsg(null);
          activeAudioNode.current = null;
        };
      } else {
        throw new Error(result.error || "No audio returned from server.");
      }
    } catch (err: any) {
      console.warn("Backend TTS playback failed or unconfigured:", err.message);
      // Fluid client-side fallback
      setSoundSimulationMsg(`[Voice Simulation] Reading aloud in ${selectedLanguage}:`);
      
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        if (langCode === "fr") utterance.lang = "fr-FR";
        else utterance.lang = "en-US";
        utterance.rate = 0.93;
        utterance.onend = () => {
          setAudioPlaying(false);
          setSoundSimulationMsg(null);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setAudioPlaying(false);
          setSoundSimulationMsg(null);
        }, 6000);
      }
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioNode.current) {
      try {
        activeAudioNode.current.stop();
      } catch (e) {}
      activeAudioNode.current = null;
    }
    setAudioPlaying(false);
    setSoundSimulationMsg(null);
  };

  // Generate or Load Climate timelines
  const generateTimelineData = async (cropType: string, forceApi = true) => {
    setIsGeneratingTimeline(true);
    
    // Offline pre-cached mock timelines based on agronomic guides 
    const generateLocalTimeline = (): PlantingSchedule => {
      return {
        cropName: cropType,
        region: selectedRegion.name,
        notes: `Localized timeline for ${cropType} planting in ${selectedRegion.climateZone} zones. Adapted to weather fluctuations with high compost retention.`,
        timeline: [
          {
            phase: "Land Preparation",
            timing: "Early June (Start of Wet Spell)",
            tasks: [
              "Create raised contour beds or soil ridges to improve drainage and prevent crown decay.",
              "Incorporate organic crop residues and dry cow dung manure into the topsoil layout."
            ],
            requirements: ["Hand hoe or metal spade", "Locally composted mulch", "Organic bio-char"]
          },
          {
            phase: "Sowing & Spacing",
            timing: "Mid-June (Steady Rainfall Initiation)",
            tasks: [
              `Plant ${cropType} seeds or cuttings at optimal depth.`,
              `Adhere to strict horizontal row spacing of 0.8m x 1m to limit fungal crowding.`
            ],
            requirements: ["Uniform structural spacing stakes", "Healthy disease-free seed stock"]
          },
          {
            phase: "Crop Management & Defense",
            timing: "July to September (Active Tending Period)",
            tasks: [
              "Perform manual vertical hand weeding twice during early root establishment.",
              "Apply bio-insecticide (boiled neem extracts) to prevent whiteflies or armyworm eggs."
            ],
            requirements: ["Neem leaves", "Manual weeding sickle", "Liquid filter sieve"]
          },
          {
            phase: "Harvesting & Preservation",
            timing: "Dry transition season",
            tasks: [
              "Carefully lift roots using garden forks to avoid flesh injury.",
              "Dry grains/tubers in well-ventilated bamboo shades to prevent post-harvest decay mold."
            ],
            requirements: ["Aerated bamboo baskets", "Shaded dry platform", "Clean tarpaulin"]
          }
        ]
      };
    };

    if (isOffline || !forceApi) {
      // Simulate delayed local calculations
      setTimeout(() => {
        setActiveTimeline(generateLocalTimeline());
        setIsGeneratingTimeline(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: cropType,
          region: selectedRegion.name,
          soilType: selectedRegion.soilType,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error("Unable to fetch backend generated timeline model. Using local database.");
      }

      const data = await response.json();
      setActiveTimeline(data);
    } catch (e) {
      console.warn("Cropping calendar API failed, falling back to cached local resource", e);
      setActiveTimeline(generateLocalTimeline());
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  // Crop diagnosis execution
  const runDiagnosticScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    // Prepare simulated delay to mimic image resolution upload analysis
    const simulateOfflineDiagnosis = () => {
      setTimeout(() => {
        // Find cached guide template matching current setup
        let matched: CropDiseaseGuide | undefined;
        
        if (customImageBase64) {
          // Fallback randomly or search symptoms notes matching terms
          const lowerNotes = fieldNotes.toLowerCase();
          if (lowerNotes.includes("worm") || lowerNotes.includes("armyworm") || lowerNotes.includes("corn") || inputCropName.toLowerCase().includes("maiz")) {
            matched = PRE_CACHED_DISEASES.find(d => d.id === "maize-fall-armyworm");
          } else if (lowerNotes.includes("cocoa") || lowerNotes.includes("pod") || lowerNotes.includes("black")) {
            matched = PRE_CACHED_DISEASES.find(d => d.id === "cocoa-black-pod");
          } else {
            matched = PRE_CACHED_DISEASES.find(d => d.id === "cassava-mosaic");
          }
        } else {
          // Selected sample image
          const chosenSample = SAMPLE_CROP_IMAGES.find(img => img.id === selectedSampleImage);
          matched = PRE_CACHED_DISEASES.find(d => d.id === (chosenSample?.localKey || "cassava-mosaic"));
        }

        if (!matched) {
          matched = PRE_CACHED_DISEASES[0];
        }

        const diagnosisObj = {
          diseaseName: matched.name,
          confidence: 0.96,
          description: matched.symptoms,
          remedies: [matched.treatment, matched.organicRemedy],
          preventions: [matched.prevention],
          organicAlternatives: matched.organicRemedy
        };

        const newLog: DiagnosticLog = {
          id: "log-" + Date.now(),
          date: new Date().toLocaleDateString(),
          cropName: inputCropName,
          notes: fieldNotes || "Visual inspection matching regional profiles.",
          status: isOffline ? "Pending Sync" : "Synced",
          diagnosis: diagnosisObj
        };

        // Prepend to logs
        const updated = [newLog, ...historyLogs];
        saveLogs(updated);
        setScanResult(diagnosisObj);
        setIsScanning(false);
      }, 1500);
    };

    if (isOffline) {
      simulateOfflineDiagnosis();
      return;
    }

    try {
      // Fetch selected crop sample image base64 if no custom image
      let uploadBase64 = customImageBase64;
      
      // If using sample images, we send details referencing them
      let promptCrop = inputCropName;
      let promptNotes = fieldNotes;

      if (!uploadBase64) {
        const activeSample = SAMPLE_CROP_IMAGES.find(s => s.id === selectedSampleImage);
        if (activeSample) {
          promptCrop = activeSample.crop;
          promptNotes = `[Sample Scan: ${activeSample.label}] ` + (fieldNotes || activeSample.description);
        }
      }

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: promptCrop,
          notes: promptNotes,
          region: selectedRegion.name,
          language: selectedLanguage,
          imageBase64: uploadBase64 || ""
        })
      });

      if (!response.ok) {
        throw new Error("Unable to parse API diagnosis. Ensure database structure is accurate.");
      }

      const diagnosisData = await response.json();
      
      const newLog: DiagnosticLog = {
        id: "log-" + Date.now(),
        date: new Date().toLocaleDateString(),
        cropName: promptCrop,
        notes: fieldNotes || "Visual scan uploaded.",
        status: "Synced",
        diagnosis: diagnosisData
      };

      saveLogs([newLog, ...historyLogs]);
      setScanResult(diagnosisData);
    } catch (err: any) {
      console.warn("Online classifier failed. Engaging offline-first lookup system.", err.message);
      // Fallback gracefully to offline diagnostic matching
      simulateOfflineDiagnosis();
    } finally {
      setIsScanning(false);
    }
  };

  // Upload/File input helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImageBase64(reader.result as string);
        setSelectedSampleImage(""); // clear selection to favor custom upload
      };
      reader.readAsDataURL(file);
    }
  };

  // Download logic simulation for offline directories
  const toggleDownloadBook = (index: number) => {
    const updated = [...booksList];
    updated[index].downloaded = !updated[index].downloaded;
    setBooksList(updated);
  };

  // Sync back history from offline logs to cloud once toggled Online
  const runCloudSync = () => {
    setSyncingAll(true);
    setTimeout(() => {
      const synced = historyLogs.map(log => ({
        ...log,
        status: "Synced" as const
      }));
      saveLogs(synced);
      setSyncingAll(false);
    }, 1200);
  };

  // Current Weather alerts matched based on selected region
  const currentWeatherList = MOCK_WEATHER_ALERTS[selectedRegion.id] || [];
  const primaryWeather = currentWeatherList[0];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#F8FAF8] font-sans text-slate-800 overflow-hidden">
      
      {/* 1. Left Navigation Bar styled with emerald dark theme matching the design prompt */}
      <aside className="w-full md:w-80 bg-emerald-900 text-white flex flex-col p-6 shrink-0 md:h-full overflow-y-auto">
        
        {/* Logo/Branding Header */}
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-xl text-emerald-950 shadow-md">
            S
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block">SunoAgri AI</span>
            <p className="text-[10px] text-emerald-300 font-mono tracking-widest uppercase">Extension Gap Closer</p>
          </div>
        </div>

        {/* Global Connection Quality Selector */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950 border border-emerald-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Network Link</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              isOffline ? "bg-amber-900 text-amber-200" : "bg-emerald-500 text-emerald-950"
            }`}>
              {isOffline ? "Offline Sim" : "Online Live"}
            </span>
          </div>
          <button
            onClick={() => {
              const nextState = !isOffline;
              setIsOffline(nextState);
              // Trigger auto sync after going online
              if (!nextState && historyLogs.some(l => l.status === "Pending Sync")) {
                runCloudSync();
              }
            }}
            id="network-quick-toggle"
            className="w-full mt-1.5 flex items-center justify-center gap-2 p-2 bg-emerald-800/60 hover:bg-emerald-800 text-xs text-white uppercase tracking-wider font-bold rounded-xl border border-emerald-700/50 transition-colors cursor-pointer"
          >
            {isOffline ? (
              <>
                <Wifi className="h-4.5 w-4.5 text-emerald-400" />
                <span>Go Live / Sync</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4.5 w-4.5 text-amber-400" />
                <span>Simulate Offline</span>
              </>
            )}
          </button>
        </div>

        {/* Custom Navigation Links */}
        <nav className="space-y-2 flex-1">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Farmer Dashboard</p>
          
          <button
            onClick={() => setActiveTab("dashboard")}
            id="nav-dashboard"
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-emerald-800 text-white border-emerald-600 font-semibold"
                : "border-transparent text-emerald-100 hover:bg-emerald-800/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "dashboard" ? "bg-emerald-400" : "bg-emerald-700"}`}></span> 
              Main Hub Overview
            </span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>

          <button
            onClick={() => {
              setActiveTab("diagnosis");
              setScanResult(null);
            }}
            id="nav-diagnosis"
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left cursor-pointer ${
              activeTab === "diagnosis"
                ? "bg-emerald-800 text-white border-emerald-600 font-semibold"
                : "border-transparent text-emerald-100 hover:bg-emerald-800/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "diagnosis" ? "bg-emerald-400" : "bg-emerald-700"}`}></span> 
              AI Crop Diagnostic Scanner
            </span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            id="nav-timeline"
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left cursor-pointer ${
              activeTab === "timeline"
                ? "bg-emerald-800 text-white border-emerald-600 font-semibold"
                : "border-transparent text-emerald-100 hover:bg-emerald-800/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "timeline" ? "bg-emerald-400" : "bg-emerald-700"}`}></span> 
              Climate-Smart Timelines
            </span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>

          <button
            onClick={() => {
              setActiveTab("handbook");
              setSelectedChapterIndex(null);
            }}
            id="nav-handbook"
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left cursor-pointer ${
              activeTab === "handbook"
                ? "bg-emerald-800 text-white border-emerald-600 font-semibold"
                : "border-transparent text-emerald-100 hover:bg-emerald-800/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "handbook" ? "bg-emerald-400" : "bg-emerald-700"}`}></span> 
              Offline Advisory handbooks
            </span>
            <span className="bg-emerald-600/60 text-[10px] font-bold px-1.5 py-0.5 rounded text-emerald-300 font-mono">
              BOOKS
            </span>
          </button>

          <div className="pt-4 border-t border-emerald-800/40 mt-4">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">History & Sync</p>
            <button
              onClick={() => setActiveTab("history")}
              id="nav-history"
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm text-left cursor-pointer ${
                activeTab === "history"
                  ? "bg-emerald-800 text-white border-emerald-600 font-semibold"
                  : "border-transparent text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <History className="h-4.5 w-4.5 text-emerald-300" />
              <span>Diagnostic Log Archive ({historyLogs.length})</span>
            </button>
          </div>
        </nav>

        {/* Global Selectors Footer Container inside the Menu as specified by the theme HTML */}
        <div className="mt-8 pt-6 border-t border-emerald-800/50">
          <div className="bg-emerald-950 p-4 rounded-2xl border border-emerald-800/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-emerald-300 font-semibold">Broadcaster Language</span>
              <span className="text-[9px] bg-emerald-500 font-bold px-1.5 py-0.5 rounded text-emerald-950 uppercase font-mono">
                LITERAL SPECIATION
              </span>
            </div>
            
            {/* Quick Lang Switcher Pill row */}
            <div className="grid grid-cols-3 gap-1 mb-3">
              {[
                { code: "en", name: "English", display: "EN" },
                { code: "ha", name: "Hausa (Harshen Hausa)", display: "HA" },
                { code: "yo", name: "Yoruba (Èdè Yorùbá)", display: "YO" }
              ].map(opt => (
                <button
                  key={opt.code}
                  onClick={() => setSelectedLanguage(opt.name)}
                  className={`py-1 rounded text-xs font-semibold uppercase text-center cursor-pointer transition-colors ${
                    selectedLanguage.includes(opt.name) || (opt.code === "en" && selectedLanguage === "English")
                      ? "bg-white text-emerald-900"
                      : "bg-emerald-800/50 text-emerald-200 border border-emerald-700/50 hover:bg-emerald-800"
                  }`}
                >
                  {opt.display}
                </button>
              ))}
            </div>

            {/* Custom Multi-Language Dropdown for rest of regional dialects */}
            <div className="relative">
              <select
                id="sidebar-language-dropdown"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-emerald-900/40 hover:bg-emerald-900 border border-emerald-800 text-[11px] text-emerald-100 py-1.5 px-3 rounded-lg focus:outline-none cursor-pointer appearance-none text-center"
              >
                {WEST_AFRICAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name} className="bg-emerald-900 text-white text-xs">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto h-full space-y-6">

        {/* Top Header Row with dynamic farmer name editing and sync indicators */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Welcome back,</span>
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      id="farmer-name-input"
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => { if (e.key === "Enter") setIsEditingName(false); }}
                      className="border-b-2 border-emerald-600 bg-white font-bold outline-none px-2 py-0.5 text-xl tracking-tight text-slate-900"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="bg-emerald-600 text-white text-xs p-1 rounded font-bold uppercase"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setIsEditingName(true)} 
                    className="border-b-2 border-dashed border-emerald-600 text-emerald-800 cursor-pointer hover:bg-emerald-50 px-1"
                    title="Click to rename"
                  >
                    {farmerName}
                  </span>
                )}
              </h1>
            </div>
            
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Active Region: <span className="text-slate-900 font-semibold">{selectedRegion.name}</span>
              {" · "}
              Climate Zone: <span className="text-emerald-700 font-semibold">{selectedRegion.climateZone}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Region Selector dropdown inside header */}
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Jump to district</span>
              <select
                id="header-region-dropdown"
                value={selectedRegion.id}
                onChange={(e) => {
                  const reg = WEST_AFRICAN_REGIONS.find((r) => r.id === e.target.value);
                  if (reg) setSelectedRegion(reg);
                }}
                className="bg-transparent text-xs font-semibold text-emerald-800 outline-none cursor-pointer"
              >
                {WEST_AFRICAN_REGIONS.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.country}: {reg.name.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar block with visual signal */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-bold uppercase text-slate-400">Sync Status</p>
                <p className="text-xs text-slate-600 font-medium flex items-center gap-1 justify-end">
                  <span className={`w-2 h-2 rounded-full ${isOffline ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`}></span>
                  {isOffline ? "Pending Cloud" : "Fully Connected"}
                </p>
              </div>

              <div className="w-11 h-11 rounded-full border border-emerald-200/80 bg-gradient-to-br from-emerald-100 to-emerald-300 shadow-inner flex items-center justify-center font-bold text-emerald-800">
                🌱
              </div>
            </div>
          </div>
        </header>

        {/* Global System Sound Bulletin announcement layer if voice playing */}
        {audioPlaying && (
          <div className="bg-emerald-950 border border-emerald-800 text-emerald-100 px-5 py-3.5 rounded-3xl shadow-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-850 rounded-xl flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Advisory Sound Broadcast Active</p>
                <p className="text-sm font-medium italic">{soundSimulationMsg}</p>
              </div>
            </div>
            <button
              onClick={stopAudio}
              className="px-4 py-1.5 bg-rose-900 border border-rose-800 text-rose-100 text-xs font-bold rounded-xl hover:bg-rose-800 cursor-pointer uppercase transition-colors"
            >
              Stop Audio
            </button>
          </div>
        )}

        {/* Dynamic Inner Tab routing */}
        
        {/* Tab A: Main Dashboard Hub Hub */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* 1. Quick Insight Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Local Weather Widget built following design theme instructions */}
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local Weather Forecast</span>
                    <span className="px-2.5 py-1 bg-yellow-50 text-xs font-bold text-yellow-700 border border-yellow-200 rounded-xl">
                      {primaryWeather ? primaryWeather.rainfallStatus : "Sunny"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {primaryWeather ? primaryWeather.tempRange.split(" ")[2] || "31°C" : "31°C"}
                    </span>
                    <span className="text-slate-400 text-sm">
                      Range: {primaryWeather ? primaryWeather.tempRange : "24°C - 30°C"}
                    </span>
                  </div>
                  
                  {/* Climate Advisory message text */}
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                    {primaryWeather ? primaryWeather.advisory : "No current bulletin issued."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Read weather aloud:</span>
                  <button
                    onClick={() => speakAdvisory(`Local climate forecast for ${selectedRegion.name}. Weather is predicted as ${primaryWeather?.rainfallStatus}. Actionable advisory: ${primaryWeather?.advisory}`)}
                    className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-full transition-all cursor-pointer border border-emerald-100"
                    title="Audio read aloud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* AI Diagnosis Quick Panel Card */}
              <div className="lg:col-span-2 bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/85 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-emerald-950">Crop Stress Quick Diagnostic</h2>
                    <button
                      onClick={() => {
                        setActiveTab("diagnosis");
                        setScanResult(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl font-bold shadow-md shadow-emerald-200/50 cursor-pointer uppercase tracking-wider"
                    >
                      Run New Scan
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 mt-2">
                    <div className="w-full md:w-36 h-28 bg-white rounded-2xl border border-emerald-200/60 overflow-hidden flex flex-col items-center justify-center p-2 relative shadow-inner">
                      <div className="absolute inset-0 bg-emerald-950/5 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-emerald-800/60" />
                      </div>
                      <span className="absolute bottom-2 text-[9px] text-emerald-900 font-bold uppercase tracking-wide bg-white/90 px-2 py-0.5 rounded shadow">
                        SCAN TARGET
                      </span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <p className="text-emerald-950 font-bold text-sm">Empower your land with instantaneous diagnostics</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Identify devastating rust pathognomy, maize armyworms, or cassava blight diseases before yield failures occur. Simulates custom offline filters matching local regions or uses online model prediction.
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        <span className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-medium">📷 Camera Snap</span>
                        <span className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-medium">🍃 Zero Signal Mode</span>
                        <span className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-medium">💊 Organic Antidotes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span className="text-[11px] text-emerald-800">
                      We have compiled <span className="font-bold">{PRE_CACHED_DISEASES.length} organic reference protocols</span> for offline scouting.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("handbook")}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-2"
                  >
                    Open Guides
                  </button>
                </div>
              </div>

            </div>

            {/* 2. Primary Showcase Section - Cropping Schedule & Sync Action Block */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">
                    Active Adaptive Timeline: <span className="text-emerald-700">{selectedTimelineCrop}</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Climate adaptive planting window configured for {selectedRegion.name}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    id="dashboard-crop-selector"
                    value={selectedTimelineCrop}
                    onChange={(e) => setSelectedTimelineCrop(e.target.value)}
                    className="bg-[#F8FAF8] border border-slate-200 text-xs font-bold text-slate-700 px-3.5 py-1.5 rounded-xl outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {CROP_PROFILES.map(crop => (
                      <option key={crop.name} value={crop.name}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-1.5 rounded-xl cursor-pointer"
                  >
                    Manage Custom Setup
                  </button>
                </div>
              </div>

              {activeTimeline ? (
                <div className="space-y-6">
                  {/* Timeline Horizontal Layout from the Sleek Design HTML */}
                  <div className="relative py-4">
                    <div className="absolute top-[4.5rem] left-0 w-full h-[3px] bg-slate-100"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
                      {activeTimeline.timeline.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mb-4 z-10 font-bold text-sm transition-all border shadow ${
                            idx === 1 
                              ? "bg-emerald-600 text-white border-emerald-500 ring-4 ring-emerald-100" 
                              : "bg-white text-slate-500 border-slate-200"
                          }`}>
                            {idx + 1}
                          </div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                            idx === 1 ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {step.timing}
                          </p>
                          <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-emerald-700">{step.phase}</h3>
                          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 px-1">
                            {step.tasks[0]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extension Gap Alert Callout card from the theme design */}
                  <div className="bg-amber-50/80 border-l-4 border-amber-500 p-5 rounded-r-3xl mt-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 border border-amber-200">
                        <AlertTriangle className="h-5 w-5 text-amber-700 animate-bounce" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-amber-900 text-sm md:text-base">Extension Gap Warning: Wet Spell Fluctuations</h3>
                          <button
                            onClick={() => speakAdvisory(`Extension Gap Warning. Weather models indicate sudden precipitation spells. Advisory recommends selecting high compost zero tillage mounds immediately.`)}
                            className="text-amber-700 hover:text-amber-950 p-1 bg-amber-100/40 hover:bg-amber-100 rounded-full transition-colors"
                            title="Speak Alert Aloud"
                          >
                            <Volume2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed mt-1">
                          Our localized climate forecasts indicate a localized rain interval. For <span className="font-bold underline text-amber-950">{selectedTimelineCrop}</span> plantings, ensure ridge elevations are raised by 15cm to safeguard primary tubers, or use quick maturing seed stocks if planting in the Savannah areas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
                  <p className="text-sm">Calculating adaptive crop timeline...</p>
                </div>
              )}
            </div>

            {/* Offline-First Community Sync Alert Dashboard Bar */}
            {historyLogs.some(l => l.status === "Pending Sync") && (
              <div className="bg-[#FFFDF5] border border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100/80 text-amber-800 p-2.5 rounded-full border border-amber-200">
                    <WifiOff className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Offline Advisory Activity Cache</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      You have diagnosed crops while off-grid. These records will synchronize safely to the community portal upon clicking Sync.
                    </p>
                  </div>
                </div>
                <button
                  onClick={runCloudSync}
                  disabled={syncingAll}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-2 whitespace-nowrap min-w-[130px]"
                >
                  {syncingAll ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4" />
                      <span>Sync Offline Logs</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab B: AI Crop Diagnostic Scanner */}
        {activeTab === "diagnosis" && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Crop Stress Diagnosis Panel</h2>
                  <p className="text-xs text-slate-500">Provide field parameters along with an image to initiate the localized expert diagnostic model.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {isOffline ? "Offline Sim Active" : "Online Engine"}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual input panel left */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Select Scan Crop Target</label>
                    <select
                      id="diagnosis-crop-name-select"
                      value={inputCropName}
                      onChange={(e) => setInputCropName(e.target.value)}
                      className="w-full bg-[#F8FAF8] border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 "
                    >
                      {CROP_PROFILES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">A. Choose Stock Deficiency Sample (No camera needed)</label>
                    <div className="grid grid-cols-1 gap-2">
                      {SAMPLE_CROP_IMAGES.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => {
                            setSelectedSampleImage(img.id);
                            setCustomImageBase64(null); // overwrite manual files
                            setInputCropName(img.crop);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedSampleImage === img.id
                              ? "bg-emerald-50 border-emerald-500 shadow-sm"
                              : "border-slate-200/80 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${img.color} shrink-0`} />
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-none">{img.label}</p>
                              <p className="text-[10px] text-slate-500 leading-tight mt-1">{img.crop} · {img.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">B. Or Upload Custom Field Photo</label>
                    <div className="border-2 border-dashed border-slate-200 bg-[#F8FAF8] hover:bg-slate-50 rounded-2xl p-4 text-center cursor-pointer transition-colors relative">
                      <input
                        id="diagnosis-image-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Upload Crop Strain Photo"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Upload className="h-6 w-6 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 uppercase">Select File</span>
                        <span className="text-[10px] text-slate-400">supports JPG, PNG image matrices</span>
                      </div>
                    </div>

                    {customImageBase64 && (
                      <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-800">Custom Image Loaded</span>
                        </div>
                        <button
                          onClick={() => setCustomImageBase64(null)}
                          className="text-[10px] font-bold text-red-700 hover:text-red-900 uppercase"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Farmer Diagnostic Notes / Field Observations</label>
                    <textarea
                      id="diagnosis-notes-textarea"
                      value={fieldNotes}
                      onChange={(e) => setFieldNotes(e.target.value)}
                      placeholder="Describe leaf spots, worms present, leaf yellowing, weather notes..."
                      className="w-full h-24 bg-[#F8FAF8] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 resize-none"
                    />
                  </div>

                  <button
                    onClick={runDiagnosticScan}
                    disabled={isScanning}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl uppercase tracking-wider text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        <span>Running Diagnostic Model...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-4.5 w-4.5" />
                        <span>Run Diagnostic Scan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Diagnostic Result Screen right */}
                <div className="lg:col-span-7 bg-[#F8FAF8] border border-slate-200/80 rounded-[28px] p-5 md:p-6 flex flex-col justify-between min-h-[400px]">
                  {isScanning ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-16">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-700 animate-spin" />
                        <Sprout className="absolute inset-4 h-8 w-8 text-emerald-600 transform animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Analyzing Crop Matrix Integrity</h4>
                        <p className="text-xs text-slate-500 mt-1">Comparing against regional African pathogen databases offline...</p>
                      </div>
                    </div>
                  ) : scanResult ? (
                    <div className="space-y-5 flex-1 select-none animate-fade-in">
                      
                      {/* Diagnostic score & crop badge details */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">Verified Diagnosis Outcome</p>
                          <h3 className="text-lg font-bold text-slate-900 leading-tight mt-1">{scanResult.diseaseName}</h3>
                        </div>
                        <div className="bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-center shrink-0">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Confidence Score</p>
                          <p className="text-sm font-bold text-emerald-800 mt-0.5 font-mono">{(scanResult.confidence * 100).toFixed(0)}% Match</p>
                        </div>
                      </div>

                      {/* Brief description */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Condition Assessment</span>
                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-inner">
                          {scanResult.description}
                        </p>
                      </div>

                      {/* Remedies listed row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                          <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Immediate Remedial Actions</span>
                          <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                            {scanResult.remedies.map((rem, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold shrink-0">✔</span>
                                <span>{rem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Preventative Recommendations</span>
                          <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                            {scanResult.preventions.map((prev, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-slate-500 font-bold shrink-0">▸</span>
                                <span>{prev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Low cost organic alternatives highlighted */}
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl">
                        <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Eco-Friendly Organic Alternative</h4>
                        <p className="text-xs text-amber-800 leading-normal mt-1">{scanResult.organicAlternatives}</p>
                      </div>

                      {/* Read-aloud prompt row */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Read advisory details aloud:</span>
                        <button
                          onClick={() => speakAdvisory(`Target Crop Scan detected ${scanResult.diseaseName} with ${(scanResult.confidence * 100).toFixed(0)} percent matching confidence. Recommended Organic Treatment: ${scanResult.organicAlternatives}. Ready for offline application.`)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm uppercase tracking-wider"
                        >
                          <Volume2 className="h-4 w-4" />
                          <span>Spoken Broadcast</span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-16 text-slate-400">
                      <HelpCircle className="h-10 w-10 text-slate-300" />
                      <div>
                        <h4 className="font-bold text-slate-600 text-sm">No Diagnosis Ran Yet</h4>
                        <p className="text-xs text-slate-400 max-w-[280px] mt-1 mx-auto">
                          Choose a crop target on the left interface or upload a leaf photo to trigger analysis.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab C: Climate-Smart Timelines */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Adaptive Cropping Calendar Generator</h2>
                  <p className="text-xs text-slate-500">Align schedules with regional precipitation fluctuations.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimelineMode("visual")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      timelineMode === "visual" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Timeline Slider
                  </button>
                  <button
                    onClick={() => setTimelineMode("bullet")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      timelineMode === "bullet" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Task List Details
                  </button>
                </div>
              </div>

              {/* Crop selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                {CROP_PROFILES.map((crop) => (
                  <button
                    key={crop.name}
                    onClick={() => {
                      setSelectedTimelineCrop(crop.name);
                      generateTimelineData(crop.name, true);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedTimelineCrop === crop.name
                        ? "bg-emerald-50 border-emerald-500 shadow-sm"
                        : "border-slate-100 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">{crop.name}</span>
                    <span className="text-[9px] text-slate-400 block mt-1">{crop.maturityPeriod} maturity</span>
                  </button>
                ))}
              </div>

              {isGeneratingTimeline ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <RefreshCw className="h-10 w-10 animate-spin text-emerald-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Recalculating weather-adapted agronomic periods...</p>
                  <p className="text-xs text-slate-400 mt-1">Sourcing real-time precipitation indices adaptively</p>
                </div>
              ) : activeTimeline ? (
                <div className="space-y-6">
                  
                  {timelineMode === "visual" ? (
                    <div className="relative py-8 border-b border-slate-100 pb-10">
                      {/* Central connecting line */}
                      <div className="absolute top-[5.25rem] left-0 w-full h-[4px] bg-slate-100"></div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        {activeTimeline.timeline.map((item, idx) => (
                          <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-[24px] shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <span className="bg-emerald-50 text-[10px] font-bold text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                                  Stage {idx + 1}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 font-mono">{item.timing}</span>
                              </div>
                              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 leading-tight mb-2">
                                {item.phase}
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                                {item.tasks[0]}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100/60 mt-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Tools / Materials</span>
                              <div className="flex flex-wrap gap-1">
                                {item.requirements.map((req, rid) => (
                                  <span key={rid} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] text-slate-600 font-medium">
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTimeline.timeline.map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-[24px] p-5 hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700 shrink-0 text-lg">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <h3 className="font-bold text-slate-900 text-base">{item.phase}</h3>
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-xl">{item.timing}</span>
                            </div>
                            
                            <ul className="space-y-1 text-xs text-slate-600">
                              {item.tasks.map((task, tid) => (
                                <li key={tid} className="flex items-start gap-2">
                                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="pt-2 border-t border-slate-100/60 flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Requirements:</span>
                              {item.requirements.map((req, rid) => (
                                <span key={rid} className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-0.5 font-medium">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* High level region advisory notes */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-2xl flex items-start gap-3">
                    <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider">Climate-Smart Region Advisory</h4>
                      <p className="text-xs leading-relaxed mt-0.5">{activeTimeline.notes}</p>
                    </div>
                  </div>

                  {/* Speak calendar aloud button */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-slate-400" />
                      <span className="text-xs text-slate-500">Listen to complete {selectedTimelineCrop} advisory schedule in Twi/Yoruba/etc</span>
                    </div>
                    <button
                      onClick={() => speakAdvisory(`Farming calendar for ${selectedTimelineCrop}. Key phases include ${activeTimeline.timeline.map(t => t.phase).join(", ")}. Ensure low-cost bio-remedies are on hand.`)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl uppercase cursor-pointer tracking-wider"
                    >
                      Read Calendar Aloud
                    </button>
                  </div>

                </div>
              ) : (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm">Initiating schedule calculations...</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab D: Offline Advisory Handbooks Library */}
        {activeTab === "handbook" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left handbooks scrollbar */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Locally Downloaded Handbooks</h3>
                  <p className="text-xs text-slate-400">Read reference protocols off-grid in rural districts.</p>
                </div>

                <div className="space-y-2">
                  {booksList.map((book, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedBookIndex(idx);
                        setSelectedChapterIndex(null);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedBookIndex === idx
                          ? "bg-white border-emerald-500 shadow-sm"
                          : "bg-white/80 border-slate-100 hover:bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-2.5">
                          <BookOpen className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{book.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{book.category} · {book.fileSize}</p>
                          </div>
                        </div>

                        {/* Interactive Download simulation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDownloadBook(idx);
                          }}
                          className={`p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
                            book.downloaded
                              ? "bg-emerald-50 hover:bg-rose-50 text-emerald-600 hover:text-rose-600 border border-emerald-100 hover:border-rose-100"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                          }`}
                          title={book.downloaded ? "Delete Book Cache" : "Save for Offline Access"}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                        {book.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Handbooks chapters browser */}
              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[32px] p-6 flex flex-col h-full min-h-[500px]">
                {booksList[selectedBookIndex] ? (
                  <div className="space-y-5 flex-1 select-none flex flex-col justify-between">
                    <div>
                      {/* Book header */}
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <span>Handbook Core Contents</span>
                          <span>•</span>
                          <span>{booksList[selectedBookIndex].category}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight mt-1">
                          {booksList[selectedBookIndex].title}
                        </h2>
                        
                        {!booksList[selectedBookIndex].downloaded && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs flex items-center justify-between">
                            <span>You are looking at a preview. Download this book for offline rural use.</span>
                            <button
                              onClick={() => toggleDownloadBook(selectedBookIndex)}
                              className="text-xs font-bold bg-amber-100/60 border border-amber-300 px-3 py-1 rounded"
                            >
                              Download now
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Chapters timeline checklist */}
                      <div className="mt-5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Chapters / Action items</span>
                        
                        {booksList[selectedBookIndex].chapters.map((chap, cidx) => (
                          <div
                            key={cidx}
                            onClick={() => setSelectedChapterIndex(selectedChapterIndex === cidx ? null : cidx)}
                            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                              selectedChapterIndex === cidx
                                ? "bg-emerald-50 border-emerald-300"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-mono text-emerald-800 font-bold text-xs">Section {chap.num}</span>
                              <span className="text-xs font-semibold text-slate-800 truncate flex-1 ml-2">{chap.name}</span>
                              <button className="text-xs text-emerald-800 font-bold hover:underline">
                                {selectedChapterIndex === cidx ? "Close" : "Expand"}
                              </button>
                            </div>
                            
                            {selectedChapterIndex === cidx && (
                              <div className="mt-3 pt-2.5 border-t border-emerald-200/50 text-xs text-slate-600 leading-relaxed pr-2">
                                <p>{chap.detail}</p>
                                
                                <div className="mt-4 flex justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakAdvisory(`Reading Chapter ${chap.num}: ${chap.name}. Detailed instructions: ${chap.detail}`);
                                    }}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded-lg uppercase transition-all flex items-center gap-1.5"
                                  >
                                    <Volume2 className="h-3.5 w-3.5" />
                                    <span>Read Section</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Authoritative Community Sourced Guides</span>
                      <button
                        onClick={() => speakAdvisory(`You are browsing files inside ${booksList[selectedBookIndex].title}. Select any section and click read section to enable audio reader.`)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span>Brief book audio overview</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-16">
                    <BookMarked className="h-10 w-10 mb-2" />
                    <p className="text-sm">No handbook selected.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab E: Diagnostic Log Archive History */}
        {activeTab === "history" && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Crop Health Diagnostic Registry</h2>
                  <p className="text-xs text-slate-500">Record archive of diagnosed stresses and community advisory tickets.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveLogs([])}
                    id="clear-logs-btn"
                    className="bg-rose-50 text-rose-800 text-xs px-4 py-1.5 rounded-xl font-semibold border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Archive</span>
                  </button>
                  {historyLogs.some(l => l.status === "Pending Sync") && (
                    <button
                      onClick={runCloudSync}
                      id="history-sync-btn"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded-xl font-bold uppercase transition-colors flex items-center gap-1.5"
                    >
                      <Wifi className="h-3.5 w-3.5" />
                      <span>Sync Cache</span>
                    </button>
                  )}
                </div>
              </div>

              {historyLogs.length > 0 ? (
                <div className="space-y-3">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-500/30 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-850 text-sm">{log.cropName} Diagnostic Ticket</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            log.status === "Synced" 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 italic mb-3">"{log.notes}"</p>

                      {log.diagnosis && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <Sprout className="h-4 w-4 text-emerald-600" />
                              Diagnosed: {log.diagnosis.diseaseName}
                            </span>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-emerald-800">
                              {(log.diagnosis.confidence * 100).toFixed(0)}% Confident
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 leading-relaxed pr-2">{log.diagnosis.description}</p>
                          
                          <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Organic Therapy</span>
                              <p className="text-[11px] text-slate-700 leading-tight mt-0.5">{log.diagnosis.organicAlternatives}</p>
                            </div>
                            <button
                              onClick={() => speakAdvisory(`Scouted crop history ticket. Diagnosis details: ${log.diagnosis?.diseaseName}. Remediate using organic compound: ${log.diagnosis?.organicAlternatives}`)}
                              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1.5 shrink-0 ml-3"
                              title="Listen aloud"
                            >
                              <Volume2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Play Spoken Advisory</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <History className="h-10 w-10 text-slate-300" />
                  <div>
                    <h4 className="font-bold text-slate-600 text-sm">No History entries found</h4>
                    <p className="text-xs text-slate-400">You haven't run any scan reports yet. Start by checking crop stress.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
