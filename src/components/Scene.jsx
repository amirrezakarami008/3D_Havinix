import { OrbitControls, PointerLockControls, useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ApartmentTemplate } from './ApartmentTemplate'
import { ROOM_DEPTH, ROOM_WIDTH } from '../constants/roomDimensions'
import { RoomLights } from './RoomLights'

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
const DOOR_RADIUS = 1.35
const DOOR_POINTS = [
  new THREE.Vector3(1.55, EYE_HEIGHT, ROOM_DEPTH / 2 - 0.48),
  new THREE.Vector3(0, EYE_HEIGHT, ROOM_DEPTH / 2 - 0.45),
  new THREE.Vector3(-1.55, EYE_HEIGHT, ROOM_DEPTH / 2 - 0.48),
]

function WalkAndInspectControls({ onDoorProximityChange, onDoorInteract, place }) {
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
  const nearDoorRef = useRef(false)
  const interactPressedRef = useRef(false)

  useEffect(() => {
    const controls = lockRef.current
    if (!controls) return undefined

    const onLock = () => setIsLocked(true)
    const onUnlock = () => setIsLocked(false)
    controls.addEventListener('lock', onLock)
    controls.addEventListener('unlock', onUnlock)

    return () => {
      controls.removeEventListener('lock', onLock)
      controls.removeEventListener('unlock', onUnlock)
    }
  }, [])

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

  useEffect(() => () => onDoorProximityChange?.(false), [onDoorProximityChange])

  useFrame((_, delta) => {
    const isNearDoor = DOOR_POINTS.some((doorPoint) => {
      const dx = camera.position.x - doorPoint.x
      const dz = camera.position.z - doorPoint.z
      return Math.hypot(dx, dz) <= DOOR_RADIUS
    })
    if (isNearDoor !== nearDoorRef.current) {
      nearDoorRef.current = isNearDoor
      onDoorProximityChange?.(isNearDoor)
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
      return
    }

    const { forward, backward, left, right, run, interact } = getKeys()
    if (interact && !interactPressedRef.current && nearDoorRef.current) {
      onDoorInteract?.()
    }
    interactPressedRef.current = interact

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
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, bounds.minX, bounds.maxX)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, bounds.minZ, bounds.maxZ)
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

export function Scene({ place = 'home', onDoorProximityChange, onDoorInteract }) {
  const sceneStyling = place === 'home' ? SCENE_STYLING : SECOND_PLACE_STYLING
  const isSecondPlace = place === 'building2'

  return (
    <>
      <color attach="background" args={[isSecondPlace ? '#edf5ff' : '#d9dde4']} />
      <fog attach="fog" args={[isSecondPlace ? '#edf5ff' : '#d9dde4', 9, 24]} />
      <RoomLights place={place} />
      <ApartmentTemplate {...sceneStyling} />
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
      <WalkAndInspectControls
        onDoorProximityChange={onDoorProximityChange}
        onDoorInteract={onDoorInteract}
        place={place}
      />
    </>
  )
}
