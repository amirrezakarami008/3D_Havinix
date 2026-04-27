import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const GLB_PATH = '/src/template/sydney_apartment_night_-_custom_home.glb'

function makeCheckerTexture({
  size = 512,
  cell = 32,
  base = '#cfc4b6',
  accent = '#baa78f',
  alpha = 0.22,
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      if (((x / cell) + (y / cell)) % 2 !== 0) continue
      ctx.fillStyle = accent
      ctx.globalAlpha = alpha
      ctx.fillRect(x, y, cell, cell)
    }
  }
  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function makeNoiseTexture({
  size = 512,
  base = '#e5e5e5',
  noise = '#9ba3ad',
  strength = 0.13,
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < size * 1.8; i += 1) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = 0.7 + Math.random() * 1.6
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = noise
    ctx.globalAlpha = Math.random() * strength
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function makeWoodTexture({ size = 512 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, size, 0)
  gradient.addColorStop(0, '#b18358')
  gradient.addColorStop(0.5, '#9e754e')
  gradient.addColorStop(1, '#7d5939')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 70; i += 1) {
    const y = Math.random() * size
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(size * 0.25, y + Math.random() * 8, size * 0.75, y - Math.random() * 8, size, y)
    ctx.strokeStyle = `rgba(65, 41, 24, ${0.05 + Math.random() * 0.08})`
    ctx.lineWidth = 1 + Math.random() * 1.8
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function classifyMesh(name) {
  if (!name) return 'static'
  const staticMesh = /ceiling|roof|door|frame|window|stairs|railing|column|beam/i.test(name)
  if (staticMesh) return 'static'
  if (/bath|bathroom|toilet|sink|shower|wc/i.test(name)) return 'bathroom'
  if (/wall|chimney|brick|paint|plaster/i.test(name)) return 'wall'
  if (/floor|ground|plane/i.test(name)) return 'floor'
  if (/tile/i.test(name)) return 'bathroom'
  return 'static'
}

function isLikelySofaMesh(name, mesh) {
  if (/sofa|couch|armchair|loveseat|settee/i.test(name)) return true
  if (!mesh?.geometry) return false

  mesh.geometry.computeBoundingBox()
  const box = mesh.geometry.boundingBox
  if (!box) return false

  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  return (
    center.y > 0.12 &&
    center.y < 1.25 &&
    size.y > 0.35 &&
    size.y < 1.4 &&
    size.x > 0.65 &&
    size.x < 3.8 &&
    size.z > 0.5 &&
    size.z < 2.4
  )
}

function applyTiling(texture, repeatX, repeatY) {
  if (!texture) return
  texture.repeat.set(repeatX, repeatY)
  texture.needsUpdate = true
}

const WALL_TEXTURES = {
  none: null,
  plaster: makeNoiseTexture({
    base: '#f2eee8',
    noise: '#dcd2c7',
    strength: 0.18,
  }),
}

const FLOOR_TEXTURES = {
  tile: makeCheckerTexture({
    base: '#c5b39f',
    accent: '#aa947f',
    cell: 52,
    alpha: 0.28,
  }),
  wood: makeWoodTexture(),
  stone: makeNoiseTexture({
    base: '#b9bcc1',
    noise: '#767f8a',
    strength: 0.2,
  }),
}

const BATHROOM_TILE_TEXTURE = makeCheckerTexture({
  base: '#9cb1c8',
  accent: '#8499af',
  cell: 22,
  alpha: 0.35,
})

const CONTROLLED_MATERIALS = {
  wall: new THREE.MeshStandardMaterial({ color: '#ece5dc', roughness: 0.88, metalness: 0.02 }),
  floor: new THREE.MeshStandardMaterial({ color: '#d9ccbf', roughness: 0.82, metalness: 0.05 }),
  sofa: new THREE.MeshStandardMaterial({ color: '#8f9cab', roughness: 0.72, metalness: 0.04 }),
  bathroom: new THREE.MeshStandardMaterial({
    color: '#a9bed5',
    roughness: 0.96,
    metalness: 0.02,
    emissive: '#6f8aa5',
    emissiveIntensity: 0.08,
  }),
}

export function ApartmentTemplate({ roomConfig }) {
  const { scene } = useGLTF(GLB_PATH)
  const sceneClone = useMemo(() => scene.clone(true), [scene])
  const meshGroupsRef = useRef({
    wall: [],
    floor: [],
    sofa: [],
    bathroom: [],
  })
  const sofaMaterialsRef = useRef([])

  useEffect(() => {
    sceneClone.updateMatrixWorld(true)
    meshGroupsRef.current = { wall: [], floor: [], sofa: [], bathroom: [] }
    sofaMaterialsRef.current = []

    sceneClone.traverse((obj) => {
      if (obj.isLight) {
        obj.visible = false
        return
      }
      if (!obj.isMesh) return

      const meshName = `${obj.parent?.name || ''} ${obj.name || ''}`.trim()
      const lowerName = meshName.toLowerCase()
      let targetGroup = classifyMesh(lowerName)
      if (targetGroup === 'static' && isLikelySofaMesh(lowerName, obj)) {
        targetGroup = 'sofa'
      }

      obj.frustumCulled = true
      obj.receiveShadow = !/smalldecor|photos|book|chess/i.test(lowerName)
      obj.castShadow = !/wallsnew|floor_new|plane001|blinds|curtain/i.test(lowerName)
      if (targetGroup === 'static') return

      meshGroupsRef.current[targetGroup].push(obj)
      if (targetGroup === 'sofa') {
        if (Array.isArray(obj.material)) {
          const clonedMaterials = obj.material.map((material) => material?.clone?.() ?? material)
          obj.material = clonedMaterials
          clonedMaterials.forEach((material) => {
            if (material?.color) sofaMaterialsRef.current.push(material)
          })
        } else {
          const clonedMaterial = obj.material?.clone?.()
          if (clonedMaterial) {
            obj.material = clonedMaterial
            if (clonedMaterial.color) sofaMaterialsRef.current.push(clonedMaterial)
          }
        }
        return
      }
      obj.material = CONTROLLED_MATERIALS[targetGroup]
    })
  }, [sceneClone])

  useEffect(() => {
    const wallMaterial = CONTROLLED_MATERIALS.wall
    wallMaterial.color.set(roomConfig.wall.color)
    wallMaterial.map = WALL_TEXTURES[roomConfig.wall.textureKey] ?? null
    applyTiling(wallMaterial.map, 2, 2)
    wallMaterial.needsUpdate = true
  }, [roomConfig.wall.color, roomConfig.wall.textureKey])

  useEffect(() => {
    const floorMaterial = CONTROLLED_MATERIALS.floor
    floorMaterial.map = FLOOR_TEXTURES[roomConfig.floor.textureKey] ?? FLOOR_TEXTURES.tile
    applyTiling(floorMaterial.map, 3, 3)
    floorMaterial.needsUpdate = true
  }, [roomConfig.floor.textureKey])

  useEffect(() => {
    sofaMaterialsRef.current.forEach((material) => {
      if (!material?.color) return
      material.color.set(roomConfig.sofa.color)
      material.needsUpdate = true
    })
  }, [roomConfig.sofa.color])

  useEffect(() => {
    const bathroomMaterial = CONTROLLED_MATERIALS.bathroom
    bathroomMaterial.map = BATHROOM_TILE_TEXTURE
    applyTiling(bathroomMaterial.map, 4, 4)
    bathroomMaterial.needsUpdate = true
  }, [])

  return <primitive object={sceneClone} />
}

useGLTF.preload(GLB_PATH)
