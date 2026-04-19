import { RoundedBox } from '@react-three/drei'
import { RUG_SURFACE_Y } from '../constants/roomDimensions'

const WOOD = '#5a4a3d'
const LEG = '#3a3530'

/**
 * Low coffee table: thin top + four slim legs.
 * Default size matches ~½ sofa width; height ~0.41 m.
 */
export function CoffeeTable({ position = [0, 0, 0] }) {
  const topW = 1.05
  const topD = 0.52
  const topT = 0.028
  const legS = 0.038
  const tableH = 0.41
  const legH = tableH - topT

  const topY = RUG_SURFACE_Y + tableH - topT / 2
  const legY = RUG_SURFACE_Y + legH / 2
  const inset = 0.07
  const lx = topW / 2 - inset
  const lz = topD / 2 - inset

  return (
    <group position={position}>
      <RoundedBox
        args={[topW, topT, topD]}
        radius={0.012}
        smoothness={2}
        castShadow
        receiveShadow
        position={[0, topY, 0]}
      >
        <meshStandardMaterial color={WOOD} roughness={0.74} metalness={0.05} />
      </RoundedBox>

      {[
        [-lx, -lz],
        [lx, -lz],
        [-lx, lz],
        [lx, lz],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, legY, z]} castShadow receiveShadow>
          <boxGeometry args={[legS, legH, legS]} />
          <meshStandardMaterial color={LEG} roughness={0.68} metalness={0.12} />
        </mesh>
      ))}
    </group>
  )
}
