# Third-party notices

## Futuristic Ambience (Nowhere)

- Artist: AlexGrohl
- Source: Pixabay, media ID 175592
- Original duration: 3:37
- License: Pixabay Content License
- Content ID: Registered by the creator

The soundtrack is used as background ambience for the Kardashev Scale experience. The production copy is encoded as a 96 kbps stereo MP3 for web delivery. The composition and recording are otherwise unchanged.

## Earth imagery and texture maps

### NASA Earth at Night

- Source: NASA Goddard Space Flight Center Scientific Visualization Studio, visualization 2916
- Data: Marc Imhoff, NASA/GSFC, and Christopher Elvidge, NOAA/NGDC
- Image: Craig Mayhew, NASA/GSFC, and Robert Simmon, NASA/GSFC
- Source page: https://svs.gsfc.nasa.gov/2916/

The night-light layer is blended only onto the unlit hemisphere by a custom day-night terminator shader.

### Three.js planet texture set

The real-time Earth renderer loads the following texture maps from the Three.js `r185` example asset set through pinned `raw.githubusercontent.com` URLs:

- `earth_atmos_2048.jpg`
- `earth_specular_2048.jpg`
- `earth_normal_2048.jpg`
- `earth_lights_2048.png`
- `earth_clouds_1024.png`

The pinned mirror is used because the previous direct visualization-host URLs did not reliably provide the cross-origin response required for WebGL textures. The application does not silently substitute a decorative planet when those maps are available.

## Real-time rendering libraries

The continuous 3D journey uses the following open-source libraries:

- Three.js, MIT License
- React Three Fiber, MIT License
- Drei, MIT License
- React Postprocessing, MIT License
- postprocessing, Zlib License

These packages provide the WebGL renderer, React scene graph, performance helpers, antialiasing, bloom, tone mapping integration, and postprocessing pipeline. The planetary, stellar, galactic, cosmological, molecular, atomic, nuclear, particle, and spacetime scenes in this project are original procedural implementations built on those libraries.
