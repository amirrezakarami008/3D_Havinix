import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Room } from './components/Room'
import { CAMERA_BG } from './constants/roomDimensions'
import './App.css'

const WALL_PRESETS = [
  { value: '#ebe8e3', label: 'Warm white' },
  { value: '#c5d1c8', label: 'Sage' },
  { value: '#b8c4d4', label: 'Dusty blue' },
  { value: '#d4c8bc', label: 'Greige' },
  { value: '#3a3d42', label: 'Soft charcoal' },
]

const RUG_OPTIONS = [
  { value: '/textures/rug1.jpg', label: 'Area rug A' },
  { value: '/textures/rug2.jpg', label: 'Area rug B' },
]

function SunLight() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const l = ref.current
    if (!l?.shadow) return
    l.shadow.mapSize.set(2048, 2048)
    l.shadow.bias = -0.00025
    const cam = l.shadow.camera
    cam.near = 0.5
    cam.far = 30
    cam.left = -8
    cam.right = 8
    cam.top = 8
    cam.bottom = -8
    cam.updateProjectionMatrix()
  }, [])
  return (
    <directionalLight
      ref={ref}
      castShadow
      position={[4.8, 3.1, -2.1]}
      intensity={1.12}
      color="#fff4e6"
    />
  )
}

function Scene({ wallColor, floorMaterial, rugImageUrl }) {
  return (
    <>
      <color attach="background" args={[CAMERA_BG]} />
      <hemisphereLight args={['#eef1f5', '#9d9792']} intensity={0.62} />
      <ambientLight intensity={0.32} color="#f4f4f4" />
      <SunLight />
      <directionalLight position={[-3.2, 1.6, 2.4]} intensity={0.38} color="#d8e6ff" />

      <Room wallColor={wallColor} floorMaterial={floorMaterial} rugImageUrl={rugImageUrl} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        target={[0, 1.45, 0]}
        minPolarAngle={0.38}
        maxPolarAngle={Math.PI / 2 - 0.06}
        minAzimuthAngle={-Math.PI / 2.35}
        maxAzimuthAngle={Math.PI / 2.35}
        minDistance={1.35}
        maxDistance={4.25}
      />
    </>
  )
}

export default function App() {
  const [wallColor, setWallColor] = useState(WALL_PRESETS[0].value)
  const [floorMaterial, setFloorMaterial] = useState('wood')
  const [rugImageUrl, setRugImageUrl] = useState(RUG_OPTIONS[0].value)

  return (
    <div className="app-shell">
      <header className="control-panel">
        <h1 className="title">Living room preview</h1>
        <div className="controls-row">
          <label className="field">
            <span>Wall color</span>
            <select value={wallColor} onChange={(e) => setWallColor(e.target.value)}>
              {WALL_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Floor material</span>
            <select value={floorMaterial} onChange={(e) => setFloorMaterial(e.target.value)}>
              <option value="wood">Wood</option>
              <option value="tile">Tile</option>
            </select>
          </label>
          <label className="field">
            <span>Carpet texture</span>
            <select value={rugImageUrl} onChange={(e) => setRugImageUrl(e.target.value)}>
              {RUG_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="canvas-wrap">
        <Canvas
          shadows
          camera={{ position: [1.35, 1.58, 3.85], fov: 42, near: 0.08, far: 60 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.02,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
        >
          <Suspense fallback={null}>
            <Scene wallColor={wallColor} floorMaterial={floorMaterial} rugImageUrl={rugImageUrl} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
