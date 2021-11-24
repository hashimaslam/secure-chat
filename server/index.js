// const server = require("http").createServer();
const express = require("express");
var http = require("http");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const crypto = require("crypto");
const PORT = 4000;
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

var server = http.createServer(app);

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(express.json());

io.listen(server);

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected`);

  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} diconnected`);
    socket.leave(roomId);
  });
});

app.get("/public", (req, res) => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    primeLength: 60,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  res.json({
    privateKey,
    publicKey,
  });
});

app.post("/createKey", (req, res) => {
  const { key, secret } = req.body;
  console.log(key, secret);
  // console.log(req.query.key);
  console.log(key, "from key");

  const encryptedData = crypto.publicEncrypt(
    {
      key: key,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(secret)
  );

  console.log("encypted data: ", encryptedData.toString("base64"));
  res.json({
    symKey: encryptedData.toString("base64"),
  });
});

app.post("/decrypt", (req, res) => {
  const { key, secret } = req.body;

  console.log(key, secret, "from key");

  const decryptedData = crypto.privateDecrypt(
    {
      key: key,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    secret
  );

  console.log("decrypted data: ", decryptedData.toString());
  res.json({
    secret: decryptedData.toString(),
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
