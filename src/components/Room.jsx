import * as THREE from 'three'
import { ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH } from '../constants/roomDimensions'
import { Wall } from './Wall'
import { Floor } from './Floor'
import { Rug } from './Rug'

const hw = ROOM_WIDTH / 2
const hd = ROOM_DEPTH / 2

function WindowPanel() {
  return (
    <mesh position={[hw - 0.004, ROOM_HEIGHT * 0.52, -0.35]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[2.15, 1.35]} />
      <meshStandardMaterial
        color="#eaf2fb"
        emissive="#b9d4f5"
        emissiveIntensity={0.35}
        roughness={0.35}
        metalness={0}
      />
    </mesh>
  )
}

function LivingRoomFurniture() {
  const fabric = '#2a2d32'
  const wood = '#5c4636'

  return (
    <group>
      <mesh position={[0, 0.21, -hd + 0.62]} castShadow receiveShadow>
        <boxGeometry args={[2.15, 0.42, 0.92]} />
        <meshStandardMaterial color={fabric} roughness={0.95} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.62, -hd + 0.62]} castShadow receiveShadow>
        <boxGeometry args={[2.15, 0.78, 0.12]} />
        <meshStandardMaterial color={fabric} roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.25, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.38, 0.52]} />
        <meshStandardMaterial color={wood} roughness={0.72} metalness={0.06} />
      </mesh>
      <mesh position={[-hw + 0.22, 0.55, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.05, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[-hw + 0.22, 1.08, 0.15]} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color="#f6f2e6"
          emissive="#ffe8c8"
          emissiveIntensity={0.55}
          roughness={0.45}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

export function Room({ wallColor, floorMaterial, rugImageUrl }) {
  return (
    <group>
      <Floor materialType={floorMaterial} />
      <Rug imageUrl={rugImageUrl} />

      <Wall
        position={[0, ROOM_HEIGHT / 2, -hd]}
        rotation={[0, 0, 0]}
        width={ROOM_WIDTH}
        height={ROOM_HEIGHT}
        color={wallColor}
      />
      <Wall
        position={[0, ROOM_HEIGHT / 2, hd]}
        rotation={[0, Math.PI, 0]}
        width={ROOM_WIDTH}
        height={ROOM_HEIGHT}
        color={wallColor}
      />
      <Wall
        position={[-hw, ROOM_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={ROOM_DEPTH}
        height={ROOM_HEIGHT}
        color={wallColor}
      />
      <Wall
        position={[hw, ROOM_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={ROOM_DEPTH}
        height={ROOM_HEIGHT}
        color={wallColor}
      />

      <mesh position={[0, ROOM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#efede8" roughness={1} metalness={0} />
      </mesh>

      <WindowPanel />
      <LivingRoomFurniture />
    </group>
  )
}
