/* eslint-disable react-hooks/immutability --
 * @react-three/fiber useFrame and Three.js camera/vector mutations are intentional here.
 */
import { OrbitControls, PointerLockControls, useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  DEFAULT_FLOOR_MATERIAL_KEY,
  FLOOR_PRESETS,
} from '../materials/floorMaterials'
import {
  DEFAULT_WALL_MATERIAL_KEY,
  resolveMaterialLighting,
} from '../materials/wallMaterials'
import { ApartmentTemplate } from './ApartmentTemplate'
import { ROOM_DEPTH, ROOM_WIDTH } from '../constants/roomDimensions'
import { RoomLights } from './RoomLights'

/** Matches tone mapping to loaded PBR presets; Three.js exposes this only imperatively on WebGLRenderer. */
function MaterialToneExposure({ exposure }) {
  const { gl } = useThree()
  useEffect(() => {
    gl.toneMappingExposure = exposure
  }, [exposure, gl])
  return null
}

const SCENE_STYLING = {
  wallColor: '#f2ece3',
  floorVisible: true,
  rugVisible: true,
  floorTint: '#faf6f0',
}

const SECOND_PLACE_STYLING = {
  wallColor: '#e7edf7',
  floorVisible: true,
  rugVisible: true,
  floorTint: '#f8faff',
}

const EYE_HEIGHT = 1.62
const MOVE_SPEED = 2.2
const ROOM_MARGIN = 0.36

function OutsideView({ place }) {
  const isSecondPlace = place === 'building2'
  const skyTop = isSecondPlace ? '#bcd7f2' : '#5572a2'
  const skyBottom = isSecondPlace ? '#dbe7f5' : '#95aac9'

  const specs = useMemo(
    () => {
      const buildingPalette = isSecondPlace ?
          ['#617383', '#4f6070', '#748899', '#5a6f80']
        : ['#2f3440', '#252a33', '#3a414f', '#2a303a']
      return [
        { p: [-2.7, 1.15, ROOM_DEPTH / 2 + 3.6], s: [0.9, 2.2, 0.9], c: buildingPalette[0] },
        { p: [-1.65, 1.35, ROOM_DEPTH / 2 + 4.2], s: [1.1, 2.7, 1], c: buildingPalette[1] },
        { p: [-0.35, 0.95, ROOM_DEPTH / 2 + 3.2], s: [1, 1.9, 1], c: buildingPalette[2] },
        { p: [0.95, 1.4, ROOM_DEPTH / 2 + 4.6], s: [1.25, 2.8, 1], c: buildingPalette[3] },
        { p: [2.25, 1.1, ROOM_DEPTH / 2 + 3.7], s: [1, 2.1, 1], c: buildingPalette[0] },
      ]
    },
    [isSecondPlace],
  )

  return (
    <group>
      <mesh position={[0, 1.6, ROOM_DEPTH / 2 + 6.8]} renderOrder={-1}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial color={skyTop} fog={false} />
      </mesh>
      <mesh position={[0, -0.45, ROOM_DEPTH / 2 + 6.2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial color={skyBottom} fog={false} />
      </mesh>
      {specs.map((spec, idx) => (
        <mesh key={idx} position={spec.p}>
          <boxGeometry args={spec.s} />
          <meshStandardMaterial color={spec.c} roughness={0.9} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

function WalkAndInspectControls({ place }) {
  const { camera, scene, gl } = useThree()
  const [, getKeys] = useKeyboardControls()
  const orbitRef = useRef(null)
  const lockRef = useRef(null)
  const [isLocked, setIsLocked] = useState(false)

  const tmpForward = useMemo(() => new THREE.Vector3(), [])
  const tmpRight = useMemo(() => new THREE.Vector3(), [])
  const tmpMove = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const bounds = useMemo(
    () => ({
      minX: -ROOM_WIDTH / 2 + ROOM_MARGIN,
      maxX: ROOM_WIDTH / 2 - ROOM_MARGIN,
      minZ: -ROOM_DEPTH / 2 + ROOM_MARGIN,
      maxZ: ROOM_DEPTH / 2 - ROOM_MARGIN,
    }),
    [],
  )
  const transitionRef = useRef(null)

  useEffect(() => {
    const controls = lockRef.current
    if (!controls) return undefined

    const onLock = () => setIsLocked(true)
    const onUnlock = () => {
      // Keep camera exactly where FPS mode ended, then sync orbit target in front.
      setIsLocked(false)
      transitionRef.current = null
      if (!orbitRef.current) return

      camera.getWorldDirection(tmpForward)
      if (tmpForward.lengthSq() < 0.0001) tmpForward.set(0, 0, -1)
      tmpForward.normalize()
      const safeTarget = camera.position.clone().addScaledVector(tmpForward, 1.1)
      orbitRef.current.target.copy(safeTarget)
      orbitRef.current.update()
    }
    controls.addEventListener('lock', onLock)
    controls.addEventListener('unlock', onUnlock)

    return () => {
      controls.removeEventListener('lock', onLock)
      controls.removeEventListener('unlock', onUnlock)
    }
  }, [camera, tmpForward])

  useEffect(() => {
    const onDoubleClick = (event) => {
      if (isLocked) return

      const rect = gl.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(scene.children, true)
      const targetHit = hits.find((hit) => hit.object?.isMesh)
      if (!targetHit) return

      const box = new THREE.Box3().setFromObject(targetHit.object)
      if (box.isEmpty()) return

      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const radius = Math.max(size.length() * 0.5, 0.2)

      const direction = new THREE.Vector3().subVectors(camera.position, center)
      if (direction.lengthSq() < 0.0001) direction.set(0, 0, 1)
      direction.normalize()

      const toPos = center
        .clone()
        .addScaledVector(direction, Math.max(0.5, radius * 1.6))
      toPos.y = Math.max(center.y + 0.2, 0.9)

      transitionRef.current = {
        t: 0,
        fromPos: camera.position.clone(),
        fromTarget: orbitRef.current?.target.clone() ?? center.clone(),
        toPos,
        toTarget: center,
      }
    }

    gl.domElement.addEventListener('dblclick', onDoubleClick)
    return () => gl.domElement.removeEventListener('dblclick', onDoubleClick)
  }, [camera, gl.domElement, isLocked, pointer, raycaster, scene.children])

  useEffect(() => {
    camera.position.set(0.25, EYE_HEIGHT, 1.15)
    orbitRef.current?.target.set(0.05, 1.35, 0.3)
    orbitRef.current?.update()
  }, [camera, place])

  useFrame((_, delta) => {
    const clampCameraToInterior = () => {
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, bounds.minX, bounds.maxX)
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, bounds.minZ, bounds.maxZ)
      camera.position.y = Math.max(EYE_HEIGHT, camera.position.y)
    }

    if (!isLocked) {
      if (transitionRef.current) {
        const state = transitionRef.current
        state.t = Math.min(1, state.t + delta * 2.8)
        const eased = 1 - (1 - state.t) ** 3
        camera.position.lerpVectors(state.fromPos, state.toPos, eased)
        if (orbitRef.current) {
          orbitRef.current.target.lerpVectors(state.fromTarget, state.toTarget, eased)
          orbitRef.current.update()
        } else {
          camera.lookAt(state.toTarget)
        }
        if (state.t >= 1) transitionRef.current = null
      } else if (orbitRef.current) {
        orbitRef.current.update()
      }
      clampCameraToInterior()
      return
    }

    const { forward, backward, left, right, run } = getKeys()

    tmpMove.set(0, 0, 0)
    if (forward) tmpMove.z -= 1
    if (backward) tmpMove.z += 1
    if (left) tmpMove.x -= 1
    if (right) tmpMove.x += 1
    if (tmpMove.lengthSq() === 0) return

    camera.getWorldDirection(tmpForward)
    tmpForward.y = 0
    if (tmpForward.lengthSq() < 0.0001) return
    tmpForward.normalize()

    tmpRight.crossVectors(tmpForward, up).normalize()
    const speed = MOVE_SPEED * (run ? 1.65 : 1)

    camera.position.addScaledVector(tmpForward, -tmpMove.z * speed * delta)
    camera.position.addScaledVector(tmpRight, tmpMove.x * speed * delta)
    clampCameraToInterior()
    camera.position.y = EYE_HEIGHT
  })

  return (
    <>
      <PointerLockControls ref={lockRef} selector=".canvas-wrap" />
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enabled={!isLocked}
        enableDamping
        dampingFactor={0.08}
        target={[0.05, 1.35, 0.3]}
        minDistance={0.35}
        maxDistance={3.2}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI - 0.15}
      />
    </>
  )
}

export function Scene({
  place = 'home',
  wallMaterialKey = DEFAULT_WALL_MATERIAL_KEY,
  floorMaterialKey = DEFAULT_FLOOR_MATERIAL_KEY,
  templateVariant = 'night',
}) {
  const sceneStyling = place === 'home' ? SCENE_STYLING : SECOND_PLACE_STYLING
  const isSecondPlace = place === 'building2'

  const materialLighting = useMemo(
    () => resolveMaterialLighting(wallMaterialKey, floorMaterialKey, FLOOR_PRESETS),
    [wallMaterialKey, floorMaterialKey],
  )

  return (
    <>
      <MaterialToneExposure exposure={materialLighting.exposure} />
      <color attach="background" args={[isSecondPlace ? '#edf5ff' : '#d9dde4']} />
      <fog attach="fog" args={[isSecondPlace ? '#edf5ff' : '#d9dde4', 9, 24]} />
      <RoomLights place={place} mainLightIntensityFactor={materialLighting.intensityFactor} />
      <OutsideView place={place} />
      <ApartmentTemplate
        {...sceneStyling}
        wallMaterialKey={wallMaterialKey}
        floorMaterialKey={floorMaterialKey}
        templateVariant={templateVariant}
      />
      <group position={[0, 0.94, ROOM_DEPTH / 2 - 0.03]}>
        <mesh>
          <planeGeometry args={[0.95, 1.85]} />
          <meshStandardMaterial
            color="#92d9ff"
            emissive="#58c4ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.16}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.22, 0.32, 48]} />
          <meshBasicMaterial color="#b4ecff" transparent opacity={0.92} />
        </mesh>
      </group>
      <WalkAndInspectControls place={place} />
    </>
  )
}
