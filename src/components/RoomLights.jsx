import { useLayoutEffect, useRef } from 'react'

export function RoomLights() {
  const keyLight = useRef(null)

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

  return (
    <>
      <hemisphereLight args={['#f0f3f8', '#988f86']} intensity={0.45} />
      <directionalLight
        ref={keyLight}
        castShadow
        position={[3.4, 3.6, 2.2]}
        intensity={1.05}
        color="#fff2df"
      />
    </>
  )
}
