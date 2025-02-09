"use client";

import { useEffect, useState } from "react";

export function GradientCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="gradient-blur fixed"
      style={{
        left: position.x - 100,
        top: position.y - 100,
        transition: "all 0.1s ease",
        zIndex: 0,
      }}
    />
  );
}