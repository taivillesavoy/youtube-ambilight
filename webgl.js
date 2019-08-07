const width = 300;
const height = 300;

const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.loop = true;
video.src = 'webgl.mp4';
video.play();

var videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

var movieMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });

var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
var mesh = new THREE.Mesh(geometry, movieMaterial);

var scene = new THREE.Scene();
scene.add(mesh);

var camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
camera.position.z = 1;

var canvas = document.querySelector('canvas')
var context = canvas.getContext('webgl')
var renderer = new THREE.WebGLRenderer({ context: context }); //canvas: document.querySelector('canvas')
renderer.setSize(width, height);

var draw = function () {
    requestAnimationFrame(draw);
    renderer.render(scene, camera);
};

draw();