'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

export function AbstractBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, systemTheme } = useTheme();
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create particles
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Get current theme
    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    // Color values for light/dark mode
    const colorValues = isDark ? {
      r: 0.12,  // Subtle blue for dark mode
      g: 0.45,
      b: 0.9,
      opacity: 0.8,
      size: 0.05
    } : {
      r: 0.1,   // Dark blue for light mode
      g: 0.2,
      b: 0.4,
      opacity: 0.15,  // Lower opacity for light mode
      size: 0.15     // Larger particles for light mode
    };

    for (let i = 0; i < particleCount; i++) {
      // Spread particles in a flatter, wider field
      positions[i * 3] = (Math.random() - 0.5) * 15;     // wider x spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;  // flatter y spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // normal z spread

      colors[i * 3] = colorValues.r;
      colors[i * 3 + 1] = colorValues.g;
      colors[i * 3 + 2] = colorValues.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: colorValues.size,
      vertexColors: true,
      transparent: true,
      opacity: colorValues.opacity,
      blending: isDark ? THREE.AdditiveBlending : THREE.MultiplyBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    camera.position.z = 5;

    // Store refs for theme updates
    pointsRef.current = points;
    materialRef.current = material;

    // Animation
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Slower, more subtle rotation
      points.rotation.x += 0.0005;
      points.rotation.y += 0.001;

      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // More subtle wave movement
        positions[i + 1] += Math.sin(Date.now() * 0.0005 + positions[i]) * 0.001;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [theme, systemTheme]); // Re-run effect when theme changes

  // Update material when theme changes
  useEffect(() => {
    if (!materialRef.current) return;

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    const colorValues = isDark ? {
      r: 0.12,
      g: 0.45,
      b: 0.9,
      opacity: 0.8,
      size: 0.05
    } : {
      r: 0.1,
      g: 0.2,
      b: 0.4,
      opacity: 0.15,
      size: 0.15
    };

    materialRef.current.opacity = colorValues.opacity;
    materialRef.current.size = colorValues.size;
    materialRef.current.blending = isDark ? THREE.AdditiveBlending : THREE.MultiplyBlending;
    materialRef.current.needsUpdate = true;

    if (pointsRef.current) {
      const colors = new Float32Array(2000 * 3);
      for (let i = 0; i < 2000; i++) {
        colors[i * 3] = colorValues.r;
        colors[i * 3 + 1] = colorValues.g;
        colors[i * 3 + 2] = colorValues.b;
      }
      pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [theme, systemTheme]);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
} 