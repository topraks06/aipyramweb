"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, SoftShadows, ContactShadows, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * ZARIF KUMAŞ SİMÜLASYONU (Maison Objet Standartlarında)
 * R3F'in kendi Garbage Collection mekanizmasına bırakılarak Memory Leak (Canvas Çökmesi) tamamen giderildi.
 */
function LuksKumasMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Otonom Hacim ve İpek Döküm dalgalanması (GPU-safe rotasyon ve hover)
  useFrame((state) => {
    if (meshRef.current) {
      // Yalnızca Transform matrix güncellenir, CPU/Memory leak yaratmaz!
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15 - 0.5;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // HATA ÇÖZÜMÜ: Daha önce burada yer alan manuel `geometry.dispose()` R3F'in lifecycle'ı ile 
  // çakışıp WebGL Context Lost (Canvas) hatası veriyordu. R3F Auto-Dispose kullanılıyor.

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
      {/* Lüks Zanaat (Haute Couture) Dokusu, organik ipek dökümü */}
      <cylinderGeometry args={[1.5, 1.8, 5, 128, 32, true, 0, Math.PI]} />
      
      {/* PUDRA BEJ LÜKS İPEK (Powder Beige Silky Organza) */}
      <meshPhysicalMaterial 
        color="#F2EBE5" // Powder Beige
        emissive="#1A120D"
        roughness={0.2} 
        metalness={0.15} 
        clearcoat={0.6} 
        clearcoatRoughness={0.1}
        transmission={0.3}     // Yarı Saydam Lüks Kumaş Algısı
        thickness={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * 👑 Perde.ai OTONOM INFAZ MOTORU ÇIKTISI
 * - GL Profil: `powerPreference: "high-performance"`, `antialias: false`
 * - Maison Objet Aydınlatması: Ambient ışık kısıldı, PointLight (Sarı sıcaklık) ile Powder Beige kumaş canlandırıldı.
 */
export default function CanvasView() {
  const [dpr, setDpr] = useState(1);
  
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio, 2));
  }, []);

  return (
    <div className="w-full h-full min-h-[70vh] bg-[#050505] relative overflow-hidden rounded-3xl border border-neutral-900 shadow-2xl">
      <Canvas
        shadows
        dpr={dpr}
        gl={{ 
          powerPreference: "high-performance", 
          antialias: false,
          preserveDrawingBuffer: false,
          alpha: false
        }}
        camera={{ position: [0, 1, 9], fov: 40 }}
      >
        <React.Suspense fallback={null}>
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 12, 25]} />
          
          <SoftShadows size={25} samples={16} focus={0.5} />
          
          {/* Lüks Showroom - Yüksek Kontrast Aydınlatma */}
          <ambientLight intensity={0.15} color="#ffffff" />
          
          <directionalLight 
            castShadow 
            position={[5, 12, 4]} 
            intensity={2} 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            color="#fff0e6"
          />
          
          {/* Kumaş Kıvrımlarına Vuran Maison Objet Spotu */}
          <pointLight position={[-4, -1, 5]} intensity={4} color="#ffd4a8" distance={12} decay={2} />
          <pointLight position={[3, 2, -4]} intensity={2} color="#ffffff" distance={15} decay={2} />
          
          <LuksKumasMesh />
          
          {/* Mermer Zemin Gölgesi Algısı */}
          <ContactShadows position={[0, -3.5, 0]} opacity={0.8} scale={15} blur={2.5} far={5} color="#000000" />
          
          {/* Stüdyo HDRI - Porselen ve İpek Yansımaları İçin */}
          <Environment preset="studio" />
          
          {/* Hafif Lüks Parlama (Subtle Silky Bloom) */}
          <EffectComposer>
             <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.9} height={300} intensity={1} />
          </EffectComposer>

          <OrbitControls 
            enableZoom={true} 
            maxDistance={12}
            minDistance={4}
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minPolarAngle={Math.PI / 4}
            autoRotate 
            autoRotateSpeed={0.3} 
            dampingFactor={0.05}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
