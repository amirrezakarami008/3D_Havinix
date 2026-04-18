import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { ROOM_DEPTH, ROOM_WIDTH } from '../constants/roomDimensions'

const MAPS = {
  wood: '/textures/wood.jpg',
  tile: '/textures/tile.jpg',
}

function configureFloorTextures(loaded) {
  const list = Array.isArray(loaded) ? loaded : [loaded]
  for (const t of list) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
  }
  const [wood, tile] = list
  wood.repeat.set(ROOM_WIDTH * 0.9, ROOM_DEPTH * 0.9)
  tile.repeat.set(ROOM_WIDTH * 2.4, ROOM_DEPTH * 2.4)
}

export function Floor({ materialType }) {
  const maps = useTexture(MAPS, configureFloorTextures)

  const map = useMemo(() => maps[materialType], [maps, materialType])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH, 1, 1]} />
      <meshStandardMaterial
        map={map}
        roughness={materialType === 'tile' ? 0.55 : 0.78}
        metalness={materialType === 'tile' ? 0.02 : 0.04}
        envMapIntensity={0.35}
      />
    </mesh>
  )
}
