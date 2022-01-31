import * as io from 'socket.io-client';
import gsap from 'gsap';
import * as THREE from 'three'

class Playground {
    constructor(el) {
        this.root = el.target;
        this.initCache();
        this.init();
        this.initEvents();

        this.render();
    }

    initCache() {
        //Client Server
        this.url = window.location.origin
        this.socket = io.connect(this.url)
        this.clients = {}
        this.users = {}
        this.spotLightUsers = {}
        this.spotLightMouseCoordinate = []

        //2D Scene
        this.userContainer = this.root.querySelector(".users")
        this.descriptionSpans = this.userContainer.querySelectorAll('span')
        this.currentUser = document.querySelectorAll(".user")[0]
        this.currentUserLeeroy = this.currentUser.querySelector('.leeroy')
        
        //3D Scene
        this.loader = new THREE.TextureLoader()
        this.height = this.loader.load('./images/cloud.jpg')
        this.texture = this.loader.load('./images/texture.jpeg')
        this.alpha = this.loader.load('./images/alpha.png')
        this.canvas = this.root.querySelector('canvas.webgl')

        this.scene = new THREE.Scene()
        this.geometry = new THREE.PlaneBufferGeometry(3, 3, 64, 64)
        this.material = new THREE.MeshStandardMaterial({
            color: 'grey',
            map: this.texture,
            displacementMap: this.height,
            alphaMap: this.alpha,
            transparent: true,
            depthTest: false
        })

        this.plane = new THREE.Mesh(this.geometry, this.material)
        this.pointLight = new THREE.PointLight("#00b3ff", 2)
        this.spotLight = new THREE.SpotLight( 0xff9000, 9, 1.5, Math.PI * 0.04, 0.25, 0 );

        this.sizes = {
            width: window.innerWidth/2,
            height: window.innerHeight-100
        }

        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        })
        
        this.clock = new THREE.Clock()

        this.mouseY = 0;
        this.mouseX = 0;
        this.percentY = 0;
        this.percentX = 0;
    }

    initEvents() {
        window.addEventListener('resize', () => {
            this.sizes.width = window.innerWidth/2
            this.sizes.height = window.innerHeight-100

            this.camera.aspect = this.sizes.width / this.sizes.height
            this.camera.updateProjectionMatrix()

            this.renderer.setSize(this.sizes.width, this.sizes.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

        this.root.addEventListener('mousemove', (e) => {
            this.socket.emit("mousemove", {
                x: e.pageX,
                y: e.pageY,
                windowWidth: window.outerWidth,
                windowHeight: window.outerHeight
            });

            let calcX = e.pageX - 55;
            let calcY = e.pageY - 55;

            this.percentX = (e.pageX/this.sizes.width - 0.5) * 2.5
            this.percentY = (e.pageY/this.sizes.height - 0.5) * 2.5

            gsap.to(this.currentUser, 0.6, {x: e.pageX, y: e.pageY});
            gsap.to(this.currentUserLeeroy, 0.6, {x: -calcX, y: -calcY});
        });
        
        //Client Server
        this.socket.on("moving", (data) => {
            if (!this.clients.hasOwnProperty(data.id)) {
                this.addClient(data);
            }
            
            this.spotLightMouseCoordinate.push({
                id: data.id,
                x: (data.x/this.sizes.width - 0.5) * 2.5, 
                y: (data.y/this.sizes.height - 0.5) * 2.5
            })
            
            gsap.to(this.users[data.id], 0.6, {x: data.x, y: data.y});
            gsap.to(this.users[data.id].querySelector('.leeroy'), 0.6, {x: -data.calcX, y: -data.calcY});

            this.clients[data.id] = data;
        });

        this.socket.on("clientdisconnect", (id) => {
            delete this.clients[id];
            if (this.users[id]) {
                this.users[id].parentNode.removeChild(this.users[id]);
            }

            if (this.spotLightUsers[id]) {
                this.scene.remove(this.spotLightUsers[id])

                for(let o = 0; o < this.spotLightMouseCoordinate.length; o++) {
                    if(this.spotLightMouseCoordinate[o].id == id) {
                        
                    }
                }
            }

        });

    }
    
    addClient(data) {
        //2D Scene
        this.users[data.id] = this.userContainer.appendChild(this.currentUser.cloneNode(true));
        this.users[data.id].querySelectorAll('path').forEach((user) => {
            user.style.fill = this.getRandomColor();
        })

        this.users[data.id].querySelectorAll('span').forEach((span) => {
            span.style.color = this.getRandomColor();
        })

        //3D Scene
        this.spotLightUsers[data.id] = new THREE.SpotLight(this.getRandomColor(), 9, 1.5, Math.PI * 0.04, 0.25, 0 );
        this.scene.add(this.spotLightUsers[data.id])
        this.scene.add(this.spotLightUsers[data.id].target)
    }

    init() {
        //2D Scene
        this.currentUserLeeroy.querySelectorAll('path').forEach((user) => {
            user.style.fill = this.getRandomColor();
        })

        this.descriptionSpans.forEach((span) => {
            span.style.color = this.getRandomColor();
        })

        //3D Scene
        this.plane.rotation.x = 181
        this.pointLight.position.x = 0.2
        this.pointLight.position.y = 10
        this.pointLight.position.z = 4.4
        this.spotLight.position.set( 0, 1.5, 0 );
        this.camera.position.x = 0
        this.camera.position.y = 1
        this.camera.position.z = 3
        
        this.scene.add(this.plane);
        this.scene.add(this.pointLight)
        this.scene.add(this.spotLight);
        this.scene.add(this.spotLight.target);
        this.scene.add(this.camera)
        
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    }

    render() {
        const tick = () => {
            const elapsedTime = this.clock.getElapsedTime()
            this.plane.rotation.z = 0.3 * elapsedTime;
            this.spotLight.target.position.z = this.percentY;
            this.spotLight.target.position.x = this.percentX;

            this.spotLightMouseCoordinate.forEach((spot) => {
                this.spotLightUsers[spot.id].target.position.z = spot.y
                this.spotLightUsers[spot.id].target.position.x = spot.x
            })

            this.renderer.render(this.scene, this.camera)
            window.requestAnimationFrame(tick)
        }

        tick()
    }
}

export default Playground;