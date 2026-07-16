import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, Float, PointMaterial, Points, Ring } from '@react-three/drei';
import * as THREE from 'three';

function NeuralParticles({ count = 300, radius = 2.5, color = '#62F6C5', size = 0.025 }) {
  const points = useRef();

  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 0.6;
      const r = radius + (Math.random() - 0.5) * 0.8;
      positions.set([
        Math.cos(angle) * r + spread,
        (Math.random() - 0.5) * 0.9,
        Math.sin(angle) * r + spread,
      ], i * 3);
    }
    return positions;
  }, [count, radius]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.12;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.25;
    }
  });

  return (
    <Points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesPosition.length / 3} array={particlesPosition} itemSize={3} />
      </bufferGeometry>
      <PointMaterial transparent color={color} size={size} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

function FloatingRing({ radius, tube, color, speed, tiltX = 0.3 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
      ref.current.rotation.x = tiltX + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });
  return (
    <Ring ref={ref} args={[radius, radius + tube, 80]}>
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.25} />
    </Ring>
  );
}

function CoreOrb() {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.15;
      outerRef.current.rotation.y = t * 0.22;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.2;
      innerRef.current.rotation.y = -t * 0.28;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      {/* Outer distorted shell */}
      <Sphere ref={outerRef} args={[1.15, 128, 128]}>
        <MeshDistortMaterial
          color="#7B6FFF"
          emissive="#62F6C5"
          emissiveIntensity={0.35}
          metalness={0.8}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          distort={0.35}
          speed={2.5}
          transparent
          opacity={0.75}
        />
      </Sphere>

      {/* Inner solid core */}
      <Sphere ref={innerRef} args={[0.75, 64, 64]}>
        <MeshDistortMaterial
          color="#9FAEFF"
          emissive="#9FAEFF"
          emissiveIntensity={0.6}
          metalness={1}
          roughness={0}
          distort={0.15}
          speed={4}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Wireframe pulse sphere */}
      <Sphere args={[1.35, 24, 24]}>
        <meshBasicMaterial color="#62F6C5" wireframe transparent opacity={0.06} />
      </Sphere>
    </Float>
  );
}

export default function KnowledgeCore3D({ className = "w-full h-[400px]" }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 10, 5]} intensity={2.5} color="#62F6C5" />
        <directionalLight position={[-8, -6, -5]} intensity={1.5} color="#F5C76B" />
        <pointLight position={[0, 0, 0]} intensity={3} color="#9FAEFF" />
        <pointLight position={[3, 2, -2]} intensity={1.5} color="#62F6C5" />
        <pointLight position={[-3, -2, 2]} intensity={1} color="#7B6FFF" />

        <CoreOrb />

        {/* Inner tight ring */}
        <FloatingRing radius={1.9} tube={0.01} color="#62F6C5" speed={0.6} tiltX={0.2} />
        {/* Mid orbital ring */}
        <FloatingRing radius={2.5} tube={0.008} color="#9FAEFF" speed={-0.4} tiltX={1.1} />
        {/* Outer tilted ring */}
        <FloatingRing radius={3.1} tube={0.006} color="#F5C76B" speed={0.25} tiltX={0.7} />

        {/* Neural particle rings */}
        <NeuralParticles count={250} radius={2.2} color="#62F6C5" size={0.025} />
        <NeuralParticles count={150} radius={3.4} color="#9FAEFF" size={0.018} />
        <NeuralParticles count={80}  radius={1.55} color="#F5C76B" size={0.015} />

        <Stars radius={12} depth={30} count={1200} factor={5} saturation={0.3} fade speed={0.8} />
      </Canvas>

      {/* Ambient glow layers behind canvas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-brand-periwinkle/15 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-brand-primary/20 blur-[70px] -z-10 pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] rounded-full bg-brand-amber/10 blur-[50px] -z-10 pointer-events-none" />
    </div>
  );
}
