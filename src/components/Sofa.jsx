import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { RUG_SURFACE_Y } from '../constants/roomDimensions'

const MODEL_URL = '/models/sofa.glb'

function alignModelToFloor(model, scale) {
  model.scale.setScalar(scale)
  model.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(model)
  const center = new THREE.Vector3()
  box.getCenter(center)

  model.position.set(-center.x, RUG_SURFACE_Y - box.min.y, -center.z)
}

/**
 * GLB sofa: centered on X/Z with base on the rug plane; swap the file path to replace the asset.
 */
export function Sofa({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 0.5 }) {
  const { scene } = useGLTF(MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    alignModelToFloor(model, scale)
  }, [model, scale])

  return (
    <group position={position} rotation={rotation}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
