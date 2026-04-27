import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { Scene } from './components/Scene'
import { DEFAULT_ROOM_CONFIG, FLOOR_TEXTURE_KEYS, WALL_TEXTURE_KEYS } from './constants/roomConfig'
import './App.css'

const controlsMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'interact', keys: ['KeyE'] },
]

export default function App() {
  const [currentPlace, setCurrentPlace] = useState('home')
  const [nearDoor, setNearDoor] = useState(false)
  const [roomConfig, setRoomConfig] = useState(DEFAULT_ROOM_CONFIG)

  const doorLabel =
    currentPlace === 'home' ? 'ورود به ساختمان دوم' : 'بازگشت به خانه اصلی'

  const handleDoorAction = () => {
    setCurrentPlace((prev) => (prev === 'home' ? 'building2' : 'home'))
    setNearDoor(false)
  }
  const handleWallColorChange = useCallback((event) => {
    const color = event.target.value
    setRoomConfig((prev) => ({ ...prev, wall: { ...prev.wall, color } }))
  }, [])
  const handleWallTextureChange = useCallback((event) => {
    const textureKey = event.target.value
    setRoomConfig((prev) => ({ ...prev, wall: { ...prev.wall, textureKey } }))
  }, [])
  const handleFloorTextureChange = useCallback((event) => {
    const textureKey = event.target.value
    setRoomConfig((prev) => ({ ...prev, floor: { ...prev.floor, textureKey } }))
  }, [])
  const handleSofaColorChange = useCallback((event) => {
    const color = event.target.value
    setRoomConfig((prev) => ({ ...prev, sofa: { ...prev.sofa, color } }))
  }, [])

  return (
    <main className="canvas-wrap">
      <KeyboardControls map={controlsMap}>
        <Canvas
          shadows
          camera={{ position: [0.25, 1.62, 1.15], fov: 50, near: 0.03, far: 24 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
        >
          <Suspense fallback={null}>
            <Scene
              place={currentPlace}
              roomConfig={roomConfig}
              onDoorProximityChange={setNearDoor}
              onDoorInteract={handleDoorAction}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <section className="room-customizer-panel" aria-label="Room customization panel">
        <h2>Room Config</h2>
        <label>
          Wall color
          <input type="color" value={roomConfig.wall.color} onChange={handleWallColorChange} />
        </label>
        <label>
          Wall texture
          <select value={roomConfig.wall.textureKey} onChange={handleWallTextureChange}>
            {WALL_TEXTURE_KEYS.map((textureKey) => (
              <option key={textureKey} value={textureKey}>
                {textureKey}
              </option>
            ))}
          </select>
        </label>
        <label>
          Floor material
          <select value={roomConfig.floor.textureKey} onChange={handleFloorTextureChange}>
            {FLOOR_TEXTURE_KEYS.map((textureKey) => (
              <option key={textureKey} value={textureKey}>
                {textureKey}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sofa color
          <input type="color" value={roomConfig.sofa.color} onChange={handleSofaColorChange} />
        </label>
      </section>
      {nearDoor && (
        <div className="door-action-wrap">
          <button className="door-action-button" onClick={handleDoorAction}>
            {doorLabel}
          </button>
          <p className="door-action-hint">یا کلید E رو بزن</p>
        </div>
      )}
    </main>
  )
}
