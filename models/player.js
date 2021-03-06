const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const PlayerSchema = new Schema({
  email: String,
  password: String,
  name: String,
  hand: Array,
  points: Number
})

// Salt password
PlayerSchema.pre('save', function (next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      user.password = hash
      next()
    })
  })
})

PlayerSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    done(err, isMatch)
  })
}

module.exports = mongoose.model("Player", PlayerSchema)