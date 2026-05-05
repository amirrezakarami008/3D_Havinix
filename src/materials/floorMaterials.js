/**
 * PBR floor presets. Most use `/public/textures/floors/...` (Poly Haven CC0).
 * Parquet / ceramic presets use bundled assets via `new URL(..., import.meta.url)` (ambientCG-style naming).
 *
 * Uncertainty / note: AO and displacement textures exist in that folder but are not wired here —
 * aoMap expects a second UV set on arbitrary GLB meshes; displacement would need geometry tessellation.
 * TODO(UV): If planks/tiles look stretched or rotated wrong on this GLB, adjust repeat only.
 */

/** Local parquet PBR textures (ambientCG naming). */
const PARQUET_WOOD_FLOOR_FOLDER = '../assets/WoodFloor043_2K-JPG (2)/WoodFloor043_2K-JPG'

const parquetColorUrl = new URL(`${PARQUET_WOOD_FLOOR_FOLDER}_Color.jpg`, import.meta.url).href
const parquetNormalGlUrl = new URL(`${PARQUET_WOOD_FLOOR_FOLDER}_NormalGL.jpg`, import.meta.url).href
const parquetRoughUrl = new URL(`${PARQUET_WOOD_FLOOR_FOLDER}_Roughness.jpg`, import.meta.url).href

/** Local ceramic tile PBR textures (Tiles078). */
const TILES078_BASE = '../assets/Tiles078_2K-JPG/Tiles078_2K-JPG'

const tiles078ColorUrl = new URL(`${TILES078_BASE}_Color.jpg`, import.meta.url).href
const tiles078NormalGlUrl = new URL(`${TILES078_BASE}_NormalGL.jpg`, import.meta.url).href
const tiles078RoughUrl = new URL(`${TILES078_BASE}_Roughness.jpg`, import.meta.url).href

/** Local ceramic tile PBR textures (Tiles051). */
const TILES051_BASE = '../assets/Tiles051_2K-JPG/Tiles051_2K-JPG'

const tiles051ColorUrl = new URL(`${TILES051_BASE}_Color.jpg`, import.meta.url).href
const tiles051NormalGlUrl = new URL(`${TILES051_BASE}_NormalGL.jpg`, import.meta.url).href
const tiles051RoughUrl = new URL(`${TILES051_BASE}_Roughness.jpg`, import.meta.url).href

/** Local tile PBR textures (Tiles002, 4K set — still loaded as URLs; GPU memory depends on device). */
const TILES002_BASE = '../assets/Tiles002_4K-JPG/Tiles002_4K-JPG'

const tiles002ColorUrl = new URL(`${TILES002_BASE}_Color.jpg`, import.meta.url).href
const tiles002NormalGlUrl = new URL(`${TILES002_BASE}_NormalGL.jpg`, import.meta.url).href
const tiles002RoughUrl = new URL(`${TILES002_BASE}_Roughness.jpg`, import.meta.url).href

export const DEFAULT_FLOOR_MATERIAL_KEY = 'oak_wood'

export const FLOOR_PRESET_KEYS = /** @type {const} */ ([
  'oak_wood',
  'wood_parquet',
  'tiles078',
  'tiles051',
  'tiles002',
  'stone_tile',
])

/** @typedef {'oak_wood' | 'wood_parquet' | 'tiles078' | 'tiles051' | 'tiles002' | 'stone_tile'} FloorMaterialKey */

/** @type {Record<FloorMaterialKey, {
 *   baseColorMap: string
 *   normalMap: string
 *   roughnessMap: string
 *   repeat: [number, number]
 *   roughness: number
 *   metalness: number
 *   normalScale: [number, number]
 *   lighting: { intensityDelta: number, exposureDelta: number }
 * }>} */
export const FLOOR_PRESETS = {
  oak_wood: {
    baseColorMap: '/textures/floors/oak_wood/diff.jpg',
    normalMap: '/textures/floors/oak_wood/nor_gl.jpg',
    roughnessMap: '/textures/floors/oak_wood/rough.jpg',
    repeat: [6, 6],
    roughness: 0.82,
    metalness: 0,
    normalScale: [0.32, 0.32],
    lighting: { intensityDelta: 0.03, exposureDelta: -0.02 },
  },
  wood_parquet: {
    baseColorMap: parquetColorUrl,
    normalMap: parquetNormalGlUrl,
    roughnessMap: parquetRoughUrl,
    repeat: [4, 4],
    roughness: 0.76,
    metalness: 0,
    normalScale: [0.55, 0.55],
    lighting: { intensityDelta: 0.02, exposureDelta: -0.02 },
  },
  tiles078: {
    baseColorMap: tiles078ColorUrl,
    normalMap: tiles078NormalGlUrl,
    roughnessMap: tiles078RoughUrl,
    repeat: [5.5, 5.5],
    roughness: 0.48,
    metalness: 0,
    normalScale: [0.38, 0.38],
    lighting: { intensityDelta: -0.05, exposureDelta: -0.04 },
  },
  tiles051: {
    baseColorMap: tiles051ColorUrl,
    normalMap: tiles051NormalGlUrl,
    roughnessMap: tiles051RoughUrl,
    repeat: [5.2, 5.2],
    roughness: 0.5,
    metalness: 0,
    normalScale: [0.36, 0.36],
    lighting: { intensityDelta: -0.05, exposureDelta: -0.04 },
  },
  tiles002: {
    baseColorMap: tiles002ColorUrl,
    normalMap: tiles002NormalGlUrl,
    roughnessMap: tiles002RoughUrl,
    repeat: [5.8, 5.8],
    roughness: 0.46,
    metalness: 0,
    normalScale: [0.4, 0.4],
    lighting: { intensityDelta: -0.05, exposureDelta: -0.04 },
  },
  stone_tile: {
    baseColorMap: '/textures/floors/marble_tile/diff.jpg',
    normalMap: '/textures/floors/marble_tile/nor_gl.jpg',
    roughnessMap: '/textures/floors/marble_tile/rough.jpg',
    repeat: [4.5, 4.5],
    roughness: 0.42,
    metalness: 0,
    normalScale: [0.22, 0.22],
    lighting: { intensityDelta: -0.06, exposureDelta: -0.05 },
  },
}
