import http from 'http'
import express  from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { Server } from "socket.io";
import message from './build/utils/message.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = new express();
const httpServer = http.createServer(app).listen(8008);
const io = new Server(httpServer)

message(``, 'welcome')

app.use(express.static(__dirname + "/www/"));
app.use(express.static(__dirname + "/node_modules/"));

app.get('/', (req, res) => {
    res.render('index', { title: 'Hey', message: 'Hello there!' })
  })


app.get("/", (req, res) => {
    res.sendFile("index.html", { root: __dirname + "/www" });
});

io.sockets.on("connection", socket => {
    let id = socket.id;
});