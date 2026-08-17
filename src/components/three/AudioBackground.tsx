"use client";

import { Canvas } from "@react-three/fiber";
import { DotField } from "./DotField";

interface AudioBackgroundProps {
  color?: string;
}

export function AudioBackground({ color = "#fff" }: AudioBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-black">
      {/* Caméra perspective (plus d'OrthographicCamera) : indispensable pour
          percevoir le volume et la profondeur de la forme organique */}
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <DotField
          color={color}
          radius={1.7}
          count={5000}
          sizeRange={[0.1, 0.5]}
        />
      </Canvas>
    </div>
  );
}
