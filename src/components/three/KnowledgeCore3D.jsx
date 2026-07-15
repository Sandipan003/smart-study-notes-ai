import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, Float, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

function ParticleRing({ count = 200, radius = 2.5 }) {
  const points = useRef();

  // Generate random particles in a ring shape
  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.5;
      const y = (Math.random() - 0.5) * 0.5;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.5;
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, [count, radius]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.1;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <Points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial transparent color="#62F6C5" size={0.03} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
}

function CoreOrb() {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.2}>
        <MeshDistortMaterial 
          color="#9FAEFF" 
          emissive="#62F6C5"
          emissiveIntensity={0.2}
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.9} 
          roughness={0.1} 
          distort={0.4} 
          speed={2} 
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Inner glowing core */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color="#9FAEFF" transparent opacity={0.3} wireframe />
      </Sphere>
    </Float>
  );
}

export default function KnowledgeCore3D({ className = "w-full h-[400px]" }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#62F6C5" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#F5C76B" />
        <pointLight position={[0, 0, 0]} intensity={2} color="#9FAEFF" />
        
        <CoreOrb />
        <ParticleRing count={300} radius={2.2} />
        <ParticleRing count={150} radius={3.5} />
        
        <Stars radius={10} depth={20} count={1000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
      
      {/* Ambient glow behind canvas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-brand-primary/10 blur-[80px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-brand-periwinkle/10 blur-[60px] -z-10 pointer-events-none"></div>
    </div>
  );
}
