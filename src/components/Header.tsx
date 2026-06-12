/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  WEST_AFRICAN_REGIONS, 
  WEST_AFRICAN_LANGUAGES 
} from "../data/cropData";
import { RegionInfo } from "../types";
import { 
  Globe, 
  MapPin, 
  Wifi, 
  WifiOff, 
  Sprout, 
  VolumeX, 
  Volume2
} from "lucide-react";

interface HeaderProps {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  selectedRegion: RegionInfo;
  setSelectedRegion: (region: RegionInfo) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  globalAudioPlaying: boolean;
  stopGlobalAudio: () => void;
}

export default function Header({
  selectedLanguage,
  setSelectedLanguage,
  selectedRegion,
  setSelectedRegion,
  isOffline,
  setIsOffline,
  globalAudioPlaying,
  stopGlobalAudio,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-forest-900 to-forest-800 border-b border-forest-800 p-4 sticky top-0 z-30 shadow-md">
      {/* App Branding Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-forest-600 rounded-lg flex items-center justify-center border border-forest-500 shadow-inner">
            <Sprout className="h-5 w-5 text-earth-100" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none tracking-tight">
              SunoAgri
            </h1>
            <p className="text-[10px] text-earth-300 font-mono">
              COMMUNITY EXTENSION 2.0
            </p>
          </div>
        </div>

        {/* Offline Toggle Badge */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          id="offline-toggle-button"
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer ${
            isOffline 
              ? "bg-red-950/80 text-red-400 border border-red-800/80 animate-pulse" 
              : "bg-forest-950/90 text-forest-300 border border-forest-700/80"
          }`}
          title="Click to toggle Network Connection Simulation"
        >
          {isOffline ? (
            <>
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
              <span>Offline Mode</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5 text-forest-400" />
              <span>Online (Sync)</span>
            </>
          )}
        </button>
      </div>

      {/* Selectors grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-forest-800/40">
        {/* Language selector */}
        <div className="relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <Globe className="h-3.5 w-3.5 text-earth-400" />
          </div>
          <select
            id="language-selector"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full bg-forest-950/80 border border-forest-800/80 text-xs text-earth-100 pl-8 pr-2 py-1.5 rounded-lg focus:outline-none focus:border-earth-500 transition-colors cursor-pointer appearance-none"
          >
            {WEST_AFRICAN_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-earth-400">
            ▾
          </div>
        </div>

        {/* Region selector */}
        <div className="relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <MapPin className="h-3.5 w-3.5 text-earth-400" />
          </div>
          <select
            id="region-selector"
            value={selectedRegion.id}
            onChange={(e) => {
              const reg = WEST_AFRICAN_REGIONS.find((r) => r.id === e.target.value);
              if (reg) setSelectedRegion(reg);
            }}
            className="w-full bg-forest-950/80 border border-forest-800/80 text-xs text-earth-100 pl-8 pr-2 py-1.5 rounded-lg focus:outline-none focus:border-earth-500 transition-colors cursor-pointer appearance-none text-ellipsis overflow-hidden"
          >
            {WEST_AFRICAN_REGIONS.map((reg) => (
              <option key={reg.id} value={reg.id}>
                📍 {reg.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-earth-400">
            ▾
          </div>
        </div>
      </div>

      {/* Global Audio state widget, visible only when playing */}
      {globalAudioPlaying && (
        <div className="mt-3 flex items-center justify-between bg-earth-900 border border-earth-700/60 rounded-lg py-1.5 px-3 text-xs text-earth-100 animate-slide-down">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <span className="h-3 w-1 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-4 w-1 bg-forest-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-3 w-1 bg-earth-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-earth-200">Reading Advice Aloud...</span>
          </div>
          <button
            onClick={stopGlobalAudio}
            id="stop-global-audio"
            className="bg-red-950 hover:bg-red-900 text-red-400/90 text-[10px] font-bold tracking-wide border border-red-800/60 px-2 py-1 rounded cursor-pointer transition-all flex items-center space-x-1"
          >
            <VolumeX className="h-3 w-3" />
            <span>Mute Voice</span>
          </button>
        </div>
      )}
    </header>
  );
}
