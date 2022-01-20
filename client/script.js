window.onload = function () {
    const url = window.location.origin;
    let socket = io.connect(url);
    let userContainer = document.querySelector(".users");
    let user = document.createElement("div");
    let currentUser = document.querySelector(".user");
    currentUser.style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;

    user.setAttribute("class", "user");
    
    let clients = {};
    let users = {};

    document.onmousemove = function (e) {
        socket.emit("mousemove", {
            x: e.pageX,
            y: e.pageY
        });
        
        currentUser.style.left = e.pageX + "px";
        currentUser.style.top = e.pageY + "px";
    };

    socket.on("moving", function (data) {
        if (!clients.hasOwnProperty(data.id)) {
            users[data.id] = userContainer.appendChild(user.cloneNode());
            users[data.id].style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        }

        users[data.id].style.left = data.x + "px";
        users[data.id].style.top = data.y + "px";

        clients[data.id] = data;
    });

    socket.on("clientdisconnect", function (id) {
        delete clients[id];
        if (users[id]) {
            users[id].parentNode.removeChild(users[id]);
        }
    });

};
