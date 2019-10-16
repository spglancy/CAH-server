const mongoose = require("mongoose")
const Schema = mongoose.Schema

const LobbySchema = new Schema({
  users: [],
  owner: String,
  whiteCards: [],
  blackCards: [],
  currBlack: Object,
  currPlayed: [],
  lobbyId: String,
  sets: [],
  czar: String
})

module.exports = mongoose.model("Lobby", LobbySchema)
