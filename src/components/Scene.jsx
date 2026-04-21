import { OrbitControls } from '@react-three/drei'
import { ApartmentTemplate } from './ApartmentTemplate'
import { RoomLights } from './RoomLights'

const SCENE_STYLING = {
  wallColor: '#f2ece3',
  floorVisible: true,
  rugVisible: true,
  floorTint: '#faf6f0',
}

export function Scene() {
  return (
    <>
      <color attach="background" args={['#d9dde4']} />
      <fog attach="fog" args={['#d9dde4', 9, 24]} />
      <RoomLights />
      <ApartmentTemplate {...SCENE_STYLING} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        target={[0.05, 1.4, 0.35]}
        minPolarAngle={0.92}
        maxPolarAngle={1.62}
        minAzimuthAngle={-0.75}
        maxAzimuthAngle={0.75}
        minDistance={0.7}
        maxDistance={2.2}
      />
    </>
  )
}
