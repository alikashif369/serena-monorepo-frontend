"use client";

import { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function CountUp({
  to,
  from = 0,
  duration = 2.5,
  delay = 0,
  decimals = 0,
  separator = ",",
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;

    const node = nodeRef.current;
    if (!node) return;

    // Initial render
    node.textContent = formatValue(from);

    const controls = animate(from, to, {
      duration: duration,
      delay: delay,
      ease: [0.25, 0.1, 0.25, 1], // Ease out cubic
      onUpdate(value) {
        node.textContent = formatValue(value);
      },
    });

    return () => controls.stop();
  }, [from, to, duration, delay, inView, decimals, separator, prefix, suffix]);

  const formatValue = (value: number) => {
    const fixed = value.toFixed(decimals);
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return prefix + parts.join(".") + suffix;
  };

  return <span ref={nodeRef} className={className} />;
}
