import * as THREE from 'three'

/**
 * PBR wall presets. Most use `/public/textures/walls/...` (Poly Haven CC0).
 * `plaster006` / `wallpaper001a` use bundled assets under `src/assets/...` via Vite `import.meta.url`.
 *
 * Uncertainty: optimal repeat / normalScale depends on scene units and authored UVs — tuned conservatively.
 */

/** Local plaster PBR textures (Plaster006, ambientCG-style naming). */
const PLASTER006_BASE = '../assets/Plaster006_2K-JPG/Plaster006_2K-JPG'

const plaster006ColorUrl = new URL(`${PLASTER006_BASE}_Color.jpg`, import.meta.url).href
const plaster006NormalGlUrl = new URL(`${PLASTER006_BASE}_NormalGL.jpg`, import.meta.url).href
const plaster006RoughUrl = new URL(`${PLASTER006_BASE}_Roughness.jpg`, import.meta.url).href

/** Local wallpaper PBR textures (Wallpaper001A). */
const WALLPAPER001A_BASE = '../assets/Wallpaper001A_2K-JPG/Wallpaper001A_2K-JPG'

const wallpaper001aColorUrl = new URL(`${WALLPAPER001A_BASE}_Color.jpg`, import.meta.url).href
const wallpaper001aNormalGlUrl = new URL(`${WALLPAPER001A_BASE}_NormalGL.jpg`, import.meta.url).href
const wallpaper001aRoughUrl = new URL(`${WALLPAPER001A_BASE}_Roughness.jpg`, import.meta.url).href

export const DEFAULT_WALL_MATERIAL_KEY = 'painted_plaster'

export const WALL_PRESET_KEYS = /** @type {const} */ ([
  'painted_plaster',
  'plaster006',
  'wallpaper_book',
  'wallpaper_floral',
  'wallpaper001a',
])

/** @typedef {'painted_plaster' | 'plaster006' | 'wallpaper_book' | 'wallpaper_floral' | 'wallpaper001a'} WallMaterialKey */

/** @type {Record<WallMaterialKey, {
 *   baseColorMap: string
 *   normalMap: string
 *   roughnessMap: string
 *   repeat: [number, number]
 *   roughness: number
 *   metalness: number
 *   normalScale: [number, number]
 *   lighting: { intensityDelta: number, exposureDelta: number }
 * }>} */
export const WALL_PRESETS = {
  painted_plaster: {
    baseColorMap: '/textures/walls/painted_plaster/diff.jpg',
    normalMap: '/textures/walls/painted_plaster/nor_gl.jpg',
    roughnessMap: '/textures/walls/painted_plaster/rough.jpg',
    repeat: [2.2, 2.2],
    roughness: 0.94,
    metalness: 0,
    normalScale: [0.35, 0.35],
    lighting: { intensityDelta: 0.02, exposureDelta: 0.02 },
  },
  plaster006: {
    baseColorMap: plaster006ColorUrl,
    normalMap: plaster006NormalGlUrl,
    roughnessMap: plaster006RoughUrl,
    repeat: [2.4, 2.4],
    roughness: 0.92,
    metalness: 0,
    normalScale: [0.32, 0.32],
    lighting: { intensityDelta: 0.02, exposureDelta: 0.02 },
  },
  wallpaper_book: {
    baseColorMap: '/textures/walls/wallpaper_book/diff.jpg',
    normalMap: '/textures/walls/wallpaper_book/nor_gl.jpg',
    roughnessMap: '/textures/walls/wallpaper_book/rough.jpg',
    repeat: [2.4, 2.4],
    roughness: 0.9,
    metalness: 0,
    normalScale: [0.22, 0.22],
    lighting: { intensityDelta: 0.03, exposureDelta: 0.03 },
  },
  wallpaper_floral: {
    baseColorMap: '/textures/walls/wallpaper_floral/diff.jpg',
    normalMap: '/textures/walls/wallpaper_floral/nor_gl.jpg',
    roughnessMap: '/textures/walls/wallpaper_floral/rough.jpg',
    repeat: [2.6, 2.6],
    roughness: 0.86,
    metalness: 0,
    normalScale: [0.2, 0.2],
    lighting: { intensityDelta: 0.02, exposureDelta: 0.02 },
  },
  wallpaper001a: {
    baseColorMap: wallpaper001aColorUrl,
    normalMap: wallpaper001aNormalGlUrl,
    roughnessMap: wallpaper001aRoughUrl,
    repeat: [2.5, 2.5],
    roughness: 0.88,
    metalness: 0,
    normalScale: [0.22, 0.22],
    lighting: { intensityDelta: 0.03, exposureDelta: 0.03 },
  },
}

/**
 * Combines wall + floor deltas and clamps to requested ±10% intensity / ±0.1 exposure bands.
 * Uncertainty: perceptual match varies by HDR background and tone mapping — values are intentionally mild.
 */
export function resolveMaterialLighting(wallKey, floorKey, floorPresets) {
  const w = WALL_PRESETS[wallKey]?.lighting ?? { intensityDelta: 0, exposureDelta: 0 }
  const f = floorPresets[floorKey]?.lighting ?? { intensityDelta: 0, exposureDelta: 0 }

  const intensityDelta = THREE.MathUtils.clamp(w.intensityDelta + f.intensityDelta, -0.1, 0.1)
  const exposureDelta = THREE.MathUtils.clamp(w.exposureDelta + f.exposureDelta, -0.1, 0.1)

  return {
    intensityFactor: 1 + intensityDelta,
    exposure: 1 + exposureDelta,
  }
}
