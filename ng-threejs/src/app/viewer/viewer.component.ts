import { Component, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import * as THREE from 'three';
import './js/EnableThreeExamples';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/ColladaLoader';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements AfterViewInit {

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private controls: THREE.OrbitControls;
  private light: THREE.AmbientLight;
  private light1: THREE.AmbientLight;
  private mesh: THREE.mesh;

  public fieldOfView = 60;
  public nearClippingPane = 1;
  public farClippingPane = 1100;

  @ViewChild('canvas') private canvasRef: ElementRef;

  constructor() { }

  private get canvas(): HTMLCanvasElement {
    console.log('this.canvasRef  => ', this.canvasRef.nativeElement);
    return this.canvasRef.nativeElement;
  }

  private render() {
    setTimeout(() => {
      this.renderer.render(this.scene, this.camera);
    }, 10);
  }

  private getAspectRatio() {
    let height = this.canvas.clientHeight;
    if (height === 0 ) { return 0; }
    else {
      return this.canvas.clientWidth / this.canvas.clientHeight;
    }
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true});
    this.renderer.setClearColor(0xfcfcfc);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    return this.canvas;
  }

  createCamera() {
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane);
      this.controls = new THREE.OrbitControls(this.camera);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxisHelper(200));
    const geometry = new THREE.CylinderGeometry(100, 100, 700, 64, 32, true, 32);
    const material = new THREE.MeshLambertMaterial({color: 0x9ef1f7, wireframe: true});
    this.mesh = new THREE.mesh(geometry, material);
    this.camera.position.z = -1000;
    this.scene.add(this.mesh);
    this.render();
  }

  createLight() {
    this.light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.light);

    this.light1 = new THREE.pointLight(0xffffff, 0.5);
    this.scene.add(this.light1);
  }

  public addControls() {
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.addEventListener('change', this.render);
  }

  @HostListener('window:resize', ['event'])
  public onResize(event: Event) {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.render();
  }

  public onMouseDown(event: MouseEvent) {
    event.preventDefault();
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = (event.clientY / this.renderer.domElement.clientHeight) *2 - 1;
    raycaster.setFromCamera(mouse, this.camera);

    var object: THREE.Object3D[] = [];
    this.findAllObjects(object, this.scene);
    var intersects = raycaster.intersectObjects(object);
    console.log('Scene has ' + object.length + 'objects');
    console.log(intersects.length + 'intersected objects found ');
    intersects.forEach((i) => {
      console.log(i.object);
    });
  }

  public onMouseUp(event: MouseEvent) {
    console.log('Mouse Up');
  }

  private findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
    // Note : Better to keep separate array of selected objects
    if(parent.children.length > 0) {
      parent.children.forEach((i) => {
        pred.push(i);
        this.findAllObjects(pred, i);
      });
    }
  }

  animate() {
    window.requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  ngAfterViewInit() {
      this.createRenderer();
      this.createCamera();
      this.createScene();
      this.animate();
      this.createLight();
  }
}
