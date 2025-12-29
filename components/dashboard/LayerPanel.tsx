"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Map,
  Satellite,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Scan,
  TreePine,
  Image,
  Sparkles,
} from "lucide-react";

interface LayerPanelProps {
  showVectors: boolean;
  showImagery: boolean;
  showClassified: boolean;
  baseLayer: "osm" | "satellite";
  onToggleVectors: () => void;
  onToggleImagery: () => void;
  onToggleClassified: () => void;
  onToggleBaseLayer: () => void;
  singleSiteSelected: boolean;
  loading?: boolean;
}

interface LayerItemProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  thumbnail?: string;
}

function LayerItem({
  active,
  onClick,
  disabled = false,
  icon,
  label,
  description,
  color,
}: LayerItemProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative w-full flex items-center gap-3 p-3 rounded-xl
        transition-all duration-200 text-left
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${
          active
            ? "bg-gradient-to-r from-slate-700/80 to-slate-600/50 border border-white/20"
            : "bg-slate-800/50 hover:bg-slate-700/50 border border-transparent"
        }
      `}
    >
      {/* Icon container with color indicator */}
      <div
        className={`
          relative w-10 h-10 rounded-lg flex items-center justify-center
          transition-all duration-200
          ${active ? "bg-white/15" : "bg-white/5"}
        `}
      >
        <div className={`${active ? "text-white" : "text-slate-400"}`}>
          {icon}
        </div>
        {/* Active color indicator */}
        {active && (
          <motion.div
            layoutId={`indicator-${label}`}
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-800"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Label and description */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium ${
            active ? "text-white" : "text-slate-300"
          }`}
        >
          {label}
        </div>
        <div className="text-[11px] text-slate-400 truncate">{description}</div>
      </div>

      {/* Visibility toggle */}
      <div
        className={`p-1.5 rounded-lg transition-all ${
          active ? "bg-white/10 text-white" : "text-slate-500"
        }`}
      >
        {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </div>
    </motion.button>
  );
}

interface BaseLayerOptionProps {
  type: "osm" | "satellite";
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

function BaseLayerOption({
  type,
  isActive,
  onClick,
  label,
  icon,
}: BaseLayerOptionProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative flex-1 flex flex-col items-center gap-2 p-3 rounded-xl
        transition-all duration-200 overflow-hidden
        ${
          isActive
            ? "bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/50"
            : "bg-slate-800/50 hover:bg-slate-700/50 border-2 border-transparent"
        }
      `}
    >
      {/* Thumbnail background */}
      <div
        className={`
          absolute inset-0 opacity-20
          ${type === "osm" ? "bg-gradient-to-br from-blue-400 to-green-400" : "bg-gradient-to-br from-slate-600 to-slate-800"}
        `}
      />

      {/* Icon */}
      <div
        className={`
          relative w-10 h-10 rounded-lg flex items-center justify-center
          ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"}
        `}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className={`
          relative text-xs font-medium
          ${isActive ? "text-emerald-400" : "text-slate-400"}
        `}
      >
        {label}
      </span>

      {/* Selection indicator */}
      {isActive && (
        <motion.div
          layoutId="baseLayerIndicator"
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400"
        />
      )}
    </motion.button>
  );
}

export default function LayerPanel({
  showVectors,
  showImagery,
  showClassified,
  baseLayer,
  onToggleVectors,
  onToggleImagery,
  onToggleClassified,
  onToggleBaseLayer,
  singleSiteSelected,
  loading = false,
}: LayerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<"base" | "overlays">(
    "overlays"
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-72"
    >
      {/* Glass panel container */}
      <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">
                Map Layers
              </div>
              <div className="text-[10px] text-slate-400">
                {[showVectors, showImagery, showClassified].filter(Boolean)
                  .length + 1}{" "}
                active
              </div>
            </div>
          </div>
          <div className="text-slate-400">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Section tabs */}
              <div className="px-3 pb-2">
                <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
                  <button
                    onClick={() => setActiveSection("base")}
                    className={`
                      flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all
                      ${
                        activeSection === "base"
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-white"
                      }
                    `}
                  >
                    Base Map
                  </button>
                  <button
                    onClick={() => setActiveSection("overlays")}
                    className={`
                      flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all
                      ${
                        activeSection === "overlays"
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-white"
                      }
                    `}
                  >
                    Overlays
                  </button>
                </div>
              </div>

              {/* Base Map Section */}
              <AnimatePresence mode="wait">
                {activeSection === "base" && (
                  <motion.div
                    key="base"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="px-3 pb-3"
                  >
                    <div className="flex gap-2">
                      <BaseLayerOption
                        type="osm"
                        isActive={baseLayer === "osm"}
                        onClick={() =>
                          baseLayer === "satellite" && onToggleBaseLayer()
                        }
                        label="Streets"
                        icon={<Map className="w-5 h-5" />}
                      />
                      <BaseLayerOption
                        type="satellite"
                        isActive={baseLayer === "satellite"}
                        onClick={() =>
                          baseLayer === "osm" && onToggleBaseLayer()
                        }
                        label="Satellite"
                        icon={<Satellite className="w-5 h-5" />}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Overlays Section */}
                {activeSection === "overlays" && (
                  <motion.div
                    key="overlays"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="px-3 pb-3 space-y-2"
                  >
                    <LayerItem
                      active={showVectors}
                      onClick={onToggleVectors}
                      disabled={loading}
                      icon={<Scan className="w-5 h-5" />}
                      label="Site Boundaries"
                      description="Vector polygon outlines"
                      color="#10b981"
                    />

                    <LayerItem
                      active={showImagery}
                      onClick={onToggleImagery}
                      disabled={loading || !singleSiteSelected}
                      icon={<Image className="w-5 h-5" />}
                      label="Satellite Imagery"
                      description={
                        singleSiteSelected
                          ? "High-res imagery overlay"
                          : "Select a site first"
                      }
                      color="#3b82f6"
                    />

                    <LayerItem
                      active={showClassified}
                      onClick={onToggleClassified}
                      disabled={loading || !singleSiteSelected}
                      icon={<TreePine className="w-5 h-5" />}
                      label="Land Classification"
                      description={
                        singleSiteSelected
                          ? "AI-classified land cover"
                          : "Select a site first"
                      }
                      color="#8b5cf6"
                    />

                    {/* Loading indicator */}
                    {loading && (
                      <div className="flex items-center justify-center gap-2 py-2 text-slate-400">
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        <span className="text-xs">Loading layers...</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Site selection hint */}
              {!singleSiteSelected && activeSection === "overlays" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-3 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-amber-300">
                        Select a site
                      </div>
                      <div className="text-[11px] text-amber-400/70 mt-0.5">
                        Click on a site boundary to enable imagery and
                        classification layers
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend (when site selected) */}
      {singleSiteSelected && showClassified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl p-3"
        >
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Classification Legend
          </div>
          <div className="space-y-1.5">
            {[
              { color: "#166534", label: "Tree Canopy" },
              { color: "#4ade80", label: "Green Area" },
              { color: "#0ea5e9", label: "Water" },
              { color: "#94a3b8", label: "Built-up" },
              { color: "#d6b88c", label: "Barren" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
