'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

// Error boundary fallback
function ErrorFallback() {
  return (
    <div className="w-full h-[600px] bg-gray-900/50 rounded-2xl flex items-center justify-center">
      <div className="text-center text-gray-400">
        <p className="text-xl mb-2">🚀</p>
        <p>Roadmap visualization loading...</p>
      </div>
    </div>
  );
}

function AnimatedSphere({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
        />
      </mesh>
    </Float>
  );
}

function ConnectionLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const points = [start, end];

  return (
    <Line
      points={points}
      color="#14F195"
      lineWidth={1}
      dashed={false}
    />
  );
}

function RoadmapNode({
  position,
  title,
  status
}: {
  position: [number, number, number];
  title: string;
  status: 'completed' | 'inProgress' | 'upcoming';
}) {
  const color = status === 'completed' ? '#14F195' : status === 'inProgress' ? '#9945FF' : '#666666';

  return (
    <group position={position}>
      <AnimatedSphere position={[0, 0, 0]} color={color} />
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {title}
      </Text>
      {status === 'completed' && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="#14F195"
          anchorX="center"
          anchorY="middle"
        >
          ✓
        </Text>
      )}
    </group>
  );
}

function Scene() {
  const roadmapData = [
    { position: [-8, 2, 0] as [number, number, number], title: 'Q4 2024\nPlatform Launch', status: 'completed' as const },
    { position: [-5, 0, 0] as [number, number, number], title: 'Q1 2025\nAI Trading Agents', status: 'completed' as const },
    { position: [-2, 2, 0] as [number, number, number], title: 'Q2 2025\nSubagent System', status: 'inProgress' as const },
    { position: [1, 0, 0] as [number, number, number], title: 'Q2 2025\nNFT Collection', status: 'inProgress' as const },
    { position: [4, 2, 0] as [number, number, number], title: 'Q3 2025\nSocial Trading', status: 'upcoming' as const },
    { position: [7, 0, 0] as [number, number, number], title: 'Q4 2025\nDAO Governance', status: 'upcoming' as const },
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9945FF" />

      {/* Connection Lines */}
      {roadmapData.slice(0, -1).map((node, i) => (
        <ConnectionLine
          key={i}
          start={node.position}
          end={roadmapData[i + 1].position}
        />
      ))}

      {/* Roadmap Nodes */}
      {roadmapData.map((node, i) => (
        <RoadmapNode
          key={i}
          position={node.position}
          title={node.title}
          status={node.status}
        />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

export default function RoadmapScene() {
  try {
    return (
      <div className="w-full h-[600px] bg-black rounded-2xl overflow-hidden">
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('RoadmapScene error:', error);
    return <ErrorFallback />;
  }
}
