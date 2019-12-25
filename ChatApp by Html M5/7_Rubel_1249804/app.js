const fs = require('fs');
const path = require('path');
var express = require("express");

var app = express();

var http = require("http");

var server = http.createServer(app);

var io = require("socket.io").listen(server);

app.use(express.static(__dirname + '/www'));
var usernames = {};
var files = [];
const directoryPath = path.join(__dirname, 'www/uploads');
//passsing directoryPath and callback function
fs.readdirSync(directoryPath).forEach(file => {
    
    files.push({name: file , path:'/uploads/'+file});
});
io.sockets.on("connect", (socket) => {
   
    io.sockets.emit("message", { "from": "SERVER", "msg": "New User connected" });
    socket.on("adduser", (name) => {

        usernames[name] = name;
        socket.username = name;
        io.sockets.emit("updateusers", usernames);
    });
    socket.on("send", (msg) => {
        console.log(msg);
        io.sockets.emit("message", { "from": socket.username, "msg": msg });
    });
    socket.on("list", () => {
        socket.emit("list", files);
    });
    socket.on("uploadfile", (data) => {
        //console.log(data);
        fs.appendFileSync('www/uploads/' + data.name, new Buffer(data.fileData));
        io.sockets.emit("fileuploaded", { "from": socket.username,name: data.name, "path": '/uploads/' + data.name })
    });
    socket.on("disconnect", (socket) => {
        delete usernames[socket.name];
        io.sockets.emit("updateusers", usernames);
    });
});

server.listen(5555);
console.log("Server runningf at port 5555...");
