import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { useRef } from 'react';

function FloatingShape({ color, position, scale }) {
  return (
    <Float speed={1.6} rotationIntensity={0.9} floatIntensity={2.4}>
      <mesh position={position} scale={scale} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} roughness={0.2} metalness={0.1} />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-[320px] md:h-[420px] relative">
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.45} />
        <FloatingShape color="#a855f7" position={[-2, 0, 0]} scale={1.2} />
        <FloatingShape color="#06b6d4" position={[2, 1, 0]} scale={1.1} />
        <FloatingShape color="#f472b6" position={[0, -1.5, 0]} scale={1.3} />
      </Canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 text-transparent bg-clip-text drop-shadow-lg mb-2 animate-fade-in">CloudShare</h1>
        <p className="text-lg md:text-xl text-white/80 font-medium animate-fade-in">Futuristic Cloud File Sharing Platform</p>
      </div>
    </div>
  );
}
