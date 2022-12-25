var express = require("express");
var app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const PORT = process.env.PORT || 3002;
app.use(cors());
app.options('*', cors());

app.get('/', (req, resp) => {
  resp.write(`<h2>Socket start on port: ${PORT}</h2>`);
  resp.end();
})
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});
server.listen(PORT, () => {
  console.log("Server is running");
});

var listObject = {};
var listSocket = [];

io.on("connection", async function (socket) {
  socket.on("connectUser", (account, arr) => {
    for (let index = 0; index < arr.length; index++) {
      const roomId = arr[index];
      socket.join(roomId);
      console.log("User joined room group---------> " + roomId);
    }

    socket.join(account.userId);
    console.log("User joined room one-----------> " + account.userId);

    listObject = {};
    listObject.socketId = socket.id;
    listObject.email = account.email;
    listSocket.push(listObject);
    console.log("listSocket connectUser----->>", listSocket);
    io.sockets.emit("server_send_listSocket", listSocket);
  });

  socket.on("add_friend", function (userId) {
    socket.to(userId).emit("request_accept");
  });

   socket.on("delete_friend", function (userId) {
    socket.to(userId).emit("request_delete_friend",listSocket);
    socket.to(userId).emit("request_delete_friend_profile");
    socket.emit("request_delete_friend",listSocket);
  });

  socket.on("accept_friend", function (userId) {  
    socket.to(userId).emit("successful_accept",listSocket);
    socket.emit("successful_accept", listSocket);
  });

  socket.on("reset_one_user_getAllNotification", function () {
    socket.emit("reset_one_account_getAllNotification");
  });

  socket.on("reset_one_user_get_One_Notification", function () {
    socket.emit("reset_one_account_get_One_All_Notification");
  });

    socket.on("join_room", (data) => {
      socket.join(data);
      console.log("User joined room: " + data);
    });

    socket.on("send_message", (data) => {
      socket.to(data.room).emit("recevie_message", data.content);
      socket.to(data.room).emit("recevie_message_name", listSocket);
      socket.emit("recevie_message_name", listSocket);

    });

    socket.on("isSeen", () => {
      socket.emit("recevie_message_name", listSocket);
    });

    socket.on("add_member_group", function () {
      io.sockets.emit("reset_member_group_successful",listSocket);
    });

    socket.on("create_group", function (userId) {
      socket.to(userId).emit("reset_create_group_successful",listSocket);
      // socket.emit("reset_create_group_successful",listSocket);
    });
    socket.on("delete_member_group", function (userId) {
      io.sockets.emit("reset_delete_member",listSocket);
      socket.to(userId).emit("reset_delete_member_notification",listSocket);

      // socket.to(userId).emit("reset_create_group_successful",listSocket);
      // socket.emit("reset_create_group_successful",listSocket);
    });
    
    socket.on("Client_request_create_like_comment", function () {
      socket.broadcast.emit("Server_response_like_comment");
    });

    socket.on("I'm typing", (room, data) => {
      socket.broadcast.emit(
        room + "user-typing",
        data,
        data.fullName + " đang soạn tin nhắn..."
      );
    });

    socket.on("I stopped typing", (room) => {
      socket.broadcast.emit(room + "stop-user-typing", "");
    });

  

  socket.on("disconnect", function () {
    console.log(socket.id + " ngat ket noi!!!!!!");

    for (let index = 0; index < listSocket.length; index++) {
      if (listSocket[index].socketId == socket.id) {
        listSocket.splice(index, 1);
      }
    }
    console.log("disconnect----->>", listSocket);

    io.sockets.emit("server_disconnect_listSocket", listSocket);
  });
  //--------------------------------------------------------------------------
  // socket.on("logout", function (account) {
  //   listSocket.splice(listSocket.indexOf(socket.id), 1);
  //   io.sockets.emit("server-send-listSocket-room", listSocket);
  //   console.log("listSocket----->>", listSocket);
  // });
});
