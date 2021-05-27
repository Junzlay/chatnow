const { profile } = require('console');
var express = require('express');
var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const port = process.env.PORT || 3000;
const {
  joinUser,
  removeUser,
  findUser,
  getAllUsers
} = require('./users');
// app.use(express.static('public/'));
app.use(express.static(__dirname + '/public'));
// app.use('/resources', express.static('resources'));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
let thisRoom = "";
// io.set('resource', '/node_modules/socket.io');
io.on("connection", function (socket) {
  var total = io.engine.clientsCount;
  socket.emit('getCount', total)
  // console.log("connected");
  socket.on("join room", (data) => {
    let Newuser = joinUser(socket.id, data.username, data.roomName,data.profile)
    socket.emit('send data', {
      id: socket.id,
      username: Newuser.username,
      roomname: Newuser.roomname,
      profile:Newuser.profile
    });

    thisRoom = Newuser.roomname;
    console.log(Newuser);
    socket.join(Newuser.roomname);
    io.emit('allUsers all', getAllUsers());
    // socket.emit('rooms', io.sockets.adapter.rooms)[1];
  });

  socket.on("profile", (data) => {
    io.emit("profile", data);
  })
  socket.on("image", (data) => {
    io.emit("image", data);
  })
  socket.on("private", function (data) {
    io.sockets.sockets[data.to].emit("private", {
      id: socket.id,
      to: data.to,
      data: data
    });

    socket.emit("private", {
      id: socket.id,
      to: data.to,
      data: data
    });
  });

//   socket.on('getRooms', function() {
//     socket.emit('rooms', io.sockets.adapter.rooms);
// });


  socket.on("new joined", (data) => {
    io.emit("new joined", data);
  });

  socket.on("typing", function (data) {
    io.to(thisRoom).emit("typing", data);
  });


  socket.on("chat message", (data) => {
    io.to(thisRoom).emit("chat message", {
      data: data,
      id: socket.id
    });
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);
    if (user) {
      io.emit("disconnect user", user.username);
      console.log(user.username + ' has left');
      io.emit('allUsers all', getAllUsers());
    }

  });
});

http.listen(port, function () {
  console.log("Listening at port:" + port);
});
