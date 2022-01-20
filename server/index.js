const http = require("http"),
    express = require("express"),
    app = express(),
    socketIo = require("socket.io");
const PORT = process.env.PORT || 5000

const server = http.Server(app).listen(PORT);
const io = socketIo(server);
const clients = {};

app.use(express.static(__dirname + "/../client/"));
app.use(express.static(__dirname + "/../node_modules/"));

app.get("/", (req, res) => {
    console.log(res);
    res.sendFile("index.html", { root: __dirname + "/../client" });
});

const addClient = socket => {
    console.log("New client connected", socket.id);
    clients[socket.id] = socket;
};

const removeClient = socket => {
    console.log("Client disconnected", socket.id);
    delete clients[socket.id];
};

io.sockets.on("connection", socket => {
    let id = socket.id;

    addClient(socket);
    
    socket.on("mousemove", data => {
        data.id = id;
        socket.broadcast.emit("moving", data);
    });

    socket.on("disconnect", () => {
        removeClient(socket);
        socket.broadcast.emit("clientdisconnect", id);
    });
});
