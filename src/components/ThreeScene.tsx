'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
export default function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    torus: THREE.Mesh;
    moon: THREE.Mesh;
    rocket: THREE.Sprite;
    emoji: THREE.Mesh;
    stars: THREE.Points;
    controls: OrbitControls;
    textCards: THREE.Group[];
    floatingTexts: THREE.Object3D[];
  } | null>(null);


  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(30);
    camera.position.setX(-3);

    // Torus
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshNormalMaterial();
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    // Lights
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 5, 5);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(pointLight, ambientLight);

    // ========================================================
    // Ground grid + axis helpers
    // ========================================================
    // const lightHelper = new THREE.PointLightHelper(pointLight);

    // Softer grid: low‑opacity lines, slightly stronger center (axis) line
    const gridSize = 200;
    const gridDivisions = 50;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);

    const gridMaterial = gridHelper.material;
    if (Array.isArray(gridMaterial)) {
      gridMaterial.forEach((mat, index) => {
        if (mat instanceof THREE.LineBasicMaterial) {
          mat.transparent = true;
          // Soften all grid lines, keep center lines slightly stronger
          mat.opacity = index === 0 ? 0.28 : 0.1;
        }
      });
    } else if (gridMaterial instanceof THREE.LineBasicMaterial) {
      gridMaterial.transparent = true;
      gridMaterial.opacity = 0.15;
    }

    scene.add(gridHelper);

    // 3 main axes (X, Y, Z) + extra top/bottom Y axis.
    // All axes share the same color and are just a bit brighter than the grid.
    const axisColor = 0xaaaaaa;
    const axisLength = gridSize * 0.4;

    const axisMaterial = new THREE.LineBasicMaterial({
      color: axisColor,
      transparent: true,
      opacity: 0.45,
    });

    const axisYOffset = 0.01; // small lift above grid to avoid z-fighting flicker

    // X axis
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLength / 2, axisYOffset, 0),
      new THREE.Vector3(axisLength / 2, axisYOffset, 0),
    ]);
    const xAxis = new THREE.Line(xAxisGeometry, axisMaterial);
    scene.add(xAxis);

    // Z axis
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, axisYOffset, -axisLength / 2),
      new THREE.Vector3(0, axisYOffset, axisLength / 2),
    ]);
    const zAxis = new THREE.Line(zAxisGeometry, axisMaterial);
    scene.add(zAxis);

    // Y axis (single line, extends above and below the grid a bit)
    const yAxisHeight = axisLength * 1.4;
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -yAxisHeight / 2, 0),
      new THREE.Vector3(0, yAxisHeight / 2, 0),
    ]);
    const yAxis = new THREE.Line(yAxisGeometry, axisMaterial);
    scene.add(yAxis);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 75;
    

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    
    const posArray = new Float32Array(starCount * 3);
    
    for(let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200; // Spread over larger area
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create a circular star texture
    function createStarTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    }

    const starMaterial = new THREE.PointsMaterial({
      size: 0.7,
      map: createStarTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Background
    const textureLoader = new THREE.TextureLoader();
    const spaceTexture = textureLoader.load(
      '/images/space.jpg',
      undefined,
      undefined,
      (error) => {
        console.error('Error loading space texture:', error);
      }
    );
    scene.background = spaceTexture;

    // Avatar
    const emojiTexture = textureLoader.load(
      '/images/shrug.png',
      undefined,
      undefined,
      (error) => {
        console.error('Error loading emoji texture:', error);
      }
    );
    const emoji = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.MeshBasicMaterial({ map: emojiTexture })
    );
    scene.add(emoji);

    // Moon
    const moonTexture = textureLoader.load(
      '/images/moon.jpg',
      undefined,
      undefined,
      (error) => {
        console.error('Error loading moon texture:', error);
      }
    );
    const normalTexture = textureLoader.load(
      '/images/normal.jpg',
      undefined,
      undefined,
      (error) => {
        console.error('Error loading normal texture:', error);
      }
    );
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(3, 32, 32),
      new THREE.MeshStandardMaterial({
        map: moonTexture,
        normalMap: normalTexture,
      })
    );
    scene.add(moon);

    moon.position.z = 30;
    moon.position.setX(-10);

    // 🚀 Rocket sprite next to the moon
    function createEmojiSprite(emoji: string, size = 2) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) return null;

      // Transparent background
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Big emoji, centered
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '200px "Apple Color Emoji", "Segoe UI Emoji", system-ui, sans-serif';
      context.fillText(emoji, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(size, size, size);
      return sprite;
    }

    const rocket = createEmojiSprite('🚀', 3);
    if (rocket) {
      rocket.position.set(moon.position.x - 6, moon.position.y + 2, moon.position.z + 1);
      scene.add(rocket);
    }

    // Center emoji within torus ring
    emoji.position.z = 0;
    emoji.position.x = 0;
    emoji.position.y = 0;

    // Create 3D Text Cards (boxes with depth)
    function createTextTexture(text: string, bgColor = 'rgba(20, 20, 20, 0.9)') {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;

      canvas.width = 512;
      canvas.height = 512;

      // Background
      context.fillStyle = bgColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      context.lineWidth = 6;
      context.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

      // Text
      context.fillStyle = '#ffffff';
      context.font = 'bold 36px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const words = text.split('\n');
      const lineHeight = 45;
      const startY = canvas.height / 2 - (words.length * lineHeight) / 2;

      words.forEach((line, i) => {
        context.fillText(line, canvas.width / 2, startY + i * lineHeight);
      });

      return new THREE.CanvasTexture(canvas);
    }

    function create3DCard(frontText: string, sideColor: number, position: THREE.Vector3, rotation: THREE.Euler) {
      const group = new THREE.Group();
      
      // Create box geometry with depth
      const depth = 1;
      const width = 8;
      const height = 8;
      
      // Front face with text
      const frontTexture = createTextTexture(frontText);
      const materials = [
        new THREE.MeshStandardMaterial({ color: sideColor, metalness: 0.3, roughness: 0.7 }), // right
        new THREE.MeshStandardMaterial({ color: sideColor, metalness: 0.3, roughness: 0.7 }), // left
        new THREE.MeshStandardMaterial({ color: sideColor, metalness: 0.3, roughness: 0.7 }), // top
        new THREE.MeshStandardMaterial({ color: sideColor, metalness: 0.3, roughness: 0.7 }), // bottom
        new THREE.MeshStandardMaterial({ map: frontTexture, metalness: 0.1, roughness: 0.8 }), // front
        new THREE.MeshStandardMaterial({ map: frontTexture, metalness: 0.1, roughness: 0.8 }), // back (mirrored content)
      ];
      
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const box = new THREE.Mesh(geometry, materials);
      
      // Add edge glow
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true })
      );
      
      group.add(box);
      group.add(line);
      group.position.copy(position);
      group.rotation.copy(rotation);
      
      return group;
    }

    // Camera viewpoints for each card - more frontal views
    const viewpoints = [
      { pos: new THREE.Vector3(-3, 0, 30), target: new THREE.Vector3(0, 0, 0) }, // Overview
      { pos: new THREE.Vector3(-20, 5, 20), target: new THREE.Vector3(-20, 5, 10) }, // Card 1 - frontal
      { pos: new THREE.Vector3(20, 8, 15), target: new THREE.Vector3(20, 8, 5) }, // Card 2 - frontal
      { pos: new THREE.Vector3(15, -8, 25), target: new THREE.Vector3(15, -8, 15) }, // Card 3 - frontal
      { pos: new THREE.Vector3(-18, -5, 30), target: new THREE.Vector3(-18, -5, 20) }, // Card 4 - frontal
      { pos: new THREE.Vector3(0, -12, 35), target: new THREE.Vector3(0, -12, 25) }, // Thanks card (Card 5) - frontal
      // Moon close-up
      { pos: new THREE.Vector3(-18, 5, 40), target: new THREE.Vector3(-10, 0, 30) }, // Moon
    ];

    // Add 3D cards to scene
    const textCards: THREE.Group[] = [];
    const floatingTexts: THREE.Object3D[] = [];
    
    const card1 = create3DCard(
      '📜 Manifesto:\n\nI like to make stuff,\n put it on the internet',
      0x1a1a2e,
      new THREE.Vector3(-20, 5, 10),
      new THREE.Euler(0.1, 0, 0.05)
    );
    scene.add(card1);
    textCards.push(card1);

    const card2 = create3DCard(
      '👩🏽‍🚀 Tech Stack:\n\nNext.js\nThree.js\n3D Animations',
      0x16213e,
      new THREE.Vector3(20, 8, 5),
      new THREE.Euler(-0.1, 0, -0.05)
    );
    scene.add(card2);
    textCards.push(card2);

    const card3 = create3DCard(
      '🏆 Accomplishments:\n\nBuilding and deploying\ncool things that work',
      0x0f3460,
      new THREE.Vector3(15, -8, 15),
      new THREE.Euler(0.15, 0, 0.1)
    );
    scene.add(card3);
    textCards.push(card3);

    const card4 = create3DCard(
      '🌮 Work History:\n\nTaco Bell\nMcDonalds\nBurger King',
      0x533483,
      new THREE.Vector3(-18, -5, 20),
      new THREE.Euler(-0.1, 0, -0.08)
    );
    scene.add(card4);
    textCards.push(card4);

    const card5 = create3DCard(
      'Thanks 👏\nfor exploring!',
      0x2d4059,
      new THREE.Vector3(0, -12, 25),
      new THREE.Euler(0, 0, 0)
    );
    scene.add(card5);
    textCards.push(card5);

    // Create real 3D extruded text using TextGeometry
    const fontLoader = new FontLoader();
    fontLoader.load(
      '/fonts/helvetiker_regular.typeface.json',
      (font) => {
        // Create colorful gradient texture
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
          const gradient = context.createLinearGradient(0, 0, 128, 128);
          gradient.addColorStop(0, '#fef9c3'); // Lightest yellow (Yellow-100)
          gradient.addColorStop(0.5, '#fde047'); // Bright yellow (Yellow-300)
          gradient.addColorStop(1, '#eab308'); // Deep yellow (Yellow-500)
          context.fillStyle = gradient;
          context.fillRect(0, 0, 128, 128);
        }
        const texture = new THREE.CanvasTexture(canvas);

        // Create material - holographic/colorful look
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          color: 0xffffff,
          roughness: 0.4, // Slightly rougher for matte look
          metalness: 0.2, // Less metallic
          emissive: 0xfef08a, // Soft yellow glow
          emissiveIntensity: 0.3,
        });

        // Create text group for multi-line text
        const textGroup = new THREE.Group();
        const lines = ['Hello traveler','welcome to my', '3D domain'];
        const lineHeight = 0.5; // Reduced spacing
        let totalHeight = 0;

        // First pass: calculate total height
        lines.forEach((line) => {
          const tempGeo = new TextGeometry(line, {
            font: font,
            size: 0.7,
            depth: 0.3,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.06,
            bevelSegments: 4,
          });
          tempGeo.computeBoundingBox();
          if (tempGeo.boundingBox) {
            totalHeight += tempGeo.boundingBox.max.y - tempGeo.boundingBox.min.y + lineHeight;
          }
        });

        // Second pass: create and position each line
        let currentY = totalHeight / 2;
        lines.forEach((line) => {
          const geometry = new TextGeometry(line, {
            font: font,
            size: 0.7,
            depth: 0.3,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03, // Thinner bevel
            bevelSize: 0.02, // Smaller bevel size
            bevelSegments: 5,
          });

          geometry.computeBoundingBox();
          if (geometry.boundingBox) {
            const centerOffsetX = -0.5 * (geometry.boundingBox.max.x + geometry.boundingBox.min.x);
            const centerOffsetY = -0.5 * (geometry.boundingBox.max.y + geometry.boundingBox.min.y);
            const centerOffsetZ = -0.5 * (geometry.boundingBox.max.z + geometry.boundingBox.min.z);
            geometry.translate(centerOffsetX, centerOffsetY, centerOffsetZ);
          }

          // Create faint black outline by duplicating geometry slightly larger
          const outlineGeometry = geometry.clone();
          outlineGeometry.scale(1.05, 1.05, 1.05); // Larger for outline
          const outlineMaterial = new THREE.MeshBasicMaterial({ // Basic material for solid black
            color: 0x000000,
            opacity: 0.3, // Faint outline
            transparent: true,
            side: THREE.BackSide, // Only render back faces for outline effect
          });
          const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
          outlineMesh.position.y = currentY - (geometry.boundingBox ? (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2 : 0);
          outlineMesh.position.z = -0.05; // More separation
          textGroup.add(outlineMesh);
          
          // White text on top
          const textMaterial = material.clone();
          const textMesh = new THREE.Mesh(geometry, textMaterial);
          textMesh.position.y = currentY - (geometry.boundingBox ? (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2 : 0);
          textMesh.position.z = 0; // In front
          currentY -= (geometry.boundingBox ? (geometry.boundingBox.max.y - geometry.boundingBox.min.y) : 0) + lineHeight;
          textGroup.add(textMesh);
        });

        // Position text above emoji, within torus ring
        textGroup.position.set(0, 4, 0);
        textGroup.rotation.set(0.1, -0.3, 0);
        
        scene.add(textGroup);
        floatingTexts.push(textGroup);
      },
      undefined,
      (error) => {
        console.error('Error loading font for 3D headline:', error);
      }
    );

    // Store refs for cleanup and animation
    sceneRef.current = {
      scene,
      camera,
      renderer,
      torus,
      moon,
      rocket: rocket || new THREE.Sprite(), // fallback to keep type happy, never used
      emoji,
      stars,
      controls,
      textCards,
      floatingTexts,
    };

    // Camera transition function
    let transitionId: number | undefined;
    const transitionCamera = (targetPos: THREE.Vector3, targetLookAt: THREE.Vector3, duration = 1500) => {
      if (transitionId) cancelAnimationFrame(transitionId);

      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();
      const startTime = Date.now();

      const animateTransition = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        camera.position.lerpVectors(startPos, targetPos, eased);
        controls.target.lerpVectors(startTarget, targetLookAt, eased);
        controls.update();

        if (progress < 1) {
          transitionId = requestAnimationFrame(animateTransition);
        } else {
          transitionId = undefined;
        }
      };

      animateTransition();
    };

    // Expose navigation function
    interface WindowWithNav extends Window {
      navigateToView?: (index: number) => void;
    }
    (window as WindowWithNav).navigateToView = (index: number) => {
      if (index >= 0 && index < viewpoints.length) {
        const vp = viewpoints[index];
        transitionCamera(vp.pos, vp.target);
      }
    };

    // Animation Loop
    let animationId: number | undefined;
    let time = 0;
    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.01;
      
      if (sceneRef.current) {
        // Rotate torus
        sceneRef.current.torus.rotation.x += 0.01;
        sceneRef.current.torus.rotation.y += 0.005;
        sceneRef.current.torus.rotation.z += 0.01;
        sceneRef.current.moon.rotation.x += 0.005;
        // Subtle bob + keep rocket sprite aimed toward the moon (if it exists)
        if (sceneRef.current.rocket) {
          const { rocket, moon, camera } = sceneRef.current;

          // Bob around a baseline offset from the moon
          rocket.position.y =
            moon.position.y + 2 + Math.sin(time * 2) * 0.5;

          // Compute screen-space direction from rocket to moon
          const rocketScreen = rocket.position.clone().project(camera);
          const moonScreen = moon.position.clone().project(camera);
          const dx = moonScreen.x - rocketScreen.x;
          const dy = moonScreen.y - rocketScreen.y;

          // Angle in screen space so sprite "points" at the moon
          const angle = Math.atan2(dy, dx);

          // Rotate sprite so its top-right quadrant roughly aims toward the moon
          (rocket.material as THREE.SpriteMaterial).rotation = angle - Math.PI * 0.25;
        }
        
        // Animate stars
        sceneRef.current.stars.rotation.y += 0.0005;
        sceneRef.current.stars.rotation.x += 0.0002;
        
        // Animate text cards - floating, bobbing, rotating
        sceneRef.current.textCards.forEach((card, index) => {
          // Each card has different animation timing
          const offset = index * 0.5;
          
          // Floating up and down
          card.position.y += Math.sin(time + offset) * 0.003;
          
          // Gentle rotation
          card.rotation.y += Math.sin(time * 0.5 + offset) * 0.002;
          card.rotation.x += Math.cos(time * 0.3 + offset) * 0.001;
          
          // Slight scale pulse
          const scale = 1 + Math.sin(time * 2 + offset) * 0.02;
          card.scale.set(scale, scale, scale);
        });
        
        // Animate floating texts
        sceneRef.current.floatingTexts.forEach((text) => {
          // Gentle floating
          text.position.y += Math.sin(time * 1.5) * 0.005;
          // Always look slightly at camera logic could go here, but gentle rotation is nice
          text.rotation.z = Math.sin(time) * 0.02;
        });
        
        sceneRef.current.controls.update();
        sceneRef.current.renderer.render(
          sceneRef.current.scene,
          sceneRef.current.camera
        );
      }
    }
    animate();

    // Handle resize
    function handleResize() {
      if (sceneRef.current) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (sceneRef.current) {
        // Dispose of controls
        sceneRef.current.controls.dispose();
        // Dispose of geometries and materials
        sceneRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        sceneRef.current.renderer.dispose();
        sceneRef.current.scene.clear();
      }
    };
  }, []);

  return <canvas id="bg" ref={canvasRef} />;
}

