import { ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH } from '../constants/roomDimensions'
import { Wall } from './Wall'
import { Floor } from './Floor'
import { Rug } from './Rug'
import { Sofa } from './Sofa'
import { CoffeeTable } from './CoffeeTable'
import { FloorLamp } from './FloorLamp'

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

/** Living layout only; furniture is separate components. */
function LivingRoomFurniture() {
  const tableZ = 0.72

  return (
    <group>
      <Sofa position={[0, 0, 0]} />
      <CoffeeTable position={[0, 0, tableZ]} />
      <FloorLamp position={[-hw + 0.22, 0, 0.15]} />
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
