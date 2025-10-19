  import * as THREE from "three";

  interface OrbitingPhotosProps {
    imageUrls: string[];
    radius: number;
    speed: number;
    tilt?: number;
  }

  export default class OrbitingPhotos extends THREE.Group {
    private photos: THREE.Mesh[] = [];
    private angle = 0;
    private speed: number;

    constructor({ imageUrls, radius, speed, tilt = 0 }: OrbitingPhotosProps) {
      super();
      this.speed = speed;

      const loader = new THREE.TextureLoader();

      imageUrls.forEach((url) => {
        const texture = loader.load(url);
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({ // Switched to Basic for brighter, self-illuminated photos
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        const theta = Math.random() * Math.PI * 2; // Random angle for cloud-like distribution
        const r = radius * Math.sqrt(Math.random()); // Uniform disk distribution
        const yOffset = (Math.random() - 0.5) * 20; // Larger vertical spread
        mesh.position.set(
          Math.cos(theta) * r,
          yOffset,
          Math.sin(theta) * r
        );
        mesh.rotation.z = tilt + (Math.random() - 0.5) * 0.5; // More variation in tilt
        mesh.userData = {
          baseY: mesh.position.y,
          theta: theta,
          radius: r,
          speed: speed * (0.8 + Math.random() * 0.4),
        };
        this.add(mesh);
        this.photos.push(mesh);
      });
    }

    update(delta: number) {
      this.angle += this.speed * delta;
      this.photos.forEach((photo, i) => {
        const theta = photo.userData.theta + this.angle * photo.userData.speed;
        photo.position.x = Math.cos(theta) * photo.userData.radius;
        photo.position.z = Math.sin(theta) * photo.userData.radius;
        photo.position.y = photo.userData.baseY + Math.sin(this.angle + i) * 2; // Increased oscillation
        photo.scale.setScalar(1 + Math.sin(this.angle + i) * 0.15); // More noticeable scale
        photo.lookAt(0, 10, 0); // Face the heart
      });
    }
  }