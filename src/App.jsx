import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './components/Scene'
import './App.css'

export default function App() {
  return (
    <main className="canvas-wrap">
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
          <Scene />
        </Suspense>
      </Canvas>
    </main>
  )
}
