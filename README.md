# 3D_Havinix

This repository is a React + Vite + React Three Fiber living-room scene prototype.

## 1) Current State of the Project

### Implemented so far
- Single-page React app rendering a 3D interior scene in a `Canvas`.
- Componentized room shell: `Room`, `Floor`, `Wall`, `Rug`, `Sofa`, `CoffeeTable`, `FloorLamp`.
- Basic UI controls for:
  - wall color preset
  - floor material mode (`wood` / `tile`)
  - rug image selection
- Orbit camera controls with constrained rotation and zoom.
- Shadow-enabled lighting and mesh shadow flags on scene objects.

### What works visually and functionally
- The room geometry is present: floor, four walls, and a ceiling plane.
- Furniture layout is visible: sofa, coffee table, and floor lamp.
- Wall color dropdown updates wall material color in real time.
- Floor material dropdown switches floor material settings and map key.
- Rug option dropdown switches rug texture URL.
- Sofa GLB model loads from `public/models/sofa.glb`.

### Placeholder / temporary elements
- Window is a single emissive plane (`WindowPanel`), not an opening or physically correct glazing setup.
- Coffee table and floor lamp are primitive geometry approximations, not authored assets.
- Lighting is handcrafted and stylized, not physically calibrated.
- App-level controls are simple HTML selects without domain validation or persistence.

## 2) Tech Stack

### Frameworks and libraries
- `react` + `react-dom` for UI and state.
- `vite` for dev server and bundling.
- `three` as rendering/math engine.
- `@react-three/fiber` (R3F) for Three.js scene integration in React.
- `@react-three/drei` for helpers (`OrbitControls`, `useGLTF`, `useTexture`, `RoundedBox`).

### Asset formats in use
- `GLB` model: sofa at `public/models/sofa.glb`.
- Texture image paths are referenced as JPEG URLs under `/textures/*.jpg`.

### Important dependencies / assumptions
- Scene assumes `1 world unit = 1 meter` (`roomDimensions.js`).
- Texture-loading code assumes these files exist:
  - `/textures/wood.jpg`
  - `/textures/tile.jpg`
  - `/textures/rug1.jpg`
  - `/textures/rug2.jpg`
- These texture files are currently not present in `public`, so texture-dependent materials are currently unresolved.
- `@dnd-kit/utilities` is installed but not used in the current scene code.

## 3) Scene Structure

Current hierarchy (logical):
- `App`
  - top control panel (HTML/CSS)
  - `Canvas`
    - scene background color
    - lights (`hemisphere`, `ambient`, two `directional`, one with custom shadow camera)
    - `Room`
      - `Floor`
      - `Rug`
      - 4x `Wall`
      - ceiling mesh (inline, not separate component)
      - `WindowPanel` (inline helper in `Room`)
      - furniture group (`LivingRoomFurniture`, inline helper in `Room`)
        - `Sofa`
        - `CoffeeTable`
        - `FloorLamp`
    - `OrbitControls`

Componentization status:
- Componentized: floor, rug, walls, sofa, coffee table, floor lamp, room wrapper.
- Not componentized (inline in parent files): sun light setup, secondary directional light, ceiling mesh, window panel, furniture layout grouping.

## 4) Furniture & Assets

### Existing objects
- Sofa: GLB model (`Sofa` component).
- Coffee table: primitive geometry (`RoundedBox` top + box legs).
- Floor lamp: primitive geometry (box pole + sphere shade).
- Room shell: primitive planes (floor, walls, ceiling).
- Rug: textured plane.

### Primitive vs model
- GLB model: sofa only.
- Primitive meshes: walls, floor, ceiling, rug mesh, table, lamp, window panel.

### Model/asset loading paths
- GLB:
  - `/models/sofa.glb` (exists in `public/models/sofa.glb`)
- Referenced textures:
  - `/textures/wood.jpg` (missing)
  - `/textures/tile.jpg` (missing)
  - `/textures/rug1.jpg` (missing)
  - `/textures/rug2.jpg` (missing)

## 5) Lighting & Camera

### Lighting setup
- `hemisphereLight` for broad sky/ground fill.
- `ambientLight` for global base illumination.
- Main shadow-casting `directionalLight` ("sun") with tuned shadow map/camera bounds.
- Secondary directional fill light for color contrast.
- Lighting is non-PBR-calibrated and tuned for preview readability rather than photorealism.

### Camera and controls
- Perspective camera configured in `Canvas` (`fov`, near/far, initial position).
- `OrbitControls` enabled with damping.
- Interaction constraints:
  - clamped vertical orbit (`minPolarAngle`, `maxPolarAngle`)
  - clamped horizontal orbit (`minAzimuthAngle`, `maxAzimuthAngle`)
  - clamped zoom distance (`minDistance`, `maxDistance`)
- No collision checks, no first-person mode, and no saved viewpoints.

## 6) Performance Status

### Current concerns
- Missing textures can trigger asset-load errors/retries and unstable material state.
- Shadow map size is set to `2048x2048`; acceptable for a simple scene but can be expensive on low-end GPUs.
- Multiple dynamic lights plus shadow casting on many meshes increases fragment/shadow cost.
- No explicit performance instrumentation (FPS budgeting, regression checks, or device profiling) is present.

### Optimizations already applied
- GLTF preload call (`useGLTF.preload`) for sofa.
- Sofa scene is cloned once via `useMemo` before placement adjustments.
- Texture settings configured once per load callback (wrapping, color space, anisotropy).
- Camera controls are constrained, which limits worst-case overdraw viewpoints.

## 7) Known Issues / Limitations

### Visual issues
- Floor/rug textures are referenced but not included in repository `public` assets.
- Window representation is emissive only and does not behave like real exterior lighting.
- Primitive furniture (lamp/table) has low geometric/material detail.

### Structural / architectural issues
- Scene composition is partly split across components and partly inline in `App`/`Room`, which makes hierarchy ownership mixed.
- Lighting config is embedded in `App` rather than an isolated scene-lighting module.
- No centralized asset manifest; file paths are hardcoded in components.

### Clearly not final
- Current UI controls are prototype-level and do not persist or serialize scene state.
- Materials and lighting values are manually tuned without physically based target references.
- Scene scope is fixed to one room layout with static furniture positions.
