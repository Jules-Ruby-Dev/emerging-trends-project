/**
 * AR Scene — Three.js + WebXR
 *
 * Renders a simple animated 3D avatar (Aria) in an AR session using the
 * WebXR Device API.  Falls back to a regular 3-D scene if WebXR is not
 * available.
 *
 * Avatar design is intentionally minimal so teams can replace the geometry
 * with a proper glTF model when one is available.
 */

import * as THREE from "three";

export class ARScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private avatar: THREE.Group;
  private clock = new THREE.Clock();
  private animationId = 0;
  private isInXR = false;

  constructor(canvas: HTMLCanvasElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0); // transparent background
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    this.camera.position.set(0, 1.6, 3);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 1.2);
    directional.position.set(1, 3, 2);
    this.scene.add(ambient, directional);

    // Avatar group
    this.avatar = this._buildAvatar();
    this.avatar.position.set(0, 0, -1.5);
    this.scene.add(this.avatar);

    // Handle resize
    window.addEventListener("resize", this._onResize);

    // Start render loop
    this.renderer.setAnimationLoop(this._tick);
  }

  // ── Avatar geometry ──────────────────────────────────────────────────────

  private _buildAvatar(): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x60a5fa });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), mat);
    head.position.y = 0.4;
    group.add(head);

    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), eyeMat);
    const eyeR = eyeL.clone();
    eyeL.position.set(-0.045, 0.41, 0.11);
    eyeR.position.set(0.045, 0.41, 0.11);
    group.add(eyeL, eyeR);

    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.35, 32), mat);
    body.position.y = 0.1;
    group.add(body);

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd });
    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 16);
    const armL = new THREE.Mesh(armGeo, armMat);
    const armR = armL.clone();
    armL.rotation.z = Math.PI / 4;
    armR.rotation.z = -Math.PI / 4;
    armL.position.set(-0.18, 0.12, 0);
    armR.position.set(0.18, 0.12, 0);
    group.add(armL, armR);

    return group;
  }

  // ── Render loop ──────────────────────────────────────────────────────────

  private _tick = () => {
    const t = this.clock.getElapsedTime();
    // Gentle floating + head bob
    this.avatar.position.y = Math.sin(t * 1.2) * 0.04;
    this.avatar.rotation.y = Math.sin(t * 0.4) * 0.15;

    this.renderer.render(this.scene, this.camera);
  };

  // ── WebXR ────────────────────────────────────────────────────────────────

  /** Start an immersive-ar WebXR session.  Returns true on success. */
  async startAR(): Promise<boolean> {
    if (!navigator.xr) return false;

    const supported = await navigator.xr
      .isSessionSupported("immersive-ar")
      .catch(() => false);
    if (!supported) return false;

    const session = await navigator.xr.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test", "local"],
      optionalFeatures: ["dom-overlay", "camera-access"],
    });

    this.renderer.xr.setReferenceSpaceType("local");
    await this.renderer.xr.setSession(session);
    this.isInXR = true;
    return true;
  }

  /** End the current XR session. */
  async stopAR(): Promise<void> {
    const session = this.renderer.xr.getSession();
    if (session) {
      await session.end();
      this.isInXR = false;
    }
  }

  get inXR(): boolean {
    return this.isInXR;
  }

  // ── Utilities ────────────────────────────────────────────────────────────

  /** Play a short "talking" animation on the avatar. */
  triggerTalkAnimation(durationMs = 2000): void {
    const start = performance.now();
    const head = this.avatar.children[0] as THREE.Mesh;
    const origScale = head.scale.clone();

    const animate = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= durationMs) {
        head.scale.copy(origScale);
        return;
      }
      const factor = 1 + Math.sin((elapsed / durationMs) * Math.PI * 8) * 0.04;
      head.scale.set(factor, factor, factor);
      this.animationId = requestAnimationFrame(animate);
    };

    cancelAnimationFrame(this.animationId);
    animate();
  }

  private _onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  dispose(): void {
    window.removeEventListener("resize", this._onResize);
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}
