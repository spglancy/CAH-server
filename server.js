const dotenv = require("dotenv").config()
const express = require("express")
const app = express()
const mongoose = require("mongoose")
mongoose.connect(
  "mongodb://admin:qwaszx51@ds117846.mlab.com:17846/cah-private-server" ||
  "mongodb://localhost/cah-backend",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
const io = require("socket.io")()

const gameSocket = require("./controllers/game")(io)
// chat will be implemented soon
// const chatSocket = require("./controllers/chat")(io)
// const userSocket = require("./controllers/users")(io)
const authController = require("./controllers/auth")(io)

io.listen(process.env.PORT)
