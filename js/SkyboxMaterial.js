/**
 * @classdesc
 * A simple material used for skyboxes with cube maps.
 *
 * @property envMap The environment cube map to use as the sky.
 *
 * @constructor
 * @param texture A cube map texture.
 *
 * @author David Lenaerts <http://www.derschmale.com>
 */
class SkyMaterial extends THREE.ShaderMaterial {

  constructor(texture) {

    const materialUniforms = {
      envMap: {
        value: texture
      }
    };

    super({
      uniforms: materialUniforms,

      vertexShader: `
        varying vec3 worldViewDir;
        
        void main() {
            vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            worldViewDir = worldPosition - cameraPosition;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 worldViewDir;
        uniform samplerCube envMap;
        
        void main() {
            vec3 elementDir = normalize(worldViewDir);
            gl_FragColor = textureCube(envMap, elementDir);
        }`
    });

    this.side = THREE.BackSide;
  }

  get envMap() {
    return this.uniforms.envMap.value;
  }

  set envMap(value) {
    this.uniforms.envMap.value = value;
  }
};