import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  DEFAULT_FLOOR_MATERIAL_KEY,
  FLOOR_PRESETS,
} from '../materials/floorMaterials'
import {
  DEFAULT_WALL_MATERIAL_KEY,
  WALL_PRESETS,
} from '../materials/wallMaterials'

const NIGHT_GLB_PATH = '/src/template/sydney_apartment_night_-_custom_home.glb'
const DAY_GLB_PATH = '/src/template/sydney_apartment_-_quest_custom_home.glb'

function isWallObject(name) {
  const isWallLike = /wall|chimney|brick|plaster/i.test(name)
  const isNonWallDecor =
    /rug|carpet|floor|ground|tile|parquet|curtain|blind|drape|cloth|fabric|sofa|bed|pillow|table|desk|window|glass/i.test(
      name,
    )
  return isWallLike && !isNonWallDecor
}

function isFloorObject(name) {
  const isFloorLike = /floor|ground|tile|parquet|marble|wood/i.test(name)
  // Plane meshes are often shared by curtains/glass helpers in this GLB, so exclude soft decor.
  const isSoftDecor = /curtain|blind|drape|cloth|fabric|sofa|bed|pillow|rug|carpet|window|glass/i.test(name)
  return isFloorLike && !isSoftDecor
}

function isRugObject(name) {
  return /rug|carpet/i.test(name)
}

function isKnownRugMesh(obj, lowerName) {
  const selfName = (obj.name || '').toLowerCase()
  const parentName = (obj.parent?.name || '').toLowerCase()
  // This GLB uses Plane001_21 as rug fallback; keep it hard-blocked from wall/floor material swaps.
  return (
    isRugObject(lowerName) ||
    isRugObject(selfName) ||
    isRugObject(parentName) ||
    obj.name === 'Plane001_21' ||
    obj.parent?.name === 'Plane001_21'
  )
}

/** Avoid disposing textures still referenced by GLTF shared caches / drei's loader. */
function disposeMaterialWithoutMaps(material) {
  if (!material) return
  material.map = null
  material.normalMap = null
  material.roughnessMap = null
  material.metalnessMap = null
  material.aoMap = null
  material.lightMap = null
  material.emissiveMap = null
  material.alphaMap = null
  material.dispose()
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function configureMapTexture(texture, repeat, colorSpace, anisotropy = 0) {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.colorSpace = colorSpace
  texture.flipY = false
  if (anisotropy > 0) texture.anisotropy = anisotropy
  texture.needsUpdate = true
}

function startMaterialFade(material, fadeRef, firstApplyRef) {
  const reduce = prefersReducedMotion()
  if (firstApplyRef.current || reduce) {
    firstApplyRef.current = false
    fadeRef.current = null
    material.transparent = false
    material.opacity = 1
    return
  }
  material.transparent = true
  material.opacity = 0
  fadeRef.current = { startMs: performance.now(), durationMs: 380 }
}

export function ApartmentTemplate({
  wallColor = '#ebe8e3',
  floorVisible = true,
  rugVisible = true,
  floorTint = '#ffffff',
  wallMaterialKey = DEFAULT_WALL_MATERIAL_KEY,
  floorMaterialKey = DEFAULT_FLOOR_MATERIAL_KEY,
  templateVariant = 'night',
}) {
  const { gl } = useThree()
  const glbPath = templateVariant === 'day' ? DAY_GLB_PATH : NIGHT_GLB_PATH
  const { scene } = useGLTF(glbPath)
  const sceneClone = useMemo(() => scene.clone(true), [scene])

  const wallMeshesRef = useRef([])
  const floorMeshesRef = useRef([])

  const wallPreset = WALL_PRESETS[wallMaterialKey] ?? WALL_PRESETS[DEFAULT_WALL_MATERIAL_KEY]
  const floorPreset = FLOOR_PRESETS[floorMaterialKey] ?? FLOOR_PRESETS[DEFAULT_FLOOR_MATERIAL_KEY]

  const wallTextures = useTexture([
    wallPreset.baseColorMap,
    wallPreset.normalMap,
    wallPreset.roughnessMap,
  ])
  const floorTextures = useTexture([
    floorPreset.baseColorMap,
    floorPreset.normalMap,
    floorPreset.roughnessMap,
  ])

  const wallMaterialRef = useRef(null)
  const floorMaterialRef = useRef(null)
  const wallFadeRef = useRef(null)
  const floorFadeRef = useRef(null)
  const wallFirstApplyRef = useRef(true)
  const floorFirstApplyRef = useRef(true)

  const maxAnisotropy = useMemo(
    () => Math.min(12, gl?.capabilities?.getMaxAnisotropy?.() ?? 8),
    [gl],
  )

  useFrame(() => {
    const tickFade = (fadeRef, mat) => {
      const fade = fadeRef.current
      if (!fade || !mat) return
      const t = Math.min(1, (performance.now() - fade.startMs) / fade.durationMs)
      const eased = 1 - (1 - t) ** 3
      mat.opacity = eased
      if (t >= 1) {
        fadeRef.current = null
        mat.opacity = 1
        mat.transparent = false
      }
    }
    tickFade(wallFadeRef, wallMaterialRef.current)
    tickFade(floorFadeRef, floorMaterialRef.current)
  })

  useLayoutEffect(() => {
    sceneClone.updateMatrixWorld(true)

    wallMeshesRef.current = []
    floorMeshesRef.current = []
    let hasRugMesh = false

    sceneClone.traverse((obj) => {
      if (obj.isLight) {
        obj.visible = false
        return
      }
      if (!obj.isMesh) return

      const meshName = obj.parent?.name || obj.name || ''
      const lowerName = meshName.toLowerCase()
      const mat = obj.material
      const isRugMatch = isKnownRugMesh(obj, lowerName)
      const isFloorMatch = isFloorObject(lowerName)

      obj.frustumCulled = true
      obj.receiveShadow = !/smalldecor|photos|book|chess/i.test(lowerName)
      obj.castShadow = !/wallsnew|floor_new|plane001|blinds|curtain/i.test(lowerName)

      if (isRugMatch) {
        hasRugMesh = true
        obj.visible = rugVisible
        // Hard stop: rug should never inherit wall/floor material/color changes.
        return
      }

      // Skip multi-material targets — swapping requires knowing UV/layout per slot (TODO if needed later).
      if (isWallObject(lowerName) && mat && !Array.isArray(mat)) wallMeshesRef.current.push(obj)
      if (isFloorMatch && mat && !Array.isArray(mat)) floorMeshesRef.current.push(obj)

      if (!mat || Array.isArray(mat)) return

      if (!obj.userData.materialIsCloned) {
        obj.material = mat.clone()
        obj.userData.materialIsCloned = true
      }
      if (!obj.userData.baseColor && obj.material.color) {
        obj.userData.baseColor = obj.material.color.clone()
      }
      const baseColor = obj.userData.baseColor

      if (isWallObject(lowerName) && obj.material.color && baseColor) {
        obj.material.color.copy(baseColor).multiply(new THREE.Color(wallColor))
      }

      if (isFloorMatch) {
        obj.visible = floorVisible
        if (obj.material.color && baseColor) {
          obj.material.color.copy(baseColor).multiply(new THREE.Color(floorTint))
        }
      }

      // Rug handling is done upfront via isRugMatch guard.
    })

    if (!hasRugMesh) {
      const fallbackRug = sceneClone.getObjectByName('Plane001_21')
      if (fallbackRug) {
        fallbackRug.visible = rugVisible
      }
    }

    if (import.meta.env.DEV) {
      wallMeshesRef.current.forEach((mesh) => {
        const label = mesh.parent?.name || mesh.name || '(unnamed)'
        const mat = mesh.material
        const matInfo =
          Array.isArray(mat) ?
            mat.map((m) => m?.type ?? 'array-slot')
          : mat?.type ?? 'none'
        console.log('[ApartmentTemplate][DEV] wall mesh:', label, '| material:', matInfo)
      })
      floorMeshesRef.current.forEach((mesh) => {
        const label = mesh.parent?.name || mesh.name || '(unnamed)'
        const mat = mesh.material
        const matInfo =
          Array.isArray(mat) ?
            mat.map((m) => m?.type ?? 'array-slot')
          : mat?.type ?? 'none'
        console.log('[ApartmentTemplate][DEV] floor mesh:', label, '| material:', matInfo)
      })
    }
  }, [sceneClone, wallColor, floorVisible, rugVisible, floorTint])

  useEffect(() => {
    const [colorMap, normalMap, roughnessMap] = wallTextures
    configureMapTexture(colorMap, wallPreset.repeat, THREE.SRGBColorSpace, maxAnisotropy)
    configureMapTexture(normalMap, wallPreset.repeat, THREE.NoColorSpace, maxAnisotropy)
    configureMapTexture(roughnessMap, wallPreset.repeat, THREE.NoColorSpace, maxAnisotropy)

    if (!wallMaterialRef.current) {
      wallMaterialRef.current = new THREE.MeshStandardMaterial()
    }
    const shared = wallMaterialRef.current
    const isPlainWhiteWall = wallMaterialKey === 'painted_plaster'
    shared.map = isPlainWhiteWall ? null : colorMap
    shared.normalMap = isPlainWhiteWall ? null : normalMap
    shared.roughnessMap = isPlainWhiteWall ? null : roughnessMap
    shared.roughness = isPlainWhiteWall ? 0.92 : wallPreset.roughness
    shared.metalness = wallPreset.metalness
    shared.normalScale.set(
      isPlainWhiteWall ? 0 : wallPreset.normalScale[0],
      isPlainWhiteWall ? 0 : wallPreset.normalScale[1],
    )
    if (isPlainWhiteWall) {
      // Keep "simple wall" preset pure white.
      shared.color.set('#ffffff')
    } else {
      shared.color.set('#ffffff').multiply(new THREE.Color(wallColor))
    }

    wallMeshesRef.current.forEach((mesh) => {
      if (Array.isArray(mesh.material)) return
      const prev = mesh.material
      if (prev && prev !== shared) {
        disposeMaterialWithoutMaps(prev)
      }
      mesh.material = shared
    })

    shared.needsUpdate = true
    startMaterialFade(shared, wallFadeRef, wallFirstApplyRef)
  }, [wallTextures, wallPreset, wallColor, wallMaterialKey, maxAnisotropy, sceneClone])

  useEffect(() => {
    const [colorMap, normalMap, roughnessMap] = floorTextures
    configureMapTexture(colorMap, floorPreset.repeat, THREE.SRGBColorSpace, maxAnisotropy)
    configureMapTexture(normalMap, floorPreset.repeat, THREE.NoColorSpace, maxAnisotropy)
    configureMapTexture(roughnessMap, floorPreset.repeat, THREE.NoColorSpace, maxAnisotropy)

    if (!floorMaterialRef.current) {
      floorMaterialRef.current = new THREE.MeshStandardMaterial()
    }
    const shared = floorMaterialRef.current
    shared.map = colorMap
    shared.normalMap = normalMap
    shared.roughnessMap = roughnessMap
    shared.roughness = floorPreset.roughness
    shared.metalness = floorPreset.metalness
    shared.normalScale.set(floorPreset.normalScale[0], floorPreset.normalScale[1])
    shared.color.set('#ffffff').multiply(new THREE.Color(floorTint))

    floorMeshesRef.current.forEach((mesh) => {
      if (Array.isArray(mesh.material)) return
      mesh.visible = floorVisible
      const prev = mesh.material
      if (prev && prev !== shared) {
        disposeMaterialWithoutMaps(prev)
      }
      mesh.material = shared
    })

    shared.needsUpdate = true
    startMaterialFade(shared, floorFadeRef, floorFirstApplyRef)
  }, [floorTextures, floorPreset, floorTint, floorVisible, maxAnisotropy, sceneClone])

  useEffect(
    () => () => {
      if (wallMaterialRef.current) {
        disposeMaterialWithoutMaps(wallMaterialRef.current)
        wallMaterialRef.current = null
      }
      if (floorMaterialRef.current) {
        disposeMaterialWithoutMaps(floorMaterialRef.current)
        floorMaterialRef.current = null
      }
    },
    [],
  )

  return <primitive object={sceneClone} />
}

useGLTF.preload(NIGHT_GLB_PATH)
useGLTF.preload(DAY_GLB_PATH)
