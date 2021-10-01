/**
 * @classdesc
 * A minimal example to show how the texture can be used.
 *
 * @property irradianceProbe A cube map containing diffuse lighting information.
 * @property radianceProbe A cube map containing specular lighting information.
 * @property iridescenceLookUp An instance of ThinFilmFresnelMap.
 * @property color The base color of the material.
 * @property boost A value to magically boost the iridescent reflections.
 *
 * @constructor
 * @param irradianceProbe A cube map containing diffuse lighting information.
 * @param radianceProbe A cube map containing specular lighting information.
 * @param iridescenceLookUp An instance of ThinFilmFresnelMap.
 *
 * @author David Lenaerts <http://www.derschmale.com>
 */
class IridescentMaterial extends THREE.ShaderMaterial {

  constructor(irradianceProbe, radianceProbe, iridescenceLookUp) {

    const materialUniforms = {
      irradianceProbe: {
        value: irradianceProbe
      },
      radianceProbe: {
        value: radianceProbe
      },
      iridescenceLookUp: {
        value: iridescenceLookUp
      },
      color: {
        value: new THREE.Color(1.0, 1.0, 1.0)
      },
      boost: {
        value: 1.0
      }
    };

    super({
      uniforms: materialUniforms,

      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        
        void main() {
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            // normalMatrix is view space... we need world space which is okay here since we're using uniform scaling only
            vec4 viewPos = modelViewMatrix * vec4(position,1.0);
            vWorldNormal = mat3(modelMatrix) * normalize(normal);
            gl_Position = projectionMatrix * viewPos;
        }`,
      fragmentShader: `
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        
        uniform vec3 color;
        uniform float boost;
        uniform samplerCube radianceProbe;
        uniform samplerCube irradianceProbe;
        uniform sampler2D iridescenceLookUp;
        
        void main() {
        
            vec3 viewWorldDir = normalize(vWorldPosition - cameraPosition);
        
            vec3 normal = normalize(vWorldNormal); //getNormal(normalSample.xy);
            vec3 viewNormal = mat3(viewMatrix) * normal;
        
            vec3 albedo = color;
            vec3 diffuseLight = vec3(0.0);
            vec3 specularLight = vec3(0.0);
        
            vec3 reflectedView = reflect(viewWorldDir, normal);
            float NdotV = max(-dot(viewWorldDir, normal), 0.0);
            float fresnelFactor = pow(1.0 - NdotV, 5.0);
        
            // * .99 to remove the glossy bit
            vec3 airy = texture2D(iridescenceLookUp, vec2(NdotV * .99, 0.0)).xyz;
            airy *= airy;
        
            vec4 reflectionSample = textureCube(radianceProbe, reflectedView);
        
            specularLight = reflectionSample.xyz * reflectionSample.xyz * airy * boost;
        
            vec4 diffuseSample = textureCube(irradianceProbe, normal);
            diffuseLight = diffuseSample.xyz * diffuseSample.xyz;
        
            vec3 final = albedo * diffuseLight + specularLight;
        
            gl_FragColor = vec4(sqrt(final), 1.0);
        }`
    });

    this.extensions.derivatives = true;
  }

  get radianceProbe() {
    return this.uniforms.radianceProbe.value;
  }
  set radianceProbe(value) {
    this.uniforms.radianceProbe.value = value;
  }

  get irradianceProbe() {
    return this.uniforms.irradianceProbe.value;
  }
  set irradianceProbe(value) {
    this.uniforms.irradianceProbe.value = value;
  }

  get iridescenceLookUp() {
    return this.uniforms.iridescenceLookUp.value;
  }
  set iridescenceLookUp(value) {
    this.uniforms.iridescenceLookUp.value = value;
  }

  get color() {
    return this.uniforms.color.value;
  }
  set color(value) {
    this.uniforms.color.value = value;
  }

  get boost() {
    return this.uniforms.boost.value;
  }
  set boost(value) {
    this.uniforms.boost.value = value;
  }
};