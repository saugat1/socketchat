const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000;
const { Server } = require("socket.io");
const io = new Server(server);
let actives = {};
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/messages", (req, res) => {
  res.sendFile(__dirname + "/receiver.html");
});

io.on("connection", (socket) => {
  socket.emit("signin", socket.id);

  //after connected do something and evetns under this function

  socket.on("addnewUser", (socketid, name) => {
    actives[socketid] = {
      name: name,
      socket: socket,
    };
    //emit a new user added to chat
    socket.broadcast.emit("userjoined", name);
    showActiveUsers();
  });

  socket.on("sendmessage", (message, n, i) => {
    io.emit("aayo", n, message, i);
  });

  socket.on("typing", (data) => {
    io.emit("typed", "somebody is typing...");
  });
  socket.on("disconnect", () => {
    //remove active user from that
    removeCurrentUser(socket.id);
  });

  function removeCurrentUser(id) {
    var newActives = {};
    let naam;
    for (const key in actives) {
      if (Object.hasOwnProperty.call(actives, key)) {
        const element = actives[key];
        if (key != id) {
          newActives[key] = element;
        } else {
          naam = actives[key].name;
        }
      }
    }
    actives = newActives;
    socket.broadcast.emit("userleft", naam);
    showActiveUsers();
  }
  function showActiveUsers() {
    var names = [];

    for (const key in actives) {
      if (Object.hasOwnProperty.call(actives, key)) {
        const element = actives[key].name;
        names.push(element);
      }
    }
    socket.emit("actives", names);
    socket.broadcast.emit("actives", names);
  }
});

server.listen(port, () => {
  console.log("hello server is running on port " + port);
});
