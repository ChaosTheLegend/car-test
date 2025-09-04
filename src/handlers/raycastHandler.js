import * as THREE from 'three'

export function initRaycaster(camera, rendererDom, targetObject){
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const rect = rendererDom.getBoundingClientRect()

    let isMouseDown = false
    let disposed = false

    let onPointerDown
    let onHoverEnter
    let onHoverLeave
    let lastIntersectedObject = null

    //Adding mouse handlers
    function onMouseMove(e) {
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onMouseUp(e) {
        isMouseDown = false
    }

    function onMouseDown(e){
        isMouseDown = true
    }

    rendererDom.addEventListener('mousemove', onMouseMove)
    rendererDom.addEventListener('mouseup', onMouseUp)
    rendererDom.addEventListener('mousedown', onMouseDown)


    //

    function tick(){
        processHover()
        processClick()
    }

    function processClick(){
        if(lastIntersectedObject && isMouseDown){
            onPointerDown(lastIntersectedObject)
        }
    }

    function processHover(){
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(targetObject.traverse(), true);

        if (intersects.length === 0) {
            if(onHoverLeave && lastIntersectedObject) onHoverLeave(lastIntersectedObject)
            lastIntersectedObject = null
            return
        }

        let intersectObject = intersects[0].object;

        if(lastIntersectedObject !== intersectObject) {
            if(lastIntersectedObject && onHoverLeave) onHoverLeave(lastIntersectedObject)

            lastIntersectedObject = intersectObject
            if(onHoverEnter) onHoverEnter(intersectObject)
        }
    }

    function dispose() {
        if (disposed) return
        disposed = true
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('mousedown', onMouseDown)
    }

    function setOnClick(fn){
        onPointerDown = fn
    }

    function setOnHoverEnter(fn){
        onHoverEnter = fn
    }

    function setOnHoverLeave(fn){
        onHoverLeave = fn
    }

    return {tick, setOnClick, setOnHoverEnter, setOnHoverLeave, dispose}

}