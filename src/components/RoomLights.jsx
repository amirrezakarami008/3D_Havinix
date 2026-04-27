import { useLayoutEffect, useRef } from 'react'

export function RoomLights({ place = 'home' }) {
  const keyLight = useRef(null)
  const ceilingSpot = useRef(null)
  const isSecondPlace = place === 'building2'

  useLayoutEffect(() => {
    const light = keyLight.current
    if (!light?.shadow) return
    light.shadow.mapSize.set(1024, 1024)
    light.shadow.bias = -0.0002
    const shadowCam = light.shadow.camera
    shadowCam.near = 0.5
    shadowCam.far = 20
    shadowCam.left = -6
    shadowCam.right = 6
    shadowCam.top = 6
    shadowCam.bottom = -6
    shadowCam.updateProjectionMatrix()
  }, [])

  useLayoutEffect(() => {
    const light = ceilingSpot.current
    if (!light?.shadow) return
    light.shadow.mapSize.set(1024, 1024)
    light.shadow.bias = -0.00015
    light.shadow.camera.near = 0.4
    light.shadow.camera.far = 12
    light.shadow.focus = 0.85
  }, [])

  return (
    <>
      <ambientLight intensity={isSecondPlace ? 0.62 : 0.28} color={isSecondPlace ? '#f7fbff' : '#f6f2ea'} />
      <hemisphereLight
        args={isSecondPlace ? ['#f6fbff', '#a7b9cc'] : ['#f2f6fc', '#9b8f82']}
        intensity={isSecondPlace ? 1.25 : 0.62}
      />
      <directionalLight
        ref={keyLight}
        castShadow
        position={[3.4, 3.6, 2.2]}
        intensity={isSecondPlace ? 2.05 : 1.28}
        color={isSecondPlace ? '#fff8ef' : '#fff2df'}
      />
      <directionalLight
        position={[-2.6, 2.4, -2]}
        intensity={isSecondPlace ? 1.05 : 0.52}
        color={isSecondPlace ? '#e7f2ff' : '#d8e7ff'}
      />
      <spotLight
        ref={ceilingSpot}
        castShadow
        position={[0.15, 2.45, 0.35]}
        angle={0.95}
        penumbra={0.55}
        intensity={isSecondPlace ? 1.8 : 0.95}
        decay={1.35}
        distance={isSecondPlace ? 10 : 8}
        color={isSecondPlace ? '#fff4df' : '#ffe9cf'}
      >
        <object3D attach="target" position={[0, 0.75, 0.45]} />
      </spotLight>
    </>
  )
}
