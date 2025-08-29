import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { initHoverManager } from './hoverManager.js'

// Create container
const app = document.querySelector('#app')
app.innerHTML = ''
app.style.margin = '0'
app.style.padding = '0'
app.style.width = '100vw'
app.style.height = '100vh'
app.style.overflow = 'hidden'

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x20232a)

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(2, 2, 3)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
app.appendChild(renderer.domElement)

// add orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

// Resize handling
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onWindowResize)

// Load car model
const loadingManager = new THREE.LoadingManager()
const loader = new GLTFLoader(loadingManager)
let carModel
let hover

loader.load('/resources/car.glb', (gltf) => {
  carModel = gltf.scene
  carModel.scale.set(0.01, 0.01, 0.01)
  carModel.position.set(0, 0, 0)
  scene.add(carModel)

  // Setup hover manager when model is ready
  hover = initHoverManager({
    camera,
    rendererDom: renderer.domElement,
    targetObject: carModel,
    panelText: 'some stupid car',
    onEnter: () => {
      carModel.traverse((child) => {
        if (child.isMesh) {
          if (!child.material || !('emissive' in child.material)) return
          child.material.emissive = new THREE.Color(0x666666)
        }
      })
    },
    onLeave: () => {
      carModel.traverse((child) => {
        if (child.isMesh) {
          if (!child.material || !('emissive' in child.material)) return
          child.material.emissive = new THREE.Color(0x000000)
        }
      })
    },
    onClick: (intersect) => {
      // Example click behavior: log and briefly flash emissive
      console.log('Car clicked', intersect)
      carModel.traverse((child) => {
        if (child.isMesh && child.material && 'emissive' in child.material) {
          child.material.emissive = new THREE.Color(0x22aa22)
          setTimeout(() => {
            child.material.emissive = new THREE.Color(0x666666)
          }, 150)
        }
      })
    }
  })

  // Expose API to the outside for custom click handling
  window.setCarClickHandler = (fn) => hover && hover.setOnClick(fn)
  window.triggerCarClick = () => hover && hover.triggerClick()
})

// Ground plane for context
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0x333842, roughness: 1 })
)
plane.rotation.x = -Math.PI / 2
plane.position.y = -0.75
plane.receiveShadow = true
scene.add(plane)

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
hemi.position.set(0, 1, 0)
scene.add(hemi)

const dir = new THREE.DirectionalLight(0xffffff, 0.8)
dir.position.set(3, 5, 2)
scene.add(dir)

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  controls.update()

  if (hover) hover.tick()

  renderer.render(scene, camera)
}

animate()

