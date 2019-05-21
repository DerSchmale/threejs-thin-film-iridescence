var scene;
var camera;
var renderer;
var container;
var controls;
var iridescenceLookUp;
var iridescenceMaterial;
var torus;

window.onload = function() {
  init();

  initScene();
  initGui();
  onResize();
  render();

  window.addEventListener("resize", onResize, false);
};

function init() {
  container = document.getElementById("webglcontainer");
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 50);
  scene.add(camera);
  controls = new THREE.OrbitControls(camera, container);
  container.appendChild(renderer.domElement);

  iridescenceLookUp = new ThinFilmFresnelMap();

  controls.update();
}

function onResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  renderer.setSize(width, height);
  renderer.domElement.style.width = width + "px";
  renderer.domElement.style.height = height + "px";

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function render() {
  torus.rotation.y += .01;
  torus.rotation.x += .009;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function initScene() {
  var size = 1000;
  var skyGeom = new THREE.CubeGeometry(size, size, size);
  var radiance = loadCubeMap("assets/skybox/radiance");
  var irradiance = loadCubeMap("assets/skybox/irradiance");
  var skyboxMaterial = new SkyMaterial(radiance);
  var skyBox = new THREE.Mesh(skyGeom, skyboxMaterial);
  scene.add(skyBox);

  var torusGeom = new THREE.TorusKnotGeometry(10, 3, 100, 16);
  iridescenceMaterial = new IridescentMaterial(irradiance, radiance, iridescenceLookUp);
  // metallicness in the thin film filter is currently not supported, so make the effect clear
  // with a boost
  iridescenceMaterial.boost = 20.0;
  torus = new THREE.Mesh(torusGeom, iridescenceMaterial);
  scene.add(torus);

}

function loadCubeMap(path) {
  var files = [
    path + "/posX.jpg",
    path + "/negX.jpg",
    path + "/posY.jpg",
    path + "/negY.jpg",
    path + "/posZ.jpg",
    path + "/negZ.jpg"
  ];

  var loader = new THREE.CubeTextureLoader();
  return loader.load(files);
}


function initGui() {
  var gui = new dat.GUI();
  gui.remember(iridescenceLookUp);
  gui.add(iridescenceLookUp, "filmThickness").min(100).max(1000);
  gui.add(iridescenceLookUp, "refractiveIndexFilm").min(1).max(5);
  gui.add(iridescenceLookUp, "refractiveIndexBase").min(1).max(5);
}
