import * as THREE from 'three'

// Simple tooltip/panel element helper
function createPanel() {
  const el = document.createElement('div')
  el.id = 'hover-panel'
  el.style.position = 'fixed'
  el.style.pointerEvents = 'none'
  el.style.padding = '8px 12px'
  el.style.borderRadius = '6px'
  el.style.background = 'rgba(0,0,0,0.7)'
  el.style.color = '#fff'
  el.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
  el.style.fontSize = '14px'
  el.style.lineHeight = '1.2'
  el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
  el.style.transform = 'translate(12px, 12px)'
  el.style.opacity = '0'
  el.style.transition = 'opacity 120ms ease'
  el.style.zIndex = '9999'
  document.body.appendChild(el)
  return el
}

export function initHoverManager({ camera, rendererDom, targetObject, panelText = 'Car', onEnter, onLeave, onClick }) {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  let isHovered = false
  let disposed = false
  let currentOnClick = onClick

  const panel = createPanel()
  panel.textContent = panelText

  function showPanel() { panel.style.opacity = '1' }
  function hidePanel() { panel.style.opacity = '0' }

  function updateMouse(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

    // Follow cursor with slight offset via transform translate already set
    panel.style.left = `${e.clientX}px`
    panel.style.top = `${e.clientY}px`
  }

  function onMove(e) {
    updateMouse(e)
  }

  window.addEventListener('mousemove', onMove)

  function handlePointerDown(e) {
    if (disposed || !targetObject || !camera) return
    updateMouse(e)
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(targetObject, true)
    if (intersects.length > 0 && currentOnClick) {
      currentOnClick(intersects[0])
    }
  }

  const clickTarget = rendererDom || window
  clickTarget.addEventListener('pointerdown', handlePointerDown)

  function tick() {
    if (disposed || !targetObject || !camera) return

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(targetObject, true)
    const currentlyHover = intersects.length > 0

    if (currentlyHover && !isHovered) {
      isHovered = true
      showPanel()
      onEnter && onEnter(intersects[0])
    } else if (!currentlyHover && isHovered) {
      isHovered = false
      hidePanel()
      onLeave && onLeave()
    }
  }

  function dispose() {
    if (disposed) return
    disposed = true
    window.removeEventListener('mousemove', onMove)
    const clickTarget = rendererDom || window
    clickTarget.removeEventListener('pointerdown', handlePointerDown)
    if (panel && panel.parentElement) panel.parentElement.removeChild(panel)
  }

  function setOnClick(fn) {
    currentOnClick = typeof fn === 'function' ? fn : null
  }

  function triggerClick() {
    if (disposed || !targetObject || !camera || !currentOnClick) return
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(targetObject, true)
    if (intersects.length > 0) currentOnClick(intersects[0])
  }

  // Public API
  return { tick, dispose, setOnClick, triggerClick }
}
