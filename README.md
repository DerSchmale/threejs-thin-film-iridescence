# threejs-thin-film-iridescence
A thin film iridescence approach for ThreeJS. The approach used is loosely based on [Belcour and Barla 2017](https://blogs.unity3d.com/2017/05/09/a-practical-extension-to-microfacet-theory-for-the-modeling-of-varying-iridescence/). The code setup and documentation could be a lot better, but since there's been an interest in this code, I decided to throw it online as is so people can already use it legally as open source (MIT).

# Example
See the example file [in action](https://derschmale.github.io/threejs-thin-film-iridescence/).

## Usage
Just grab the `js/ThinFilmFresnelMap.js` file and add it somewhere in your three.js project. This is a class providing a lookup texture containing the reflection colour replacing a normal PBR setup's fresnel colour. Metallic reflections are currently not supported, but a similar effect can be achieved by boosting the reflection values.

Create an instance of the texture:
```
let tex = new ThinFilmFresnelMap();
```

or

```
let tex = new ThinFilmFresnelMap(380, 2, 3, 64);  // respectively: thin film thickness (in nm), refractive index of the thin film, refractive index of the base layer, texture width)
```

In the shader using a regular PBR lighting model, you can replace the fresnel factor with the iridescence lookup, indexed by `dot(V, N)` (V pointing *towards* the camera, N pointing out of the surface). See `js/IridescentMaterial.js` for an example material. The texture contains the square roots of the camera, as a cheap approximation for gamma encoding, so be sure the square the result to get the correct linear value.

```
// Multiply by .99 to hide some glossy artifacts
vec3 airy = texture2D(iridescenceLookUp, vec2(NdotV * .99, 0.0)).xyz;
// convert from gamma 2 to linear
airy *= airy;
vec4 reflectionSample = textureCube(envMap, reflectedView);
// convert from gamma 2.2 to linear, if needed
reflectionSample = pow(reflectionSample, 2.2);
vec3 specularLight = reflectionSample.xyz * airy * boost;\n" +
```
