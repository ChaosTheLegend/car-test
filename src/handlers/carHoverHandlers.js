import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import {log} from "three/tsl";

let emissive = new THREE.MeshBasicMaterial({})
let lastMat = null
export function createOnEnter(object) {
    console.log(object);
    if (!object.material) return

    lastMat = object.material
    object.material = emissive
    object.material.emissive = new THREE.Color(0x666666)
}

export function createOnLeave(object) {
    if (!object.material) return
    object.material = lastMat
}

let isOpen = false

export function createOnClick(carModel, tweenGroup) {
  return (intersect) => {
    console.log('Car clicked', intersect)

      let dir = isOpen ? -1 : 1;
        isOpen = !isOpen;

        let door1 =  carModel.getObjectByName("door1")
      const currentRotation = door1.rotation.y;
      new TWEEN.Tween(door1.rotation, tweenGroup)
          .to({
              y: currentRotation - (Math.PI / 180 * 50 * dir),
          }, 500)
          .start()


      let door2 =  carModel.getObjectByName("door2")
      const currentRotation2 = door2.rotation.y;
      new TWEEN.Tween(door2.rotation, tweenGroup)
          .to({
              y: currentRotation2 + (Math.PI / 180 * 50 * dir),
          }, 500)
          .start()

      let door3 =  carModel.getObjectByName("door3")
      const currentRotation3 = door3.rotation.y;
      new TWEEN.Tween(door3.rotation, tweenGroup)
          .to({
              y: currentRotation3 - (Math.PI / 180 * 50 * dir),
          }, 500)
          .start()
      let door4 =  carModel.getObjectByName("door4")
      const currentRotation4 = door4.rotation.y;

      new TWEEN.Tween(door4.rotation, tweenGroup)
          .to({
              y: currentRotation4 + (Math.PI / 180 * 50 * dir),
          }, 500)
          .start()

      let capo = carModel.getObjectByName("capo")
      const currentRotation5 = capo.rotation.x;

      new TWEEN.Tween(capo.rotation, tweenGroup)
          .to({
              x: currentRotation5 - (Math.PI / 180 * 50 * dir),
          }, 500)
          .start()
  }
}
