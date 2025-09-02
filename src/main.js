import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { initHoverManager } from './hoverManager.js'
import { createOnEnter, createOnLeave, createOnClick } from './handlers/carHoverHandlers.js'
import { initScene } from './sceneSetup.js'

// Create container
const app = document.querySelector('#app')
app.innerHTML = ''
app.style.margin = '0'
app.style.padding = '0'
app.style.width = '100vw'
app.style.height = '100vh'
app.style.overflow = 'hidden'

// Initialize shared scene (background, camera, renderer, controls, ground, lights)
const { scene, camera, renderer, controls } = await initScene(app, {
  // You can override defaults here, e.g.:
  // background: 0x000000,
  // lights: { directional: { intensity: 1.2 } }
})

// Load car model
const loadingManager = new THREE.LoadingManager()
const loader = new GLTFLoader(loadingManager)
let carModel
let hover

loader.load(import.meta.env.BASE_URL + 'resources/car1.glb', (gltf) => {
  carModel = gltf.scene
  carModel.scale.set(1 , 1, 1)
  carModel.position.set(0, 0, 2.5)
  scene.add(carModel)

  // Setup hover manager when model is ready
  // Import shared handlers and bind to this model
  hover = initHoverManager({
    camera,
    rendererDom: renderer.domElement,
    targetObject: carModel,
    panelText: 'some stupid car',
    onEnter: createOnEnter(carModel),
    onLeave: createOnLeave(carModel),
    onClick: createOnClick(carModel)
  })

  // Expose API to the outside for custom click handling
  window.setCarClickHandler = (fn) => hover && hover.setOnClick(fn)
  window.triggerCarClick = () => hover && hover.triggerClick()
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  controls.update()

  if (hover) hover.tick()

  renderer.render(scene, camera)
}

animate()

