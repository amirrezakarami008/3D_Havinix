import { Suspense } from 'react'
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { Scene } from './components/Scene'
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

  const doorLabel =
    currentPlace === 'home' ? 'ورود به ساختمان دوم' : 'بازگشت به خانه اصلی'

  const handleDoorAction = () => {
    setCurrentPlace((prev) => (prev === 'home' ? 'building2' : 'home'))
    setNearDoor(false)
  }

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
              onDoorProximityChange={setNearDoor}
              onDoorInteract={handleDoorAction}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>
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
