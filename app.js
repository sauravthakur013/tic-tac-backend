require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const { FirstSocketConnection } = require("./socketConnection/socketConnection");
const allowedOrigins = ["http://localhost:3000"];

const app = express();
const server = http.createServer(app);

// routes
const {getPlayerData, getPlayerDataById} = require("./controller/getPlayerData");


const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// global middlewares
app.use(cors());
app.use(express.json());

// socket connection
const wss = new WebSocket.Server({ path: "/ws", server });
if(wss){ 
    console.log("wss created");
    FirstSocketConnection(wss);}
else{
  console.log("wss not created");
}

// Routes
app.use("/api/v1", (req, res) => {
  console.log(req.body); 
  res.status(200).json({
    message: "Welcome to Cartoon server",   
  });
});   
app.use("/api/players", getPlayerData);
app.use("/api/gameData", getPlayerDataById);

module.exports = server;
  