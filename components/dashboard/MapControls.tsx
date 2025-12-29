"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Satellite,
  Hexagon,
  Camera,
  Grid2X2,
} from "lucide-react";

interface MapControlsProps {
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

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  tooltip: string;
  color?: string;
}

function ControlButton({
  active,
  onClick,
  disabled = false,
  icon,
  activeIcon,
  tooltip,
  color = "emerald",
}: ControlButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = {
    emerald: {
      active: "bg-emerald-500 text-white shadow-emerald-200",
      hover: "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200",
    },
    blue: {
      active: "bg-blue-500 text-white shadow-blue-200",
      hover: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    },
    purple: {
      active: "bg-purple-500 text-white shadow-purple-200",
      hover: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200",
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald;

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`
          relative w-10 h-10 rounded-xl flex items-center justify-center
          border transition-all duration-200 shadow-sm
          ${disabled ? "opacity-40 cursor-not-allowed bg-stone-50 border-stone-200 text-stone-300" : ""}
          ${!disabled && active ? `${colors.active} border-transparent shadow-md` : ""}
          ${!disabled && !active ? `bg-white border-stone-200 text-stone-500 ${colors.hover}` : ""}
        `}
      >
        {active && activeIcon ? activeIcon : icon}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-2 top-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-stone-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              {tooltip}
              {disabled && " (select a site)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OverlayButtons({
  showVectors,
  showImagery,
  showClassified,
  onToggleVectors,
  onToggleImagery,
  onToggleClassified,
  singleSiteSelected,
  loading = false,
}: Omit<MapControlsProps, "baseLayer" | "onToggleBaseLayer">) {
  return (
    <div className="flex flex-col gap-2">
      <ControlButton
        active={showVectors}
        onClick={onToggleVectors}
        disabled={loading}
        icon={<Hexagon className="w-5 h-5" />}
        tooltip="Boundaries"
        color="emerald"
      />

      <ControlButton
        active={showImagery}
        onClick={onToggleImagery}
        disabled={loading || !singleSiteSelected}
        icon={<Camera className="w-5 h-5" />}
        tooltip="Imagery"
        color="blue"
      />

      <ControlButton
        active={showClassified}
        onClick={onToggleClassified}
        disabled={loading || !singleSiteSelected}
        icon={<Grid2X2 className="w-5 h-5" />}
        tooltip="Classification"
        color="purple"
      />
    </div>
  );
}

export function BasemapToggle({
  baseLayer,
  onToggleBaseLayer,
}: {
  baseLayer: "osm" | "satellite";
  onToggleBaseLayer: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={onToggleBaseLayer}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-xl flex items-center justify-center
                   bg-white border border-stone-200 text-stone-600 shadow-sm
                   hover:border-stone-300 hover:shadow-md transition-all duration-200"
      >
        {baseLayer === "osm" ? (
          <Satellite className="w-5 h-5" />
        ) : (
          <Map className="w-5 h-5" />
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-stone-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              Switch to {baseLayer === "osm" ? "Satellite" : "Streets"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
