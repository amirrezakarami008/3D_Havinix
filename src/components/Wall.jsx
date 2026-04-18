export function Wall({ position, rotation = [0, 0, 0], width, height, color }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.03}
        envMapIntensity={0.45}
      />
    </mesh>
  )
}
