# Third-party notices

## Futuristic Ambience (Nowhere)

- Artist: AlexGrohl
- Source: Pixabay, media ID 175592
- Original duration: 3:37
- License: Pixabay Content License
- Content ID: Registered by the creator

The soundtrack is used as background ambience for the Kardashev Scale experience. The production copy is encoded as a 96 kbps stereo MP3 for web delivery. The composition and recording are otherwise unchanged.

## NASA Earth imagery

### Equirectangular Projected Earth for LARGEST

- Source: NASA Goddard Space Flight Center Scientific Visualization Studio, visualization 3615
- Visualization: Greg Shirah, NASA/GSFC
- Blue Marble Next Generation data: Reto Stockli, NASA/GSFC, and NASA Earth Observatory
- Files used at runtime: `flat_earth_Largest_still.0330.jpg` and `flat_earth03.jpg`
- Source page: https://svs.gsfc.nasa.gov/3615/

NASA describes these equirectangular stills as images intended to be wrapped around a sphere. The application selects the 8192 by 4096 version on stronger devices and the 2048 by 1024 version on lower-power devices.

### Earth At Night

- Source: NASA Goddard Space Flight Center Scientific Visualization Studio, visualization 2916
- Data: Marc Imhoff, NASA/GSFC, and Christopher Elvidge, NOAA/NGDC
- Image: Craig Mayhew, NASA/GSFC, and Robert Simmon, NASA/GSFC
- File used at runtime: `earthatnight-2048.png`
- Source page: https://svs.gsfc.nasa.gov/2916/

The night-light texture is blended only onto the unlit hemisphere by a custom terminator shader.

NASA SVS visualizations are generally public-domain United States government works unless a source page states otherwise. The credits above follow the attribution requested on the relevant visualization pages.

## Real-time rendering libraries

The continuous 3D journey uses the following open-source libraries:

- Three.js, MIT License
- React Three Fiber, MIT License
- Drei, MIT License
- React Postprocessing, MIT License
- postprocessing, Zlib License

These packages provide the WebGL renderer, React scene graph, performance helpers, antialiasing, bloom, tone mapping integration, and postprocessing pipeline. The planetary, stellar, galactic, cosmological, molecular, atomic, nuclear, particle, and spacetime scenes in this project are original procedural implementations built on those libraries.
