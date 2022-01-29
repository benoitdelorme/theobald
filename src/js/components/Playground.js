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
        /* this.currentUser.style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`; */
    }

    initEvents() {

        this.root.addEventListener('mousemove', (e) => {
            this.socket.emit("mousemove", {
                x: e.pageX,
                y: e.pageY
            });

/*             this.currentUser.style.transform = `translate3d(${e.pageX}px, ${e.pageY}px, 0)`;
            this.currentUserLeeroy.style.transform = `translate3d(-${e.pageX}px, -${e.pageY}px, 0)`;
 */
            gsap.to(this.currentUser, 0.6, {x: e.pageX, y: e.pageY})
            gsap.to(this.currentUserLeeroy, 0.6, {x: -e.pageX, y: -e.pageY})
        });
        
        this.socket.on("moving", (data) => {
            if (!this.clients.hasOwnProperty(data.id)) {
                this.addClient(data);
            }

            gsap.to(this.users[data.id], 0.6, {x: data.x, y: data.y})
            gsap.to(this.users[data.id].querySelector('.leeroy'), 0.6, {x: -data.x, y: -data.y})

            /* this.users[data.id].style.transform = `translate3d(${data.x}px, ${data.y}px, 0)`;
            this.users[data.id].querySelector('.leeroy').style.transform = `translate3d(-${data.x}px, -${data.y}px, 0)`; */

            this.clients[data.id] = data;
        });

        this.socket.on("clientdisconnect", (id) => {
            delete this.clients[id];
            if (this.users[id]) {
                this.users[id].parentNode.removeChild(this.users[id]);
            }
        });
    }

    addClient(data) {
        this.users[data.id] = this.userContainer.appendChild(this.currentUser.cloneNode(true));
        this.users[data.id].querySelectorAll('path').forEach((user) => {
            user.style.fill = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        })
    }

    init() {
        this.currentUserLeeroy.querySelectorAll('path').forEach((user) => {
            user.style.fill = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        })
    }
}

export default Playground;