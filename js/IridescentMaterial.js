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
function IridescentMaterial(irradianceProbe, radianceProbe, iridescenceLookUp) {
  var materialUniforms =
    {
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

  THREE.ShaderMaterial.call(this,
    {
      uniforms: materialUniforms,

      vertexShader:
        "varying vec3 vWorldPosition;\n" +
        "varying vec3 vWorldNormal;\n" +
        "\n" +
        "void main() {\n" +
        "    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n" +
        "    // normalMatrix is view space... we need world space which is okay here since we're using uniform scaling only\n" +
        "    vec4 viewPos = modelViewMatrix * vec4(position,1.0);\n" +
        "    vWorldNormal = mat3(modelMatrix) * normalize(normal);\n" +
        "    gl_Position = projectionMatrix * viewPos;\n" +
        "}",
      fragmentShader:
        "varying vec3 vWorldPosition;\n" +
        "varying vec3 vWorldNormal;\n" +
        "\n" +
        "uniform vec3 color;\n" +
        "uniform float boost;\n" +
        "uniform samplerCube specularProbe;\n" +
        "uniform samplerCube irradianceProbe;\n" +
        "uniform sampler2D iridescenceLookUp;\n" +
        "\n" +
        "void main() {\n" +
        "\n" +
        "    vec3 viewWorldDir = normalize(vWorldPosition - cameraPosition);\n" +
        "\n" +
        "    vec3 normal = normalize(vWorldNormal); //getNormal(normalSample.xy);\n" +
        "    vec3 viewNormal = mat3(viewMatrix) * normal;\n" +
        "\n" +
        "    vec3 albedo = color;\n" +
        "    vec3 diffuseLight = vec3(0.0);\n" +
        "    vec3 specularLight = vec3(0.0);\n" +
        "\n" +
        "    vec3 reflectedView = reflect(viewWorldDir, normal);\n" +
        "    float NdotV = max(-dot(viewWorldDir, normal), 0.0);\n" +
        "    float fresnelFactor = pow(1.0 - NdotV, 5.0);\n" +
        "\n" +
        "    // * .99 to remove the glossy bit\n" +
        "    vec3 airy = texture2D(iridescenceLookUp, vec2(NdotV * .99, 0.0)).xyz;\n" +
        "    airy *= airy;\n" +
        "\n" +
        "    vec4 reflectionSample = textureCube(specularProbe, reflectedView);\n" +
        "\n" +
        "    specularLight = reflectionSample.xyz * reflectionSample.xyz * airy * boost;\n" +
        "\n" +
        "    vec4 diffuseSample = textureCube(irradianceProbe, normal);\n" +
        "    diffuseLight = diffuseSample.xyz * diffuseSample.xyz;\n" +
        "\n" +
        "    vec3 final = albedo * diffuseLight + specularLight;\n" +
        "\n" +
        "    gl_FragColor = vec4(sqrt(final), 1.0);\n" +
        "}\n"
    }
  );

  this.extensions.derivatives = true;
};

IridescentMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  radianceProbe: {
    get: function() {
      return this.uniforms.radianceProbe.value;
    },
    set: function(value) {
      this.uniforms.radianceProbe.value = value;
    }
  },
  irradianceProbe: {
    get: function() {
      return this.uniforms.irradianceProbe.value;
    },
    set: function(value) {
      this.uniforms.irradianceProbe.value = value;
    }
  },
  iridescenceLookUp: {
    get: function() {
      return this.uniforms.iridescenceLookUp.value;
    },
    set: function(value) {
      this.uniforms.iridescenceLookUp.value = value;
    }
  },
  color: {
    get: function() {
      return this.uniforms.color.value;
    },

    set: function(value) {
      this.uniforms.color.value = value;
    }
  },
  boost: {
    get: function() {
      return this.uniforms.boost.value;
    },

    set: function(value) {
      this.uniforms.boost.value = value;
    }
  }
});