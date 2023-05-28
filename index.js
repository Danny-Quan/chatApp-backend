const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const http = require("http");
const app = express();
dotenv.config({ path: "./config.env" });

const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  })
);

const userRotue = require("./Routes/userRoute");
const messageRoute = require("./Routes/messageRoute");

mongoose
  .connect(process.env.MONGO_URI)
  .then((con) => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("Error connecting to the database!");
    // console.log(err.message)
  });

app.use("/api/users", userRotue);
app.use("/api/messages", messageRoute);

app.get("/", (req, res) => {
  res.send("hello to the backend");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log("user connected  ");

  socket.on("message", (data) => {
    // console.log(data);
    io.emit("messageResponse", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT || 5000, (err, data) => {
  console.log(`app running on port ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("there was an unhandled rejection");
  console.log(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
  console.log("there was an error");
});
process.on("unhaldledException", (err) => {
  console.log("there was an unhandled exception");
  console.log(err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
