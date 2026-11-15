"use client";

import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

type Vec = [number, number, number];
const AXLE: Vec = [Math.PI / 2, 0, 0]; // three cylinders stand on Y; the axle here is Z

// Scene colors come from the design tokens so the lab follows light and dark themes.
function useTokens() {
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n: string) => cs.getPropertyValue(n).trim();
    return { bg: v("--plate"), metal: v("--ink-muted"), light: v("--surface"), rotor: v("--line-strong"), caliper: v("--brake"), pads: v("--amber"), brand: v("--brand") };
  }, []);
}

const Glow = createContext<{ color: string; level: number }>({ color: "black", level: 0 });

function Mat({ color }: { color: string }) {
  const glow = useContext(Glow);
  return <meshStandardMaterial color={color} roughness={0.55} metalness={0.25} emissive={glow.color} emissiveIntensity={glow.level} />;
}

type SceneProps = { selected: string | null; onSelect: (key: string) => void; explode: number; hideLabels?: boolean };

type SceneCtx = { selected: string | null; hover: string | null; setHover: (f: (h: string | null) => string | null) => void; onSelect: (key: string) => void; t: number; brand: string; hideLabels: boolean };
const Ctx = createContext<SceneCtx>({ selected: null, hover: null, setHover: () => {}, onSelect: () => {}, t: 0, brand: "black", hideLabels: false });

function Part({ id, offset, label, labelAt, children }: { id: string; offset: Vec; label?: string; labelAt?: Vec; children: ReactNode }) {
  const { selected, hover, setHover, onSelect, t, brand, hideLabels } = useContext(Ctx);
  const active = selected === id;
  const hot = hover === id;
  const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(() => id); document.body.style.cursor = "pointer"; };
  const out = () => { setHover((h) => (h === id ? null : h)); document.body.style.cursor = ""; };
  return (
    <group position={offset} onPointerOver={over} onPointerOut={out} onClick={(e) => { e.stopPropagation(); onSelect(id); }}>
      <Glow.Provider value={{ color: brand, level: active ? 0.5 : hot ? 0.25 : 0 }}>{children}</Glow.Provider>
      {label && labelAt && !hideLabels && (active || hot || t > 0.5) && (
        <Html position={labelAt} center style={{ pointerEvents: "none" }}>
          <span className={`whitespace-nowrap rounded-pill px-2 py-1 type-label text-[11px] leading-[14px] ${active ? "bg-brand text-on-brand" : "bg-surface text-ink border border-line"}`}>{label}</span>
        </Html>
      )}
    </group>
  );
}

function Scene({ selected, onSelect, explode: t, hideLabels = false }: SceneProps) {
  const c = useTokens();
  const [hover, setHover] = useState<string | null>(null);

  const vanes = useMemo(() => Array.from({ length: 24 }, (_, i) => (i / 24) * Math.PI * 2), []);
  const studs = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2 + Math.PI / 2), []);

  return (
    <Ctx.Provider value={{ selected, hover, setHover, onSelect, t, brand: c.brand, hideLabels }}>
      <color attach="background" args={[c.bg]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <directionalLight position={[-4, -2, -4]} intensity={0.6} />

      <Part id="part-hub" offset={[0, 0, -1.3 * t]} label="Wheel hub" labelAt={[0, -0.75, -0.4]}>
        <mesh rotation={AXLE} position={[0, 0, -0.45]}><cylinderGeometry args={[0.4, 0.4, 0.5, 32]} /><Mat color={c.metal} /></mesh>
        <mesh rotation={AXLE} position={[0, 0, -0.2]}><cylinderGeometry args={[0.62, 0.62, 0.1, 32]} /><Mat color={c.metal} /></mesh>
        <mesh rotation={AXLE} position={[0, 0, 0.3]}><cylinderGeometry args={[0.2, 0.22, 0.5, 24]} /><Mat color={c.light} /></mesh>
        {studs.map((a) => (
          <mesh key={a} rotation={AXLE} position={[Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0.2]}><cylinderGeometry args={[0.05, 0.05, 0.75, 12]} /><Mat color={c.light} /></mesh>
        ))}
      </Part>

      <Part id="part-bracket" offset={[0, 0.2 * t, -0.9 * t]} label="Caliper bracket" labelAt={[1.15, 1.2, -0.3]}>
        <mesh position={[0.74, 1.2, -0.3]}><boxGeometry args={[0.2, 0.9, 0.25]} /><Mat color={c.metal} /></mesh>
        <mesh position={[-0.74, 1.2, -0.3]}><boxGeometry args={[0.2, 0.9, 0.25]} /><Mat color={c.metal} /></mesh>
        <mesh position={[0, 0.78, -0.38]}><boxGeometry args={[1.68, 0.2, 0.2]} /><Mat color={c.metal} /></mesh>
        <mesh rotation={AXLE} position={[0.74, 1.55, -0.2]}><cylinderGeometry args={[0.06, 0.06, 0.6, 12]} /><Mat color={c.light} /></mesh>
        <mesh rotation={AXLE} position={[-0.74, 1.55, -0.2]}><cylinderGeometry args={[0.06, 0.06, 0.6, 12]} /><Mat color={c.light} /></mesh>
      </Part>

      <Part id="part-rotor" offset={[0, 0, 0]} label="Brake rotor" labelAt={[-1.2, -1.2, 0.1]}>
        <mesh rotation={AXLE} position={[0, 0, 0.085]}><cylinderGeometry args={[1.5, 1.5, 0.07, 64]} /><Mat color={c.rotor} /></mesh>
        <mesh rotation={AXLE} position={[0, 0, -0.085]}><cylinderGeometry args={[1.5, 1.5, 0.07, 64]} /><Mat color={c.rotor} /></mesh>
        {vanes.map((a) => (
          <mesh key={a} position={[Math.cos(a) * 1.12, Math.sin(a) * 1.12, 0]} rotation={[0, 0, a]}><boxGeometry args={[0.66, 0.05, 0.1]} /><Mat color={c.metal} /></mesh>
        ))}
        <mesh rotation={AXLE} position={[0, 0, 0.27]}><cylinderGeometry args={[0.72, 0.76, 0.3, 48, 1, true]} /><Mat color={c.rotor} /></mesh>
        <mesh position={[0, 0, 0.42]}><ringGeometry args={[0.26, 0.72, 48]} /><Mat color={c.rotor} /></mesh>
      </Part>

      {([-1, 1] as const).map((side) => (
        <Part key={side} id="part-pads" offset={[0, 0.55 * t, side * 0.5 * t]} label={side === 1 ? "Brake pads" : undefined} labelAt={[0.75, 0.85, 0.35]}>
          <mesh position={[0, 1.15, side * 0.19]}><boxGeometry args={[0.9, 0.45, 0.1]} /><Mat color={c.pads} /></mesh>
          <mesh position={[0, 1.15, side * 0.255]}><boxGeometry args={[0.96, 0.5, 0.03]} /><Mat color={c.metal} /></mesh>
        </Part>
      ))}

      <Part id="part-caliper" offset={[0, 0.9 * t, 0]} label="Caliper" labelAt={[0, 2.1, 0]}>
        <RoundedBox args={[1.25, 0.3, 0.98]} radius={0.1} position={[0, 1.7, -0.02]}><Mat color={c.caliper} /></RoundedBox>
        <RoundedBox args={[1.1, 0.8, 0.3]} radius={0.1} position={[0, 1.27, -0.45]}><Mat color={c.caliper} /></RoundedBox>
        <RoundedBox args={[1.1, 0.55, 0.14]} radius={0.06} position={[0, 1.4, 0.4]}><Mat color={c.caliper} /></RoundedBox>
        <mesh rotation={AXLE} position={[0, 1.15, -0.31]}><cylinderGeometry args={[0.2, 0.2, 0.08, 24]} /><Mat color={c.light} /></mesh>
        <mesh position={[0.4, 1.92, -0.4]}><cylinderGeometry args={[0.04, 0.04, 0.16, 10]} /><Mat color={c.light} /></mesh>
      </Part>

      <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={10} target={[0, 0.3 + 0.35 * t, -0.3 * t]} />
    </Ctx.Provider>
  );
}

export function BrakeAssembly(props: SceneProps) {
  return (
    <Canvas dpr={[1, 2]} resize={{ debounce: 0 }} style={{ width: "100%", height: "100%" }} onCreated={() => requestAnimationFrame(() => window.dispatchEvent(new Event("resize")))} camera={{ position: [4, 2.6, 5.6], fov: 40 }} onPointerMissed={() => (document.body.style.cursor = "")} aria-label="3D brake assembly. Drag to rotate.">
      <Scene {...props} />
    </Canvas>
  );
}
