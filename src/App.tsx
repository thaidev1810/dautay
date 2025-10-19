import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import OrbitingPhotos from "./components/OrbitingPhotos";
import { AudioListener, AudioLoader, Audio } from "three";

const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Mặc định là false
  const soundRef = useRef<Audio | null>(null);
  const isPlayingRef = useRef(false); // Mặc định là false
  const [] = useState(false);
  const audioBufferRef = useRef<AudioBuffer | null>(null); // Lưu trữ audio buffer

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0016);

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 50);

    // 🎵 Audio setup - KHÔNG tự động phát
    const listener = new AudioListener();
    camera.add(listener);
    const sound = new Audio(listener);
    soundRef.current = sound;
    isPlayingRef.current = false;

    const audioLoader = new AudioLoader();

    // Chỉ load nhạc nhưng không tự động phát
    const loadMusic = () => {
      try {
        audioLoader.load("/assets/a.mp3", (buffer) => {
          audioBufferRef.current = buffer; // Lưu buffer để dùng sau
          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.setVolume(0.5);
          console.log("🎵 Nhạc đã được load sẵn sàng");
        });
      } catch (err) {
        console.warn("⚠️ Lỗi load nhạc:", err);
      }
    };

    // Hàm phát nhạc khi người dùng yêu cầu

    // Hàm dừng nhạc

    // Load nhạc khi component mount
    loadMusic();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);

    // Enhanced Lighting with more contrast
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const pinkLight = new THREE.PointLight(0xff3366, 6, 100);
    pinkLight.position.set(15, 25, 35);
    const blueLight = new THREE.PointLight(0x3366ff, 4, 100);
    blueLight.position.set(-15, 20, -25);
    const whiteLight = new THREE.PointLight(0xffffff, 3, 50);
    whiteLight.position.set(0, 5, 0);
    
    scene.add(ambient, pinkLight, blueLight, whiteLight);

    // Heart Shape for particle sampling
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    // Compute bounding box manually from shape points
    const points = heartShape.getPoints(500);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const depth = 20;

    // Custom point-in-polygon test
    function isPointInShape(point: { x: number; y: number }, contour: { x: number; y: number }[]): boolean {
      let inside = false;
      for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
        const xi = contour[i].x, yi = contour[i].y;
        const xj = contour[j].x, yj = contour[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }

    // Particle Heart with enhanced contrast
    const particleCount = 60000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    let i = 0;
    while (i < particleCount) {
      const pz = (Math.random() - 0.5) * depth;
      const u = Math.abs(pz) / (depth / 2);
      const scale = Math.sqrt(Math.max(0, 1 - u * u));
      if (scale <= 0) continue;

      const px_scaled = minX + Math.random() * (maxX - minX);
      const py_scaled = minY + Math.random() * (maxY - minY);
      const point_scaled = { x: px_scaled, y: py_scaled };

      if (isPointInShape(point_scaled, points)) {
        const px = centerX + (px_scaled - centerX) * scale;
        const py = centerY + (py_scaled - centerY) * scale;
        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = pz;
        
        const depthFactor = (pz + depth/2) / depth;
        const brightness = 0.7 + depthFactor * 0.3;
        colors[i * 3] = 1.0 * brightness;
        colors[i * 3 + 1] = (0.2 + depthFactor * 0.3) * brightness;
        colors[i * 3 + 2] = (0.3 + depthFactor * 0.4) * brightness;
        
        i++;
      }
    }

    const heartGeo = new THREE.BufferGeometry();
    heartGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    heartGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    heartGeo.center();

    const heartMat = new THREE.PointsMaterial({
      color: 0xff3366,
      size: 0.12,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: false
    });

    const heart = new THREE.Points(heartGeo, heartMat);
    heart.rotation.set(Math.PI, 0, 0);
    heart.scale.set(1.0, 1.0, 1.0);
    heart.position.set(0, 10, 0);
    scene.add(heart);

    const heartGlow = new THREE.PointLight(0xff3366, 3, 15);
    heart.add(heartGlow);

    const outlineHeartGeo = heartGeo.clone();
    const outlineHeartMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const outlineHeart = new THREE.Points(outlineHeartGeo, outlineHeartMat);
    outlineHeart.rotation.set(Math.PI, 0, 0);
    outlineHeart.scale.set(1.05, 1.05, 1.05);
    outlineHeart.position.set(0, 10, 0);
    scene.add(outlineHeart);

    const glowGeo = new THREE.RingGeometry(4, 18, 100);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xff3366) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5));
          float alpha = 0.6 + 0.4 * sin(time * 3.0 + dist * 15.0);
          gl_FragColor = vec4(color, alpha * (1.0 - dist * 0.6));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 2;
    scene.add(glow);

    function createCircleTexture() {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.1, "rgba(255,255,255,0.9)");
      gradient.addColorStop(0.3, "rgba(255,150,255,0.6)");
      gradient.addColorStop(1, "rgba(255,100,255,0.1)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    const galaxyCount = 30000;
    const positionsGalaxy = new Float32Array(galaxyCount * 3);
    const velocities = new Float32Array(galaxyCount * 3);
    for (let i = 0; i < galaxyCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 60;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 3;
      const z = Math.sin(angle) * radius;
      positionsGalaxy.set([x, y, z], i * 3);
      velocities.set([(Math.random() - 0.5) * 0.02, 0, (Math.random() - 0.5) * 0.02], i * 3);
    }
    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute("position", new THREE.BufferAttribute(positionsGalaxy, 3));

    const circleTexture = createCircleTexture();
    const galaxyMat = new THREE.PointsMaterial({
      map: circleTexture,
      color: 0xff66aa,
      size: 0.3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    scene.add(galaxy);

    const baseImageUrls = Array.from({ length: 9 }, (_, i) => `/assets/${i + 1}.png`);
    const imageUrls = [];
    for (let repeat = 0; repeat < 30; repeat++) {
      imageUrls.push(...baseImageUrls);
    }
    const orbitingPhotos = new OrbitingPhotos({
      imageUrls,
      radius: 50,
      speed: 0.3,
      tilt: 0.1,
    });
    scene.add(orbitingPhotos);

    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    const starScales = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPos.set([(Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000], i * 3);
      starScales[i] = 0.7 + Math.random() * 0.8;
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starsGeo.setAttribute("scale", new THREE.BufferAttribute(starScales, 1));
    const starsMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float scale;
        varying float vScale;
        void main() {
          vScale = scale;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = scale * 2.5;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying float vScale;
        void main() {
          float alpha = 0.8 + 0.4 * sin(time + vScale * 10.0);
          gl_FragColor = vec4(1.0, 0.7, 0.9, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    const meteorCount = 70;
    const meteors: { mesh: THREE.Mesh; trail: THREE.Points; angle: number; speed: number; radius: number }[] = [];

    const meteorGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const meteorMat = new THREE.MeshPhysicalMaterial({
      color: 0xff88cc,
      emissive: 0xff99ff,
      emissiveIntensity: 3,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 1.0,
      clearcoat: 1,
    });

    function createTrailTexture() {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,220,255,1)");
      gradient.addColorStop(0.2, "rgba(255,120,255,0.8)");
      gradient.addColorStop(0.5, "rgba(255,80,255,0.4)");
      gradient.addColorStop(1, "rgba(255,80,255,0.1)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    }

    const trailTexture = createTrailTexture();

    for (let i = 0; i < meteorCount; i++) {
      const mesh = new THREE.Mesh(meteorGeo, meteorMat);
      const trailGeo = new THREE.BufferGeometry();
      const trailCount = 80;
      const trailPositions = new Float32Array(trailCount * 3);
      trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
      const trailMat = new THREE.PointsMaterial({
        map: trailTexture,
        color: 0xffaacc,
        size: 0.7,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const trail = new THREE.Points(trailGeo, trailMat);
      scene.add(mesh, trail);
      const radius = 30 + Math.random() * 25;
      const speed = 0.3 + Math.random() * 0.4;
      const angle = Math.random() * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * radius, 8 + Math.random() * 10, Math.sin(angle) * radius);
      trail.position.copy(mesh.position);
      meteors.push({ mesh, trail, angle, speed, radius });
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 20;
    controls.maxDistance = 100;

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const t = clock.getElapsedTime();
      galaxy.rotation.y += delta * 0.05;

      const s = 1 + Math.sin(t * 2.5) * 0.15;
      heart.scale.set(s, s, s);
      outlineHeart.scale.set(s * 1.05, s * 1.05, s * 1.05);

      orbitingPhotos.update(delta);

      const galaxyPos = galaxyGeo.attributes.position.array;
      for (let i = 0; i < galaxyCount; i++) {
        galaxyPos[i * 3] += velocities[i * 3] * delta;
        galaxyPos[i * 3 + 2] += velocities[i * 3 + 2] * delta;
        if (Math.hypot(galaxyPos[i * 3], galaxyPos[i * 3 + 2]) > 60) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 60;
          galaxyPos[i * 3] = Math.cos(angle) * radius;
          galaxyPos[i * 3 + 2] = Math.sin(angle) * radius;
        }
      }
      galaxyGeo.attributes.position.needsUpdate = true;

      meteors.forEach((m) => {
        m.angle += m.speed * delta * 0.5;
        const x = Math.cos(m.angle) * m.radius;
        const z = Math.sin(m.angle) * m.radius;
        const y = 8 + Math.sin(m.angle * 2) * 3;
        m.mesh.position.set(x, y, z);
        const trailPos = m.trail.geometry.attributes.position.array as Float32Array;
        for (let i = trailPos.length - 3; i >= 3; i--) {
          trailPos[i] = trailPos[i - 3];
        }
        trailPos[0] = x;
        trailPos[1] = y;
        trailPos[2] = z;
        m.trail.geometry.attributes.position.needsUpdate = true;
      });

      glowMat.uniforms.time.value = t;
      starsMat.uniforms.time.value = t;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, []); // Loại bỏ userInteracted khỏi dependencies

  // Hàm toggle âm nhạc - đơn giản hóa
  const toggleMusic = () => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        // Đảm bảo audio buffer đã được load
        if (audioBufferRef.current) {
          soundRef.current.play();
          setIsPlaying(true);
          isPlayingRef.current = true;
        } else {
          console.warn("⚠️ Nhạc chưa được load xong");
        }
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      
      <button
        onClick={toggleMusic}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          background: "transparent",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
          transition: "all 0.3s ease",
          opacity: "0.9",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isPlaying ? (
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
          >
            {/* Nốt nhạc khi đang phát */}
            <path 
              d="M12 3V15M8 7V15M16 7V15M6 19C7.10457 19 8 18.1046 8 17C8 15.8954 7.10457 15 6 15C4.89543 15 4 15.8954 4 17C4 18.1046 4.89543 19 6 19ZM10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM18 17C19.1046 17 20 16.1046 20 15C20 13.8954 19.1046 13 18 13C16.8954 13 16 13.8954 16 15C16 16.1046 16.8954 17 18 17Z" 
              stroke="#985f77ff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        ) : (
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
          >
            {/* Nốt nhạc khi dừng */}
            <path 
              d="M9 18V6L21 3V15M9 18C9 19.1046 8.10457 20 7 20C5.89543 20 5 19.1046 5 18C5 16.8954 5.89543 16 7 16C8.10457 16 9 16.8954 9 18ZM21 15C21 16.1046 20.1046 17 19 17C17.8954 17 17 16.1046 17 15C17 13.8954 17.8954 13 19 13C20.1046 13 21 13.8954 21 15ZM9 9L21 6" 
              stroke="#985f77ff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default App;