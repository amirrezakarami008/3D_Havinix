import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

const RUG_LIFT = 0.004

function configureRugTexture(t) {
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
}

export function Rug({ imageUrl, maxWidth = 2.35, position = [0, RUG_LIFT, 0.2] }) {
  const texture = useTexture(imageUrl, configureRugTexture)

  const { planeW, planeH } = useMemo(() => {
    const img = texture.image
    const w = img?.width || 1
    const h = img?.height || 1
    const aspect = w / h
    return { planeW: maxWidth, planeH: maxWidth / aspect }
  }, [texture, maxWidth])

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <planeGeometry args={[planeW, planeH]} />
      <meshStandardMaterial map={texture} roughness={0.98} metalness={0} />
    </mesh>
  )
}
