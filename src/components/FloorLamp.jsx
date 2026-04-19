import { RUG_SURFACE_Y } from '../constants/roomDimensions'

/** Minimal floor lamp; base on rug/floor. */
export function FloorLamp({ position = [0, 0, 0] }) {
  const poleH = 1.05
  const baseY = RUG_SURFACE_Y + poleH / 2
  const shadeY = RUG_SURFACE_Y + poleH + 0.02

  return (
    <group position={position}>
      <mesh position={[0, baseY, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, poleH, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, shadeY, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color="#f6f2e6"
          emissive="#ffe8c8"
          emissiveIntensity={0.5}
          roughness={0.45}
          metalness={0}
        />
      </mesh>
    </group>
  )
}
