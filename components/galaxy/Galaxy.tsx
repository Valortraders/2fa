'use client';

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

const vertexShader = `
uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aVelocity;
attribute float aOffset;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Spiral movement
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float rotationSpeed = (1.0 / (distanceToCenter + 1.0)) * uTime * 0.1;
    
    // Unique particle movement
    modelPosition.x += sin(uTime * aVelocity.x + aOffset) * 0.1 * distanceToCenter;
    modelPosition.y += cos(uTime * aVelocity.y + aOffset) * 0.1;
    modelPosition.z += sin(uTime * aVelocity.z + aOffset) * 0.1 * distanceToCenter;
    
    // Rotate around center
    float newX = modelPosition.x * cos(rotationSpeed) - modelPosition.z * sin(rotationSpeed);
    float newZ = modelPosition.x * sin(rotationSpeed) + modelPosition.z * cos(rotationSpeed);
    modelPosition.x = newX;
    modelPosition.z = newZ;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Dynamic point size
    float size = uSize * aScale;
    size *= (1.0 / -viewPosition.z);
    gl_PointSize = size;

    // Pass color and alpha to fragment shader
    vColor = color;
    vAlpha = 1.0 - (distanceToCenter / 5.0);
    vAlpha = clamp(vAlpha, 0.1, 1.0);
}
`;

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
    // Soft particle effect
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
    strength = pow(strength, 3.0);

    // Final color with soft edges
    vec3 finalColor = vColor * strength;
    float alpha = strength * vAlpha;
    
    gl_FragColor = vec4(finalColor, alpha * 0.8);
}
`;

const Galaxy: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, -2, 6);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Galaxy parameters
    const parameters = theme === 'dark' ? {
      count: 100000,
      radius: 9,
      branches: 4,
      spin: 1,
      randomness: 0.6,
      randomnessPower: 4,
      insideColor: theme === 'dark' ? '#4c1d95' : '#ffffff', // Deep purple to white-ish purple
      outsideColor: theme === 'dark' ? '#f0abfc' : '#1d6ae5', // Light pink to very light pink
      particleSize: 45,
      opacity: theme === 'dark' ? 0.8 : 1.0,
      verticalSpread: 1.5,
      depthFactor: 2,
    } : {
      count: 100000,
      radius: 6,
      branches: 4,
      spin: 1,
      randomness: 0.6,
      randomnessPower: 4,
      insideColor: theme === 'dark' ? '#4c1d95' : '#ffffff', // Deep purple to white-ish purple
      outsideColor: theme === 'dark' ? '#f0abfc' : '#1d6ae5', // Light pink to very light pink
      particleSize: 45,
      opacity: theme === 'dark' ? 0.8 : 1.0,
      verticalSpread: 1.5,
      depthFactor: 2,
    };

    // Create galaxy
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count);
    const velocities = new Float32Array(parameters.count * 3);
    const offsets = new Float32Array(parameters.count);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      // Position with enhanced depth
      const radius = Math.random() * parameters.radius;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
      const spinAngle = radius * parameters.spin;

      // Add vertical displacement based on radius
      const verticalDisplacement = (
        Math.pow(Math.random(), 2) * parameters.verticalSpread * 
        (Math.random() < 0.5 ? 1 : -1) * 
        (radius / parameters.radius)
      );

      // Enhanced randomness with depth variation
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * 
        (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * 
        (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * 
        (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius * parameters.depthFactor;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = verticalDisplacement + randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color with enhanced mixing for better visibility
      const mixedColor = insideColor.clone();
      const mixFactor = radius / parameters.radius;
      mixedColor.lerp(outsideColor, mixFactor);

      // Enhance color intensity for light mode
      if (theme === 'light') {
        mixedColor.multiplyScalar(1.2); // Boost color intensity
      }

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Scales and movement
      scales[i] = Math.random() * 2 + (theme === 'light' ? 1.0 : 0.5); // Larger base size in light mode
      velocities[i3] = Math.random() * 2 - 1;
      velocities[i3 + 1] = Math.random() * 2 - 1;
      velocities[i3 + 2] = Math.random() * 2 - 1;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

    // Material with adjusted opacity and size
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: parameters.particleSize * renderer.getPixelRatio() },
      },
    });

    // Points
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation
    const clock = new THREE.Clock();

    // Add these constants for controlling movement
    const VERTICAL_RANGE = 8; // How far up and down the galaxy moves
    const VERTICAL_SPEED = 0.15; // Speed of vertical movement
    const ROTATION_SPEED = 0.1; // Existing rotation speed

    // Modify the animate function
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Calculate vertical position using sine wave
      const verticalPosition = Math.sin(elapsedTime * VERTICAL_SPEED) * VERTICAL_RANGE;

      // Update entire scene position
      scene.position.y = verticalPosition;

      // Camera movement
      const angle = elapsedTime * ROTATION_SPEED;
      const radius = 6 + Math.sin(elapsedTime * 0.2) * 0.5;
      
      // Adjust camera to follow the galaxy's vertical movement
      camera.position.x = Math.cos(angle) * radius;
      camera.position.z = Math.sin(angle) * radius;
      camera.position.y = -2 + verticalPosition + Math.sin(elapsedTime * 0.3) * 0.5;
      
      // Update look-at point to follow galaxy
      const lookAtY = 1 + verticalPosition;
      camera.lookAt(0, lookAtY, 0);

      // Update uniforms for particle animation
      material.uniforms.uTime.value = elapsedTime;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

export default Galaxy;
