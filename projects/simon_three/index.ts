// deno-lint-ignore-file
import * as THREE from "https://cdn.skypack.dev/three?dts";
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls?dts";

class World {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private three: THREE.WebGLRenderer;

  constructor() {
    this.three = new THREE.WebGLRenderer({ antialias: true });
    this.three.shadowMap.enabled = true;
    this.three.shadowMap.type = THREE.PCFSoftShadowMap;
    this.three.setPixelRatio(window.devicePixelRatio);
    this.three.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.three.domElement);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(75, 20, 0);

    this.scene = new THREE.Scene();

    let dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    dirLight.position.set(20, 100, 10);
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 500.0;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500.0;
    dirLight.shadow.camera.left = 100;
    dirLight.shadow.camera.right = -100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    this.scene.add(dirLight);

    let amLight = new THREE.AmbientLight(0x101010);
    this.scene.add(amLight);

    const controls = new OrbitControls(this.camera, this.three.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "./resources/posx.jpg",
      "./resources/negx.jpg",
      "./resources/posy.jpg",
      "./resources/negy.jpg",
      "./resources/posz.jpg",
      "./resources/negz.jpg",
    ]);
    this.scene.background = texture;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF }),
    );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    for (let x = -8; x < 8; x++) {
      for (let y = -8; y < 8; y++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({ color: 0x808080 }),
        );
        box.position.set(
          Math.random() + x * 5,
          Math.random() * 4.0 + 2.0,
          Math.random() + y * 5,
        );
        box.castShadow = true;
        box.receiveShadow = true;
        this.scene.add(box);
      }
    }

    window.addEventListener("resize", () => {
      this.onWindowResize();
    }, false);

    this.loop();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.three.setSize(window.innerWidth, window.innerHeight);
  }

  loop() {
    requestAnimationFrame(() => {
      this.three.render(this.scene, this.camera);
      this.loop();
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new World();
});
