import * as io from 'socket.io-client';
import gsap from 'gsap';

class Playground {
    constructor(el) {
        this.root = el.target;
        this.initCache();
        this.init();
        this.initEvents();
    }

    initCache() {
        this.url = window.location.origin;
        this.socket = io.connect(this.url);
        this.userContainer = this.root.querySelector(".users");
        this.clients = {};
        this.users = {};

        this.currentUser = document.querySelectorAll(".user")[0];
        this.currentUserLeeroy = this.currentUser.querySelector('.leeroy');
        this.currentUser.style.borderRadius = `${Math.floor(Math.random() * 100)}% 60% 70% 30% / ${Math.floor(Math.random() * 100)}% 50% 60% 50%`;
        console.log(`${Math.floor(Math.random() * 100)}% 60% 70% 30% / 40% 50% 60% 50%;`);
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

        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    }
      

    addClient(data) {
        this.users[data.id] = this.userContainer.appendChild(this.currentUser.cloneNode(true));
        this.users[data.id].style.borderRadius = `${Math.floor(Math.random() * 100)}% 60% 70% 30% / 40% 50% 60% 50%`;
        this.users[data.id].querySelectorAll('path').forEach((user) => {
            user.style.fill = this.getRandomColor();
        })
    }

    init() {
        this.currentUserLeeroy.querySelectorAll('path').forEach((user) => {
            user.style.fill = this.getRandomColor();
        })
    }
}

export default Playground;