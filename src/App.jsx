import { Suspense, useId, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  DEFAULT_FLOOR_MATERIAL_KEY,
  FLOOR_PRESET_KEYS,
} from './materials/floorMaterials'
import {
  DEFAULT_WALL_MATERIAL_KEY,
  WALL_PRESET_KEYS,
} from './materials/wallMaterials'
import { FLOOR_UI, LIGHT_UI, WALL_UI } from './materialUiLabels'
import { Scene } from './components/Scene'
import './App.css'

const controlsMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
]

function buildStatusLine(wallKey, floorKey, lightKey) {
  const w = WALL_UI[wallKey]?.short ?? wallKey
  const f = FLOOR_UI[floorKey]?.short ?? floorKey
  const l = LIGHT_UI[lightKey]?.short ?? lightKey
  return `نور ${l}، دیوار ${w}، کف ${f}.`
}

export default function App() {
  const dockTitleId = useId()
  const wallGroupId = useId()
  const floorGroupId = useId()
  const lightGroupId = useId()

  const [wallMaterialKey, setWallMaterialKey] = useState(DEFAULT_WALL_MATERIAL_KEY)
  const [floorMaterialKey, setFloorMaterialKey] = useState(DEFAULT_FLOOR_MATERIAL_KEY)
  const [templateVariant, setTemplateVariant] = useState('night')
  const [materialDockCollapsed, setMaterialDockCollapsed] = useState(false)
  const dockBodyId = useId()

  const a11yStatus = buildStatusLine(wallMaterialKey, floorMaterialKey, templateVariant)

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
              wallMaterialKey={wallMaterialKey}
              floorMaterialKey={floorMaterialKey}
              templateVariant={templateVariant}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {a11yStatus}
      </div>

      <aside
        className={
          materialDockCollapsed ? 'material-dock material-dock--collapsed' : 'material-dock'
        }
        aria-labelledby={dockTitleId}
        role="complementary"
      >
        <div className="material-dock-inner">
          <header className="material-dock-header">
            <div className="material-dock-header-text">
              <p id={dockTitleId} className="material-dock-title">
                متریال صحنه
              </p>
              {!materialDockCollapsed && (
                <p className="material-dock-sub">دیوار، کف و نور روز/شب</p>
              )}
            </div>
            <button
              type="button"
              className="material-dock-collapse-toggle"
              aria-expanded={!materialDockCollapsed}
              aria-controls={dockBodyId}
              aria-label={
                materialDockCollapsed ? 'باز کردن پنل متریال' : 'جمع کردن پنل متریال'
              }
              onClick={() => setMaterialDockCollapsed((c) => !c)}
            >
              <svg
                className="material-dock-collapse-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {materialDockCollapsed ? (
                  <path d="M9 6l6 6-6 6" />
                ) : (
                  <path d="M15 6l-6 6 6 6" />
                )}
              </svg>
            </button>
          </header>

          <div
            id={dockBodyId}
            className="material-dock-body"
            hidden={materialDockCollapsed}
          >
          <section className="material-dock-section" role="group" aria-labelledby={lightGroupId}>
            <h2 id={lightGroupId} className="material-dock-section-title">
              نور و قالب
            </h2>
            <div className="material-segment" role="toolbar" aria-label="انتخاب روز یا شب">
              {(['night', 'day']).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={templateVariant === key ? 'material-chip active' : 'material-chip'}
                  aria-pressed={templateVariant === key}
                  aria-label={LIGHT_UI[key]?.a11y ?? key}
                  onClick={() => setTemplateVariant(key)}
                >
                  {LIGHT_UI[key]?.short ?? key}
                </button>
              ))}
            </div>
          </section>

          <section className="material-dock-section" role="group" aria-labelledby={wallGroupId}>
            <h2 id={wallGroupId} className="material-dock-section-title">
              دیوار
            </h2>
            <div className="material-chip-grid" role="toolbar" aria-label="انتخاب متریال دیوار">
              {WALL_PRESET_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={key === wallMaterialKey ? 'material-chip wide active' : 'material-chip wide'}
                  aria-pressed={key === wallMaterialKey}
                  aria-label={WALL_UI[key]?.a11y ?? `دیوار ${key}`}
                  onClick={() => setWallMaterialKey(key)}
                >
                  {WALL_UI[key]?.short ?? key}
                </button>
              ))}
            </div>
          </section>

          <section className="material-dock-section" role="group" aria-labelledby={floorGroupId}>
            <h2 id={floorGroupId} className="material-dock-section-title">
              کف
            </h2>
            <div className="material-chip-grid" role="toolbar" aria-label="انتخاب متریال کف">
              {FLOOR_PRESET_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={key === floorMaterialKey ? 'material-chip wide active' : 'material-chip wide'}
                  aria-pressed={key === floorMaterialKey}
                  aria-label={FLOOR_UI[key]?.a11y ?? `کف ${key}`}
                  onClick={() => setFloorMaterialKey(key)}
                >
                  {FLOOR_UI[key]?.short ?? key}
                </button>
              ))}
            </div>
          </section>
          </div>
        </div>
      </aside>
    </main>
  )
}
