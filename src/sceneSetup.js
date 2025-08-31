import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

/**
 * Initialize a Three.js scene with camera, renderer, controls, ground, and lights.
 * All visual aspects are configurable via the userConfig parameter.
 *
 * @param {HTMLElement} container - The DOM element to attach the renderer canvas to.
 * @param {Object} userConfig - Optional configuration to override defaults.
 * @returns {{scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls, config: any, updateConfig: Function, dispose: Function}}
 */
export async function initScene(container, userConfig = {}) {
  // Load defaults from external JSON file; provide JS fallback if fetch fails
    const defaultConfig = {
      background: 0x000000,
      camera: {
          fov: 60,
          near: 0.1,
          far: 1000,
          position: {x: 2, y: 2, z: 3}
      },
      renderer: {
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2)
      },
      controls: {
          enableDamping: true,
          dampingFactor: 0.05
      },
      ground: {
          size: {x: 10, y: 10},
          color: 0x333842,
          roughness: 1,
          y: -0.05,
          receiveShadow: true,
          visible: true
      },
      lights: {
          hemisphere: {
              skyColor: 0xffffff,
              groundColor: 0x444444,
              intensity: 0.6,
              position: {x: 0, y: 1, z: 0},
              enabled: true
          },
          directional: {
              color: 0xffffff,
              intensity: 0.8,
              position: {x: 3, y: 5, z: 2},
              enabled: true
          }
      }
  }

  // Deep merge a bit (simple, shallow for objects we expect). For simplicity, we will override by nesting spreads.
  const config = {
    ...defaultConfig,
    ...userConfig,
    camera: { ...defaultConfig.camera, ...(userConfig.camera || {}) },
    renderer: { ...defaultConfig.renderer, ...(userConfig.renderer || {}) },
    controls: { ...defaultConfig.controls, ...(userConfig.controls || {}) },
    ground: { ...defaultConfig.ground, ...(userConfig.ground || {}) },
    lights: {
      hemisphere: { ...defaultConfig.lights.hemisphere, ...(userConfig.lights?.hemisphere || {}) },
      directional: { ...defaultConfig.lights.directional, ...(userConfig.lights?.directional || {}) }
    }
  }

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(config.background)

  // Camera
  const camera = new THREE.PerspectiveCamera(
    config.camera.fov,
    window.innerWidth / window.innerHeight,
    config.camera.near,
    config.camera.far
  )
  camera.position.set(config.camera.position.x, config.camera.position.y, config.camera.position.z)

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: !!config.renderer.antialias })
  renderer.setPixelRatio(config.renderer.pixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = !!config.controls.enableDamping
  controls.dampingFactor = config.controls.dampingFactor

  // Ground
  let groundMesh = null
  if (config.ground.visible) {
    groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(config.ground.size.x, config.ground.size.y),
      new THREE.MeshStandardMaterial({ color: config.ground.color, roughness: config.ground.roughness })
    )
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.position.y = config.ground.y
    groundMesh.receiveShadow = !!config.ground.receiveShadow
    scene.add(groundMesh)
  }

  // Lights
  let hemiLight = null
  if (config.lights.hemisphere.enabled) {
    hemiLight = new THREE.HemisphereLight(
      config.lights.hemisphere.skyColor,
      config.lights.hemisphere.groundColor,
      config.lights.hemisphere.intensity
    )
    hemiLight.position.set(
      config.lights.hemisphere.position.x,
      config.lights.hemisphere.position.y,
      config.lights.hemisphere.position.z
    )
    scene.add(hemiLight)
  }

  let dirLight = null
  if (config.lights.directional.enabled) {
    dirLight = new THREE.DirectionalLight(
      config.lights.directional.color,
      config.lights.directional.intensity
    )
    dirLight.position.set(
      config.lights.directional.position.x,
      config.lights.directional.position.y,
      config.lights.directional.position.z
    )
    scene.add(dirLight)
  }

  // Resize
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onWindowResize)

  // Allow runtime updates to a subset of config (background, lights, ground visibility/position/intensity etc.)
  function updateConfig(partial = {}) {
    // Update background
    if (partial.background !== undefined) {
      config.background = partial.background
      scene.background = new THREE.Color(config.background)
    }

    // Update ground
    if (partial.ground) {
      Object.assign(config.ground, partial.ground)
      if (config.ground.visible && !groundMesh) {
        // create
        groundMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(config.ground.size.x, config.ground.size.y),
          new THREE.MeshStandardMaterial({ color: config.ground.color, roughness: config.ground.roughness })
        )
        groundMesh.rotation.x = -Math.PI / 2
        scene.add(groundMesh)
      }
      if (groundMesh) {
        groundMesh.visible = !!config.ground.visible
        groundMesh.position.y = config.ground.y
        groundMesh.material.color = new THREE.Color(config.ground.color)
        groundMesh.material.roughness = config.ground.roughness
      }
    }

    // Lights
    if (partial.lights) {
      if (partial.lights.hemisphere) {
        Object.assign(config.lights.hemisphere, partial.lights.hemisphere)
        if (config.lights.hemisphere.enabled && !hemiLight) {
          hemiLight = new THREE.HemisphereLight(
            config.lights.hemisphere.skyColor,
            config.lights.hemisphere.groundColor,
            config.lights.hemisphere.intensity
          )
          scene.add(hemiLight)
        }
        if (hemiLight) {
          hemiLight.visible = !!config.lights.hemisphere.enabled
          hemiLight.color = new THREE.Color(config.lights.hemisphere.skyColor)
          hemiLight.groundColor = new THREE.Color(config.lights.hemisphere.groundColor)
          hemiLight.intensity = config.lights.hemisphere.intensity
          hemiLight.position.set(
            config.lights.hemisphere.position.x,
            config.lights.hemisphere.position.y,
            config.lights.hemisphere.position.z
          )
        }
      }
      if (partial.lights.directional) {
        Object.assign(config.lights.directional, partial.lights.directional)
        if (config.lights.directional.enabled && !dirLight) {
          dirLight = new THREE.DirectionalLight(
            config.lights.directional.color,
            config.lights.directional.intensity
          )
          scene.add(dirLight)
        }
        if (dirLight) {
          dirLight.visible = !!config.lights.directional.enabled
          dirLight.color = new THREE.Color(config.lights.directional.color)
          dirLight.intensity = config.lights.directional.intensity
          dirLight.position.set(
            config.lights.directional.position.x,
            config.lights.directional.position.y,
            config.lights.directional.position.z
          )
        }
      }
    }
  }

  function dispose() {
    window.removeEventListener('resize', onWindowResize)
    controls.dispose()
    renderer.dispose()
    // Remove children to help GC
    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.geometry?.dispose?.()
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose?.())
        } else {
          obj.material?.dispose?.()
        }
      }
    })
  }

  // Expose helpers on window for convenience (optional)
  if (typeof window !== 'undefined') {
    window.updateSceneConfig = updateConfig
    window.getSceneObjects = () => ({ scene, camera, renderer, controls, config })
  }

  return { scene, camera, renderer, controls, config, updateConfig, dispose }
}
