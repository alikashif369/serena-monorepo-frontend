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
        transition-all duration-300 text-left border
        ${disabled ? "opacity-40 cursor-not-allowed border-transparent" : "cursor-pointer"}
        ${
          active
            ? "bg-[#115e59] border-[#b08d4b] shadow-lg shadow-[#115e59]/20"
            : "bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10"
        }
      `}
    >
      {/* Icon container with color indicator */}
      <div
        className={`
          relative w-10 h-10 rounded-lg flex items-center justify-center
          transition-all duration-300
          ${active ? "bg-white/20 text-white" : "bg-white/5 text-gray-400"}
        `}
      >
        {icon}
        {/* Active color indicator */}
        {active && (
          <motion.div
            layoutId={`indicator-${label}`}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#115e59]"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Label and description */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-bold ${
            active ? "text-white" : "text-gray-200"
          }`}
        >
          {label}
        </div>
        <div className={`text-[10px] uppercase tracking-wide truncate ${active ? "text-white/70" : "text-gray-500"}`}>{description}</div>
      </div>

      {/* Visibility toggle */}
      <div
        className={`p-1.5 rounded-lg transition-all ${
          active ? "bg-white/20 text-white" : "text-gray-600"
        }`}
      >
        {active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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
        transition-all duration-300 overflow-hidden border
        ${
          isActive
            ? "bg-[#115e59]/40 border-[#b08d4b]"
            : "bg-white/5 hover:bg-white/10 border-transparent"
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
          ${isActive ? "bg-[#115e59] text-white" : "bg-white/5 text-gray-400"}
        `}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className={`
          relative text-[10px] font-bold uppercase tracking-wider
          ${isActive ? "text-white" : "text-gray-400"}
        `}
      >
        {label}
      </span>

      {/* Selection indicator */}
      {isActive && (
        <motion.div
          layoutId="baseLayerIndicator"
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#b08d4b]"
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
      className="w-80"
    >
      {/* Glass panel container */}
      <div className="bg-[#0f3f3c]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#115e59] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-serif font-bold text-white tracking-wide">
                Map Layers
              </div>
              <div className="text-[10px] font-medium text-[#b08d4b] uppercase tracking-wider">
                {[showVectors, showImagery, showClassified].filter(Boolean)
                  .length + 1}{" "}
                active
              </div>
            </div>
          </div>
          <div className="text-gray-400 group-hover:text-white transition-colors">
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Section tabs */}
              <div className="px-4 pb-3">
                <div className="flex gap-1 p-1 bg-black/20 rounded-xl">
                  <button
                    onClick={() => setActiveSection("base")}
                    className={`
                      flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                      ${
                        activeSection === "base"
                          ? "bg-[#115e59] text-white shadow-sm"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    Base Map
                  </button>
                  <button
                    onClick={() => setActiveSection("overlays")}
                    className={`
                      flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                      ${
                        activeSection === "overlays"
                          ? "bg-[#115e59] text-white shadow-sm"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
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
                    className="px-4 pb-4"
                  >
                    <div className="flex gap-3">
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
                    className="px-4 pb-4 space-y-3"
                  >
                    <LayerItem
                      active={showVectors}
                      onClick={onToggleVectors}
                      disabled={loading}
                      icon={<Scan className="w-5 h-5" />}
                      label="Site Boundaries"
                      description="Vector polygon outlines"
                      color="#b08d4b"
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
                      <div className="flex items-center justify-center gap-2 py-3 text-[#b08d4b]">
                        <div className="w-4 h-4 rounded-full border-2 border-[#b08d4b] border-t-transparent animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider">Loading layers...</span>
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
                  className="mx-4 mb-4 p-4 rounded-xl bg-[#b08d4b]/10 border border-[#b08d4b]/20"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-[#b08d4b] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#b08d4b] uppercase tracking-wide">
                        Select a site
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 leading-relaxed">
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
          className="mt-4 bg-[#0f3f3c]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl p-4"
        >
          <div className="text-[10px] font-bold text-[#b08d4b] uppercase tracking-[0.2em] mb-3">
            Classification Legend
          </div>
          <div className="space-y-2">
            {[
              { color: "#166534", label: "Tree Canopy" },
              { color: "#4ade80", label: "Green Area" },
              { color: "#0ea5e9", label: "Water" },
              { color: "#94a3b8", label: "Built-up" },
              { color: "#d6b88c", label: "Barren" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full border border-white/10"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-gray-200">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
