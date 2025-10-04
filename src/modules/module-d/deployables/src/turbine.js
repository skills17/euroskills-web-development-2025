import * as THREE from 'three';

export class Turbine {
    #targetElement;
    #scene;
    #camera;
    #renderer;
    #turbine;
    #blades = [];
    #bladePivot = 0;
    #rpm = 10;
    #lastTime = 0;
    #animationFrame;

    constructor(targetElement, backgroundColor) {
        this.#targetElement = targetElement;

        this.#init(backgroundColor);

        this.render = this.render.bind(this);
        this.updateTurbine = this.updateTurbine.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    #init(backgroundColor = '#000000') {
        this.#scene = new THREE.Scene();
        this.#scene.background = new THREE.Color(backgroundColor);
        this.#camera = new THREE.PerspectiveCamera(50, this.#targetElement.clientWidth / this.#targetElement.clientHeight, 0.1, 1000);
        this.#renderer = new THREE.WebGLRenderer({antialias: true});
        this.#renderer.setSize(this.#targetElement.clientWidth, this.#targetElement.clientHeight);
        this.#targetElement.appendChild(this.#renderer.domElement);

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7);
        this.#scene.add(light);
        this.#scene.add(new THREE.AmbientLight(0x404040));

        // Base tower
        const towerGeom = new THREE.CylinderGeometry(0.2, 0.4, 5, 32);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        this.#turbine = new THREE.Mesh(towerGeom, towerMat);
        this.#turbine.position.y = 2.5;
        this.#scene.add(this.#turbine);

        // Nacelle
        const nacelle = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 1),
            new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
        nacelle.position.y = 2.5;
        this.#turbine.add(nacelle);

        // Blade pivot
        this.#bladePivot = new THREE.Group();
        this.#bladePivot.position.z = 0.75;
        nacelle.add(this.#bladePivot);

        // Blades
        const points = [];
        points.push(new THREE.Vector2(0, 0));       // root
        points.push(new THREE.Vector2(0.15, 0.05)); // thick near root
        points.push(new THREE.Vector2(0.12, 1.4));  // taper
        points.push(new THREE.Vector2(0.02, 1.5));  // tip thin

        const bladeShape = new THREE.Shape(points);

        const extrudeSettings = {
            steps: 2,
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelSegments: 3,
        };

        const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);

        bladeGeom.translate(-0.075, 0, -0.15); // center around root and thickness
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: false });

        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeom, bladeMat);
            blade.rotation.z = i * (2 * Math.PI / 3);
            this.#bladePivot.add(blade);
            this.#blades.push(blade);
        }

        this.#camera.position.set(4, 6, 8);
        const nacelleWorldPos = new THREE.Vector3();
        this.#turbine.children[0].getWorldPosition(nacelleWorldPos);
        this.#camera.lookAt(nacelleWorldPos);
    }

    render(time = 0) {
        this.#animationFrame = requestAnimationFrame(this.render);
        const delta = (time - this.#lastTime) / 1000;
        this.#lastTime = time;

        // Rotate blades based on RPM
        const rotationsPerSecond = this.#rpm / 60;
        this.#bladePivot.rotation.z += 2 * Math.PI * rotationsPerSecond * delta;

        this.#renderer.render(this.#scene, this.#camera);
    }

    updateTurbine(pitch, yaw, newRpm) {
        this.#bladePivot.rotation.x = THREE.MathUtils.degToRad(pitch); // up/down
        this.#turbine.rotation.y = THREE.MathUtils.degToRad(yaw);      // rotate around base
        this.#rpm = newRpm;
    }

    destroy() {
        cancelAnimationFrame(this.#animationFrame);
        this.#renderer.dispose();
        this.#renderer.domElement.remove();
        this.#scene = null;
        this.#camera = null;
        this.#renderer = null;
        this.#turbine = null;
        this.#blades = [];
    }
}
