import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const GLB_PATH = '/src/template/sydney_apartment_night_-_custom_home.glb'

function isWallObject(name) {
  return /wall|chimney|brick/i.test(name)
}

function isFloorObject(name) {
  return /floor|plane/i.test(name)
}

function isRugObject(name) {
  return /rug|carpet/i.test(name)
}

export function ApartmentTemplate({
  wallColor = '#ebe8e3',
  floorVisible = true,
  rugVisible = true,
  floorTint = '#ffffff',
}) {
  const { scene } = useGLTF(GLB_PATH)
  const sceneClone = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    sceneClone.updateMatrixWorld(true)
    let hasRugMesh = false

    sceneClone.traverse((obj) => {
      if (obj.isLight) {
        obj.visible = false
        return
      }
      if (!obj.isMesh) return

      const meshName = obj.parent?.name || obj.name || ''
      const lowerName = meshName.toLowerCase()
      const mat = obj.material

      obj.frustumCulled = true
      obj.receiveShadow = !/smalldecor|photos|book|chess/i.test(lowerName)
      obj.castShadow = !/wallsnew|floor_new|plane001|blinds|curtain/i.test(lowerName)

      if (!mat) return
      if (Array.isArray(mat)) return
      if (!obj.userData.materialIsCloned) {
        obj.material = mat.clone()
        obj.userData.materialIsCloned = true
      }
      if (!obj.userData.baseColor && obj.material.color) {
        obj.userData.baseColor = obj.material.color.clone()
      }
      const baseColor = obj.userData.baseColor

      if (isWallObject(lowerName) && obj.material.color && baseColor) {
        obj.material.color.copy(baseColor).multiply(new THREE.Color(wallColor))
      }

      if (isFloorObject(lowerName)) {
        obj.visible = floorVisible
        if (obj.material.color && baseColor) {
          obj.material.color.copy(baseColor).multiply(new THREE.Color(floorTint))
        }
      }

      if (isRugObject(lowerName)) {
        hasRugMesh = true
        obj.visible = rugVisible
      }
    })

    // This GLB has no explicit "rug" node names, so we keep a safe fallback target.
    if (!hasRugMesh) {
      const fallbackRug = sceneClone.getObjectByName('Plane001_21')
      if (fallbackRug) {
        fallbackRug.visible = rugVisible
      }
    }
  }, [sceneClone, wallColor, floorVisible, rugVisible, floorTint])

  return <primitive object={sceneClone} />
}

useGLTF.preload(GLB_PATH)
