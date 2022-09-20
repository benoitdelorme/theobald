import './style.css'
import * as THREE from 'three'
import { getDistance, getRhumbLineBearing } from 'geolib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import data from './data/center_with_highway_low.json'
import waterData from './data/water.json'
import { Water } from 'three/examples/jsm/objects/Water'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

let scene, renderer, camera, controls
let MAT_BUILDING
let MAT_ROAD
let MAT_WATER
let MAT_WATER_NORMAL

/* 
var dataAPI = null;
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
    console.log(this.responseText);
    }
});
xhr.open("GET", "https://api.stm.info/pub/od/i3/v1/messages/etatservice/");
xhr.setRequestHeader("origin", "http://localhost");
xhr.setRequestHeader("apikey", "l7xx968fd2a1e2ad494da06256bd43e16d27");
xhr.send(dataAPI); */
/* 
var dataAPI = null;
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
    console.log(this.responseText);
    }
});

xhr.open("POST", "https://api.stm.info/pub/od/gtfs-rt/ic/v2/tripUpdates/");
xhr.setRequestHeader("apikey", "l7xx968fd2a1e2ad494da06256bd43e16d27");
xhr.send(dataAPI); */


const FLAG_ROAD_ANI = true
/* const center = [-73.561574, 45.502797] // highway */
const center = [-73.562632, 45.501203]

let iR
let iRRoad
let iRLine
let iRWater
let stats = null

let geosBuilding = []
let colliderBuilding = []
let AnimatedLineDistances = []

/* const raycaster = new THREE.Raycaster(); */
const mouse = {
  x: 0,
  y: 0
}

let currentHelp

Awake()

// When user resize window
window.addEventListener('resize', onWindowResize, false)

document.querySelector('.container').addEventListener('mousemove', (e) => {
  
  /* mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  

  if(currentHelp) {
    scene.remove(currentHelp)
  }

  currentHelp = Raycast(mouse)

  scene.add(currentHelp) */
})

function Raycast() {
  
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  /* raycaster.setFromCamera(mouse, camera) */

  let intersects = raycaster.intersectObjects(colliderBuilding)

  console.log(intersects)

  if(intersects.length > 0) {
    return intersects[0].object
  }else {
    return false
  }
}


function onWindowResize() {
  if (scene) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

onWindowResize()

function Awake() {
  
  let cont = document.querySelector(".container")

  
  stats = new Stats()
  cont.appendChild(stats.dom)

  // Init scene
  scene = new THREE.Scene()

  scene.background = new THREE.Color(0x222222)

  // Init Camera
  camera = new THREE.PerspectiveCamera(25, window.clientWidth / window.clientHeight, 1, 100)
  camera.position.set(8, 4, 0)

  // Init group
  iR = new THREE.Group()
  iR.name = "Interactive Root"

  iRRoad = new THREE.Group()
  iRRoad.name = "Interactive Root Road"

  iRLine = new THREE.Group()
  iRWater = new THREE.Group()

  scene.add(iR, iRRoad, iRLine, iRWater)


  // Init Light
  let light0 = new THREE.AmbientLight(0xfafafa, 0.25)

  let light1 = new THREE.PointLight(0xfafafa, 0.4)
  light1.position.set(200, 90, 40)

  let light2 = new THREE.PointLight(0xfafafa, 0.4)
  light2.position.set(200, 90, -40)

  scene.add(light0)
  scene.add(light1)
  scene.add(light2)

  let gridHelper = new THREE.GridHelper(60, 160, new THREE.Color(0x555555), new THREE.Color(0x333333))
  scene.add(gridHelper)

  /* const geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(geo, mat);
  plane.rotateX( - Math.PI / 2); */
  /* scene.add(plane); */

  // Init renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  cont.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25
  controls.screenSpacePanning = false
  controls.maxDistance = 800

  controls.update()

  MAT_BUILDING = new THREE.MeshPhongMaterial()

  Update()

  GetGeoJson()
}

function Update() {
  
  /* raycaster.setFromCamera( mouse, camera ); */

  stats.update()
  renderer.render(scene, camera)
  controls.update()
  UpdateAniLine()
  UpdateWater()

  requestAnimationFrame(Update)
}

function UpdateWater() {
  for(let i = 0; i < iRWater.children.length; i++) {
    iRWater.children[i].material.uniforms['time'].value += 1.0 / 700
  }
}

function GetGeoJson() {

    LoadBuildings(data)
    /* LoadWater(waterData) */

    let mergeGeometry = mergeBufferGeometries(geosBuilding)
    let mesh = new THREE.Mesh(mergeGeometry, MAT_BUILDING)
    iR.add(mesh)
}

function LoadWater(data) {
  MAT_WATER_NORMAL = new THREE.TextureLoader().load('textures/waternormals.jpeg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  })

  MAT_WATER = {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: MAT_WATER_NORMAL,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0xA6C8FA,
    distortionScale: 3.7,
    size: 3.3,
    fog: false
  }

  let feature = data.features

  for(let i = 0; i < feature.length; i++) {
    let fel = feature[i]

    if(!fel['properties']) return

    if(fel.properties['natural'] == 'water' && fel.geometry.type == 'Polygon') {
      addWater(fel.geometry.coordinates, fel.properties)
    }

  }
}

function addWater(d, info) {
  let holes = []
  let shape, geometry

  for(let i = 0; i < d.length; i++) {
    let el = d[i]

    if(i == 0) {
      shape = genShape(el, center)
    }else {
      holes.push(genShape(el, center))
    }
  }

  for(let h = 0; h < holes.length; h++) {
    shape.holes.push(holes[h])
  }

  geometry = genGeometry(shape, {
    curveSegments: 2,
    steps: 1,
    depth: -0.1,
    bevelEnabled: false
  })

  geometry.rotateX(Math.PI/2)
  geometry.rotateZ(Math.PI)

  let water = new Water(geometry, MAT_WATER)

  /* water.material.uniforms.distortionScale.value = 3.0
  water.material.uniforms.size.value = 3.0 */

  iRWater.add(water)
}

function LoadBuildings(data) {

  let features = data.features
  MAT_ROAD = new THREE.LineBasicMaterial(
    {
      color: 'white',
      linewidth: 1,
    }
  )

  for (let i = 0; i < features.length; i++) {
    let fel = features[i]

    if (!fel['properties']) return

    let info = fel.properties

    if (info['building']) {
      addBuilding(fel.geometry.coordinates, fel.properties, fel.properties["building:levels"])
    } else if (info['highway']) {

      if(fel.geometry.type == 'LineString' && fel.properties['highway'] != 'pedestrian' && fel.properties['highway'] != 'footway' && fel.properties['highway'] != 'path' && fel.properties['highway'] != 'elevator' && fel.properties['highway'] != 'cycleway' ) {
        addRoad(fel.geometry.coordinates, info)  
      }

    }
  }
}

function addRoad(data, info) {
  let points = []

  for(let i = 0; i < data.length; i++) {
    if(!data[0][1]) return
    
    let el = data[i]

    if(!el[0] || !el[1] || isNaN(el[1]) || isNaN(el[0])) return

    let elp = [el[0], el[1]]

    elp = GPSRelativePosition(elp, center)

    points.push(new THREE.Vector3(elp[0], 0, elp[1]))
  }

  let geometry = new THREE.BufferGeometry().setFromPoints( points )
  geometry.rotateZ(Math.PI)

  let line = new THREE.Line( geometry, MAT_ROAD )
  line.info = info
  line.computeLineDistances()

  iRRoad.add(line)

  if(FLAG_ROAD_ANI) {
    let lineLength = geometry.attributes.lineDistance.array[geometry.attributes.lineDistance.count - 1]

    if(lineLength > 0.8) {
      let aniLine = addAniLine(geometry, lineLength)
      iRLine.add(aniLine)
    }
  }

}

function addAniLine(geometry, linelength) {
  let aniLine = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 'red' }))

  aniLine.material.transparent = true
  aniLine.material.dashSize = 0.1
  aniLine.material.gapSize = 10000
  aniLine.position.y = 0

  AnimatedLineDistances.push(linelength)

  return aniLine
}

function UpdateAniLine() {
  if(iRLine.children.length <= 0 ) return
  
  iRLine.children.forEach((line, index) => {
    let dash = parseInt(line.material.dashSize)
    let length = parseInt(AnimatedLineDistances[index])

    if(dash > length) {
      line.material.dashSize = 0
      line.material.opacity = 1
    } else {
      line.material.dashSize += 0.004
      line.material.opacity = line.material.opacity > 0 ? line.material.opacity - 0.002 : 0
    }

  });
}

function addBuilding(data, info, height = 1) {
  height = (!height || isNaN(height)) ? 1 : height

  let shape, geometry, mesh;
  let holes = []

  for (let i = 0; i < data.length; i++) {
    let el = data[i]

    
    if(i == 0) {
      shape = genShape(el, center)
    }else {
      holes.push(
        genShape(el, center)
      )
    }

    for(let h = 0; h < holes.length; h++) {
      shape.holes.push(holes[h])
    }

    geometry = genGeometry(shape, {
      curveSegments: 1,
      depth: 0.1 * height,
      bevelEnabled: false
    })

    geometry.rotateX(Math.PI / 2)
    geometry.rotateZ(Math.PI)
    geosBuilding.push(geometry)

    let helper = genHelper(geometry)
    
    if(helper) {
      helper.name = info['name'] ? info['name'] : 'Building'
      helper.info = info
      
      /* scene.add(helper) */
      colliderBuilding.push(helper)
    }

    /* mesh = new THREE.Mesh(geometry, MAT_BUILDING) */
    /* scene.add(mesh) */
  }
}

function genHelper(geometry) {
  if(geometry.boundingBox) {
    geometry.computeBoundingBox()
  }

  let box3 = geometry.boundingBox

  if(!isFinite(box3.max.x)) {
    return false
  }

  let helper = new THREE.Box3Helper(box3, 0xffff00)
  helper.updateMatrixWorld(true)

  return helper 
}

function genShape(points, center) {
  let shape = new THREE.Shape()

  for (let i = 0; i < points.length; i++) {
    let elp = points[i]
    elp = GPSRelativePosition(elp, center)

    if (i == 0) {
      shape.moveTo(elp[0], elp[1])
    } else {
      shape.lineTo(elp[0], elp[1])
    }
  }

  return shape
}

function genGeometry(shape, settings) {
  let geometry = new THREE.ExtrudeBufferGeometry(shape, settings)
  geometry.computeBoundingBox()

  return geometry
}

function GPSRelativePosition(objPosi, centerPosi) {

  // Get GPS distance
  let dis = getDistance(objPosi, centerPosi)

  // Get bearing angle
  let bearing = getRhumbLineBearing(objPosi, centerPosi)

  // Calculate X by centerPosi.x + distance * cos(rad)
  let x = centerPosi[0] + (dis * Math.cos(bearing * Math.PI / 180))

  // Calculate Y by centerPosi.y + distance * sin(rad)
  let y = centerPosi[1] + (dis * Math.sin(bearing * Math.PI / 180))
  
  // Reverse X (it work) 
  return [-x / 100, y / 100]
}