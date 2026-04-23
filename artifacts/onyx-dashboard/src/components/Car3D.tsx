import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { CarHotspotKey, CarProfile } from "@/lib/cars";

export type HotspotStatus = {
  key: CarHotspotKey;
  color: string;
  label: string;
  remainingKm: number | null;
  hasDefect: boolean;
  wearPercent?: number;
};

type Props = {
  car: CarProfile;
  statusByKey: Record<CarHotspotKey, HotspotStatus>;
  onPick: (key: CarHotspotKey) => void;
  selectedKey?: CarHotspotKey | null;
};

export default function Car3D({ car, statusByKey, onPick, selectedKey }: Props) {
  return (
    <Canvas
      camera={{ position: [4, 3, 5], fov: 40 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#0b1424"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 4]} intensity={1.1} color="#dbe7ff" />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} color="#1a3a5c" />
      <hemisphereLight args={["#3a6aa8", "#0b1424", 0.4]} />

      <CarBody car={car} />
      <Floor />

      {car.hotspots.map((h) => {
        const st = statusByKey[h.key];
        return (
          <Hotspot
            key={h.key}
            position={h.position}
            color={st?.color || "#64748b"}
            label={h.label}
            selected={selectedKey === h.key}
            onPick={() => onPick(h.key)}
          />
        );
      })}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={9}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0.3, 0]}
        autoRotate={false}
      />
    </Canvas>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
      <circleGeometry args={[5, 64]} />
      <meshStandardMaterial color="#0a1322" metalness={0.2} roughness={0.95} />
    </mesh>
  );
}

function CarBody({ car }: { car: CarProfile }) {
  const isSuv = car.style === "suv";
  const isSedan = car.style === "sedan";
  const length = isSedan ? 4.6 : isSuv ? 4.2 : 4.0;
  const width = isSuv ? 1.85 : 1.7;
  const bodyHeight = isSuv ? 0.85 : 0.6;
  const cabinHeight = isSuv ? 0.85 : 0.7;
  const cabinLengthRatio = isSedan ? 0.55 : 0.6;
  const cabinOffsetZ = isSedan ? -0.25 : -0.05;
  const yBody = isSuv ? 0.0 : -0.1;
  const wheelY = isSuv ? -0.05 : -0.2;

  return (
    <group rotation={[0, Math.PI, 0]}>
      {/* Lower body */}
      <mesh position={[0, yBody, 0]} castShadow>
        <boxGeometry args={[width, bodyHeight, length]} />
        <meshStandardMaterial
          color={car.bodyColor}
          metalness={0.7}
          roughness={0.3}
          envMapIntensity={0.8}
        />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, yBody + bodyHeight / 2 + cabinHeight / 2, cabinOffsetZ]} castShadow>
        <boxGeometry args={[width - 0.15, cabinHeight, length * cabinLengthRatio]} />
        <meshStandardMaterial
          color={car.bodyColor}
          metalness={0.65}
          roughness={0.32}
        />
      </mesh>
      {/* Windshield front */}
      <mesh
        position={[0, yBody + bodyHeight / 2 + cabinHeight / 2, cabinOffsetZ + (length * cabinLengthRatio) / 2 - 0.02]}
        rotation={[Math.PI / 12, 0, 0]}
      >
        <planeGeometry args={[width - 0.25, cabinHeight * 0.95]} />
        <meshStandardMaterial
          color="#0a1424"
          transparent
          opacity={0.85}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      {/* Windshield rear */}
      <mesh
        position={[0, yBody + bodyHeight / 2 + cabinHeight / 2, cabinOffsetZ - (length * cabinLengthRatio) / 2 + 0.02]}
        rotation={[-Math.PI / 12, 0, 0]}
      >
        <planeGeometry args={[width - 0.25, cabinHeight * 0.85]} />
        <meshStandardMaterial color="#0a1424" transparent opacity={0.85} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Hood line */}
      <mesh position={[0, yBody + bodyHeight / 2 + 0.005, length / 2 - 0.5]}>
        <planeGeometry args={[width - 0.1, length * 0.25]} />
        <meshStandardMaterial color={car.bodyAccent} metalness={0.5} roughness={0.4} transparent opacity={0.4} />
      </mesh>
      {/* Headlights */}
      <Headlight position={[-width / 2 + 0.15, yBody + 0.05, length / 2 - 0.05]} />
      <Headlight position={[width / 2 - 0.15, yBody + 0.05, length / 2 - 0.05]} />
      {/* Grille */}
      <mesh position={[0, yBody - 0.1, length / 2 - 0.02]}>
        <planeGeometry args={[width - 0.5, 0.18]} />
        <meshStandardMaterial color="#000" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Wheels */}
      <Wheel position={[-width / 2 + 0.05, wheelY, length / 2 - 0.95]} />
      <Wheel position={[width / 2 - 0.05, wheelY, length / 2 - 0.95]} />
      <Wheel position={[-width / 2 + 0.05, wheelY, -length / 2 + 0.95]} />
      <Wheel position={[width / 2 - 0.05, wheelY, -length / 2 + 0.95]} />
    </group>
  );
}

function Headlight({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#fffbe6" emissive="#fff8c0" emissiveIntensity={0.6} />
    </mesh>
  );
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
      <meshStandardMaterial color="#0a0f18" metalness={0.6} roughness={0.6} />
    </mesh>
  );
}

function Hotspot({
  position,
  color,
  label,
  selected,
  onPick,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  selected: boolean;
  onPick: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.lookAt(0, 10, 0);
    }
    if (pulseRef.current) {
      const s = 1 + (Math.sin(t * 2.5) + 1) * 0.4;
      pulseRef.current.scale.setScalar(s);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.55 - (s - 1) * 0.6);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPick();
  };

  // Translate the hotspot to actual world position; group rotates 180° in CarBody
  // but hotspots are not in that group, so they sit in world coords.
  return (
    <group position={position}>
      {/* Pulse halo */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* Solid dot */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[selected ? 0.16 : 0.13, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 1.1 : 0.6}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>
      {selected && (
        <Html
          position={[0, 0.35, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              background: "rgba(11,20,36,0.95)",
              border: `1px solid ${color}`,
              color: "white",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
              boxShadow: `0 0 12px ${color}88`,
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
