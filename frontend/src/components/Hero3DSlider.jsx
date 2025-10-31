import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// 3D Temple Model Component (Placeholder geometry)
function TempleModel({ isHistorical = true }) {
  const groupRef = useRef();
  const [autoRotate, setAutoRotate] = useState(true);
  
  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });
  
  const baseColor = isHistorical ? '#D4AF37' : '#8B8680';
  const weathering = isHistorical ? 0 : 0.5;
  
  return (
    <group 
      ref={groupRef}
      position={[0, -1, 0]}
      onClick={() => setAutoRotate(false)}
    >
      {/* Main temple base */}
      <Box args={[3, 0.5, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color={baseColor} metalness={0.3} roughness={0.7 + weathering} />
      </Box>
      
      {/* Temple pillars */}
      {[[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1]].map((pos, i) => (
        <Cylinder key={i} args={[0.2, 0.2, 2]} position={pos}>
          <meshStandardMaterial color={baseColor} metalness={0.2} roughness={0.8 + weathering} />
        </Cylinder>
      ))}
      
      {/* Temple dome/roof */}
      <Sphere args={[1.5, 32, 32]} position={[0, 2, 0]} scale={[1, 0.6, 1]}>
        <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.6 + weathering} />
      </Sphere>
      
      {/* Decorative top */}
      <Cylinder args={[0.3, 0.3, 0.8]} position={[0, 3, 0]}>
        <meshStandardMaterial color={baseColor} metalness={0.5} roughness={0.5} />
      </Cylinder>
      
      {/* Ground plane shadow receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

// Then/Now 3D Comparison Slider Component
function Hero3DSlider({ site }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  
  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };
  
  const resetSlider = () => setSliderPosition(50);
  
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[60vh] overflow-hidden bg-gray-900"
      onTouchMove={handleTouchMove}
    >
      {/* Left side: Historical 3D Model */}
      <div 
        className="absolute inset-0" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Canvas
          shadows
          camera={{ position: [5, 3, 5], fov: 50 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.2}
            color="#FFD700"
            castShadow
          />
          <spotLight position={[-5, 5, 0]} intensity={0.5} color="#FFA500" />
          <TempleModel isHistorical={true} />
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={15}
            autoRotateSpeed={1}
          />
        </Canvas>
        
        <div className="absolute top-4 left-4 bg-black bg-opacity-60 px-4 py-2 rounded-md">
          <p className="text-[#D4AF37] font-serif text-lg">1500s - {site?.name || 'Virupaksha Temple'} in Glory</p>
        </div>
      </div>
      
      {/* Right side: Current State */}
      <div 
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <Canvas
          shadows
          camera={{ position: [5, 3, 5], fov: 50 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={0.8}
            color="#FFFFFF"
            castShadow
          />
          <TempleModel isHistorical={false} />
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
        
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 px-4 py-2 rounded-md">
          <p className="text-gray-300 font-serif text-lg">2024 - Hampi Ruins Today</p>
        </div>
      </div>
      
      {/* Draggable Divider */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-[#D4AF37] cursor-col-resize z-10"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg cursor-col-resize">
          <ChevronLeft className="w-4 h-4 text-white absolute left-1" />
          <ChevronRight className="w-4 h-4 text-white absolute right-1" />
        </div>
      </div>
      
      {/* Reset Button */}
      <button
        onClick={resetSlider}
        className="absolute bottom-4 right-4 bg-[#D4AF37] hover:bg-[#C79F1F] text-white p-2 rounded-full shadow-lg transition-all"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      
      {/* Labels */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-sm">
        <span className="text-[#D4AF37] font-serif">1500s</span>
        <span className="text-gray-400">Drag to compare</span>
        <span className="text-gray-300 font-serif">2024</span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="bg-black bg-opacity-70 px-4 py-2 rounded-md text-white text-sm"
        >
          Drag to rotate • Scroll to zoom • Double-click to reset
        </motion.div>
      </div>
    </div>
  );
}

export default Hero3DSlider;