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
function SkyMaterial(texture) {
  var materialUniforms =
    {
      envMap: {
        value: texture
      }
    };

  THREE.ShaderMaterial.call(this,
    {
      uniforms: materialUniforms,

      vertexShader:
        "varying vec3 worldViewDir;\n" +
        "\n" +
        "void main() {\n" +
        "    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n" +
        "    worldViewDir = worldPosition - cameraPosition;\n" +
        "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
        "}",
      fragmentShader:
        "varying vec3 worldViewDir;\n" +
        "\n" +
        "uniform samplerCube envMap;\n" +
        "\n" +
        "void main()\n" +
        "{\n" +
        "    vec3 elementDir = normalize(worldViewDir);\n" +
        "    gl_FragColor = textureCube(envMap, elementDir);\n" +
        "}\n"
    }
  );

  this.side = THREE.BackSide;
};

SkyMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  envMap: {
    get: function() {
      return this.uniforms.envMap.value;
    },
    set: function(value) {
      this.uniforms.envMap.value = value;
    }
  }
});