import * as io from 'socket.io-client';

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

        this.user = document.createElement("div");
        this.currentUser = document.querySelectorAll(".user")[0];
        this.currentUserLeeroy = this.currentUser.querySelector('.leeroy');
        /* this.currentUser.style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`; */
        this.user.setAttribute("class", "user");
    }

    initEvents() {

        this.root.addEventListener('mousemove', (e) => {
            this.socket.emit("mousemove", {
                x: e.pageX,
                y: e.pageY
            });

            this.currentUser.style.transform = `translate3d(${e.pageX}px, ${e.pageY}px, 0)`;
            this.currentUserLeeroy.style.transform = `translate3d(-${e.pageX}px, -${e.pageY}px, 0)`;

            /* this.currentUser.style.top = e.pageY + "px"; */

            /* this.currentUser.style.left = e.pageX + "px";
            this.currentUser.style.top = e.pageY + "px"; */
        });
        
        this.socket.on("moving", (data) => {
            console.log(this.clients)
            if (!this.clients.hasOwnProperty(data.id)) {
                console.log(data.id)
                this.addClient(data);
            }

            /* this.users[data.id].style.left = data.x + "px";
            this.users[data.id].style.top = data.y + "px";
 */
            this.users[data.id].style.transform = `translate3d(${data.x}px, ${data.y}px, 0)`;
            console.log(this.users[data.id])
            this.users[data.id].querySelector('.leeroy').style.transform = `translate3d(-${data.x}px, -${data.y}px, 0)`;

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
        
    }
}

export default Playground;