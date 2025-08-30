import * as THREE from 'three'

export function createOnEnter(carModel) {
  return () => {
    carModel.traverse((child) => {
      if (child.isMesh) {
        if (!child.material || !('emissive' in child.material)) return
        child.material.emissive = new THREE.Color(0x666666)
      }
    })
  }
}

export function createOnLeave(carModel) {
  return () => {
    carModel.traverse((child) => {
      if (child.isMesh) {
        if (!child.material || !('emissive' in child.material)) return
        child.material.emissive = new THREE.Color(0x000000)
      }
    })
  }
}

export function createOnClick(carModel) {
  return (intersect) => {
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
}
