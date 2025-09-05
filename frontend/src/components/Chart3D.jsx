import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const Chart3DBar = ({ data, xAxis, yAxis, zAxis }) => {
  const meshRef = useRef();
  const [hoveredBar, setHoveredBar] = useState(null);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const maxY = Math.max(...data.map(d => parseFloat(d[yAxis]) || 0));
    const maxZ = zAxis ? Math.max(...data.map(d => parseFloat(d[zAxis]) || 0)) : 1;
    
    return data.slice(0, 20).map((item, index) => ({
      x: index * 2,
      y: (parseFloat(item[yAxis]) || 0) / maxY * 5,
      z: zAxis ? (parseFloat(item[zAxis]) || 0) / maxZ * 3 : 0,
      label: item[xAxis]?.toString().substring(0, 10) || `Item ${index}`,
      value: parseFloat(item[yAxis]) || 0,
      zValue: zAxis ? parseFloat(item[zAxis]) || 0 : 0,
      originalIndex: index
    }));
  }, [data, xAxis, yAxis, zAxis]);

  const BarMesh = ({ item, color }) => {
    const ref = useRef();
    const [hovered, setHovered] = useState(false);
    
    useFrame((state) => {
      if (hovered && ref.current) {
        ref.current.scale.setScalar(1.1);
        ref.current.material.emissive.setHex(0x444444);
      } else if (ref.current) {
        ref.current.scale.setScalar(1);
        ref.current.material.emissive.setHex(0x000000);
      }
    });

    return (
      <group position={[item.x, item.y / 2, item.z]}>
        <Box
          ref={ref}
          args={[1.5, item.y || 0.1, zAxis ? 1.5 : 0.5]}
          onPointerOver={() => {
            setHovered(true);
            setHoveredBar(item);
          }}
          onPointerOut={() => {
            setHovered(false);
            setHoveredBar(null);
          }}
        >
          <meshStandardMaterial color={color} />
        </Box>
        <Text
          position={[0, -0.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {item.label}
        </Text>
        {hovered && (
          <Text
            position={[0, item.y + 1, 0]}
            fontSize={0.4}
            color="yellow"
            anchorX="center"
            anchorY="middle"
          >
            {item.value.toFixed(2)}
          </Text>
        )}
      </group>
    );
  };

  return (
    <group>
      {processedData.map((item, index) => (
        <BarMesh
          key={index}
          item={item}
          color={`hsl(${(index * 360) / processedData.length}, 70%, 60%)`}
        />
      ))}
      
      {/* Axes */}
      <Line
        points={[[-5, 0, 0], [processedData.length * 2 + 5, 0, 0]]}
        color="white"
        lineWidth={2}
      />
      <Line
        points={[[0, -1, 0], [0, 6, 0]]}
        color="white"
        lineWidth={2}
      />
      {zAxis && (
        <Line
          points={[[0, 0, -2], [0, 0, 4]]}
          color="white"
          lineWidth={2}
        />
      )}
      
      {/* Axis Labels */}
      <Text
        position={[processedData.length, -1, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        {xAxis}
      </Text>
      <Text
        position={[-1, 3, 0]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        {yAxis}
      </Text>
      {zAxis && (
        <Text
          position={[0, -1, 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
        >
          {zAxis}
        </Text>
      )}
    </group>
  );
};

const Chart3DScatter = ({ data, xAxis, yAxis, zAxis }) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const xValues = data.map(d => parseFloat(d[xAxis]) || 0);
    const yValues = data.map(d => parseFloat(d[yAxis]) || 0);
    const zValues = zAxis ? data.map(d => parseFloat(d[zAxis]) || 0) : [];
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = zAxis ? Math.min(...zValues) : 0;
    const zMax = zAxis ? Math.max(...zValues) : 1;
    
    return data.slice(0, 50).map((item, index) => ({
      x: ((parseFloat(item[xAxis]) || 0) - xMin) / (xMax - xMin) * 10 - 5,
      y: ((parseFloat(item[yAxis]) || 0) - yMin) / (yMax - yMin) * 8 - 4,
      z: zAxis ? ((parseFloat(item[zAxis]) || 0) - zMin) / (zMax - zMin) * 6 - 3 : 0,
      xValue: parseFloat(item[xAxis]) || 0,
      yValue: parseFloat(item[yAxis]) || 0,
      zValue: zAxis ? parseFloat(item[zAxis]) || 0 : 0,
      index
    }));
  }, [data, xAxis, yAxis, zAxis]);

  const ScatterPoint = ({ item, color }) => {
    const ref = useRef();
    const [hovered, setHovered] = useState(false);
    
    useFrame(() => {
      if (ref.current) {
        ref.current.rotation.y += 0.01;
      }
    });

    return (
      <Sphere
        ref={ref}
        position={[item.x, item.y, item.z]}
        args={[0.1, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.5 : 1}
      >
        <meshStandardMaterial color={color} emissive={hovered ? 0x444444 : 0x000000} />
        {hovered && (
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.2}
            color="yellow"
            anchorX="center"
          >
            {`(${item.xValue.toFixed(1)}, ${item.yValue.toFixed(1)}${zAxis ? `, ${item.zValue.toFixed(1)}` : ''})`}
          </Text>
        )}
      </Sphere>
    );
  };

  return (
    <group>
      {processedData.map((item, index) => (
        <ScatterPoint
          key={index}
          item={item}
          color={`hsl(${(index * 360) / processedData.length}, 70%, 60%)`}
        />
      ))}
      
      {/* Axes */}
      <Line points={[[-6, 0, 0], [6, 0, 0]]} color="white" lineWidth={2} />
      <Line points={[[0, -5, 0], [0, 5, 0]]} color="white" lineWidth={2} />
      {zAxis && <Line points={[[0, 0, -4], [0, 0, 4]]} color="white" lineWidth={2} />}
      
      {/* Labels */}
      <Text position={[6.5, 0, 0]} fontSize={0.4} color="white">{xAxis}</Text>
      <Text position={[0, 5.5, 0]} fontSize={0.4} color="white">{yAxis}</Text>
      {zAxis && <Text position={[0, 0, 4.5]} fontSize={0.4} color="white">{zAxis}</Text>}
    </group>
  );
};

const Chart3D = ({ data, xAxis, yAxis, zAxis, chartType = 'bar' }) => {
  if (!data || data.length === 0 || !xAxis || !yAxis) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        <div>Select data columns to display 3D visualization</div>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%', background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        {chartType === 'scatter' ? (
          <Chart3DScatter data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} />
        ) : (
          <Chart3DBar data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} />
        )}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
};

export default Chart3D;
