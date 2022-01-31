import * as io from 'socket.io-client';
import gsap from 'gsap';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

class Playground {
    constructor(el) {
        this.root = el.target;
        this.initCache();
        this.init();
        this.initEvents();
        this.initWebgl();
    }

    initCache() {
        this.url = window.location.origin;
        this.socket = io.connect(this.url);
        this.userContainer = this.root.querySelector(".users");
        this.descriptionSpans = this.userContainer.querySelectorAll('span')
        this.currentUser = document.querySelectorAll(".user")[0];
        this.currentUserLeeroy = this.currentUser.querySelector('.leeroy');
        this.clients = {};
        this.users = {};
        /* this.currentUser.style.borderRadius = `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% / ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`; */
    }

    initEvents() {

        this.root.addEventListener('mousemove', (e) => {
            this.socket.emit("mousemove", {
                x: e.pageX,
                y: e.pageY,
                windowWidth: window.outerWidth,
                windowHeight: window.outerHeight
            });

            let calcX = e.pageX - 55;
            let calcY = e.pageY - 55;

            gsap.to(this.currentUser, 0.6, {x: e.pageX, y: e.pageY});
            gsap.to(this.currentUserLeeroy, 0.6, {x: -calcX, y: -calcY});
        });
        
        this.socket.on("moving", (data) => {
            if (!this.clients.hasOwnProperty(data.id)) {
                this.addClient(data);
            }
            
            gsap.to(this.users[data.id], 0.6, {x: data.x, y: data.y});
            gsap.to(this.users[data.id].querySelector('.leeroy'), 0.6, {x: -data.calcX, y: -data.calcY});

            this.clients[data.id] = data;
        });

        this.socket.on("clientdisconnect", (id) => {
            delete this.clients[id];
            if (this.users[id]) {
                this.users[id].parentNode.removeChild(this.users[id]);
            }
        });
    }

    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    }
    
    addClient(data) {
        this.users[data.id] = this.userContainer.appendChild(this.currentUser.cloneNode(true));
        /* this.users[data.id].style.borderRadius = `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% / ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`; */
        this.users[data.id].querySelectorAll('path').forEach((user) => {
            user.style.fill = this.getRandomColor();
        })

        this.users[data.id].querySelectorAll('span').forEach((span) => {
            span.style.color = this.getRandomColor();
        })
    }

    init() {
        this.currentUserLeeroy.querySelectorAll('path').forEach((user) => {
            user.style.fill = this.getRandomColor();
        })

        this.descriptionSpans.forEach((span) => {
            span.style.color = this.getRandomColor();
        })
    }

    initWebgl() {
        const loader = new THREE.TextureLoader()
        const height = loader.load('./images/cloud.jpg')
        const texture = loader.load('./images/texture.jpeg')
        const alpha = loader.load('./images/alpha.png')

        const canvas = document.querySelector('canvas.webgl')
        const scene = new THREE.Scene()
        const geometry = new THREE.PlaneBufferGeometry(3, 3, 64, 64)

        const material = new THREE.MeshStandardMaterial({
            color: 'grey',
            map: texture,
            displacementMap: height,
            alphaMap: alpha,
            transparent: true,
            depthTest: false
        })

        const plane = new THREE.Mesh(geometry, material)
        scene.add(plane);

        plane.rotation.x = 181

        const pointLight = new THREE.PointLight("#00b3ff", 2)
        pointLight.position.x = 0.2
        pointLight.position.y = 10
        pointLight.position.z = 4.4

        scene.add(pointLight)

        const spotLight = new THREE.SpotLight( 0xff9000, 9, 1.5, Math.PI * 0.04, 0.25, 0 );
        spotLight.position.set( 0, 1.5, 0 );

        scene.add(spotLight);
        scene.add(spotLight.target);

        const spotLightHelper = new THREE.SpotLightHelper( spotLight );
        /* scene.add( spotLightHelper ); */

        const sizes = {
            width: window.innerWidth/2-50,
            height: window.innerHeight+100
        }

        window.addEventListener('resize', () =>
        {
            sizes.width = window.innerWidth/2-50
            sizes.height = window.innerHeight+100

            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.x = 0
        camera.position.y = 1
        camera.position.z = 3
        scene.add(camera)

        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


        const clock = new THREE.Clock()
        document.addEventListener('mousemove', animateMouse)

        let mouseY = 0;
        let mouseX = 0;
        let percentY = 0;
        let percentX = 0;

        function animateMouse(e) {
            mouseY = e.clientY;
            mouseX = e.clientX;
            
            percentY = (mouseY/sizes.height - 0.5) * 2.5
            percentX = (mouseX/sizes.width - 0.5) * 2.5
        }

        const tick = () =>
        {

            const elapsedTime = clock.getElapsedTime()
            plane.rotation.z = 0.3 * elapsedTime;

            spotLight.target.position.z = percentY;
            spotLight.target.position.x = percentX;

            renderer.render(scene, camera)
            window.requestAnimationFrame(tick)
        }

        tick()
    }
}

export default Playground;