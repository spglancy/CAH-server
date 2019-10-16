const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PlayerSchema = new Schema({
  name: String,
  hand: []
})

module.exports = mongoose.model("Player", PlayerSchema)
