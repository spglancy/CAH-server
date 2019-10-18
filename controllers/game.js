module.exports = (io) => {
  const Lobby = require("../models/lobby")
  const Player = require("../models/player")
  io.on("connection", client => {
    //handle lobby creation
    client.on("New Game", (owner, lobbyId, whiteCards, blackCards) => {
      Player.findById(owner)
        .then(user => {
          user.points = 0
          Lobby.create({
            users: [user],
            owner: user._id,
            whiteCards,
            blackCards,
            currBlack: null,
            currPlayed: [],
            lobbyId,
            sets: [],
            czar: null
          })
            .then(lobby => {
              lobby.save()
                .then(() => {
                  client.emit("Lobby Created", lobby._id)
                })
                .catch(err => console.log(err))
            })
        })
    })

    client.on("Update Players", id => {
      client.join(id)
      Lobby.findById(id).then(lobby => {
        io.to(id).emit("Players Updated", lobby)
      })
    })

    //starts the game
    client.on("Start Hand", (id, start) => {
      Lobby.findById(id).then(lobby => {
        if (start) {
          lobby.czar = lobby.users[Math.floor(Math.random() * lobby.users.length)]._id
          lobby.users.forEach(user => {
            user.hand = []
            for (let i = 0; i < 8; i++) {
              user.hand.push(lobby.whiteCards.splice(Math.floor(Math.random() * lobby.whiteCards.length), 1)[0])
            }
          })
        } else {
          if (lobby.currPlayed.length > 1) {
            let czarIndex = null
            lobby.users.forEach((user, index) => {
              if (user._id == lobby.czar) {
                czarIndex = index
              }
            })
            lobby.czar = lobby.users[(czarIndex + 1) % lobby.users.length]._id
          }
        }
        do {
          lobby.currBlack = lobby.blackCards.splice(Math.floor(Math.random() * lobby.blackCards.length), 1)[0]
        } while (lobby.currBlack.pick !== 1)
        lobby.currPlayed = []
        lobby.markModified("currPlayed")
        lobby.markModified("users")
        lobby.markModified("czar")
        lobby.save()
          .then(lobby => {
            if (start) {
              io.to(id).emit("Hand Started", lobby)
            } else {
              io.to(client.id).emit("Hand Started", lobby)
            }
          })
      })
    })

    //adds user to lobby
    client.on("Join Lobby", (userId, lobbyId) => {
      Lobby.find({ lobbyId })
        .then(lobby => {
          client.join(lobby[0]._id)
          Player.findById(userId)
            .then(user => {
              user.points = 0
              lobby[0].users.push(user)
              lobby[0].save()
                .then(() => {
                  io.to(lobby[0]._id).emit("Joined Lobby", lobby[0]._id, user)
                })
            })
        })
        .catch(err => console.log(err))
    })

    //handle user playing card
    client.on("Play Card", (id, user, card) => {
      //add card to played cards, give user a new card, update gamestate
      Lobby.findById(id)
        .then(lobby => {
          lobby.currPlayed.push({ card, user })
          lobby.users.forEach(player => {
            if (player._id == user.id) {
              player.hand.forEach(item => {
                if (item == card) {
                  player.hand.splice(player.hand.indexOf(item), 1)
                }
              })
              player.hand.push(lobby.whiteCards.splice(Math.floor(Math.random() * lobby.whiteCards.length), 1)[0])
            }
          })
          lobby.markModified("users")
          lobby.save()
            .then(lobby => {
              if (lobby.currPlayed.length === lobby.users.length - 1) {
                io.to(id).emit("Selection", lobby)
              } else {
                io.to(id).emit("Update Cards", lobby)
              }
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    })

    //handle czar picking winner
    client.on("Pick Card", (lobbyId, card) => {
      //give winning user a point, set new blackcard, update gamestate
      Lobby.findById(lobbyId)
        .then(lobby => {
          let winner = null
          lobby.currPlayed.forEach(played => {
            if (card === played.card) {
              winner = played
            }
          })
          lobby.users.forEach(user => {
            if (user._id == winner.user.id) {
              user.points = user.points + 1
            }
            console.log(user)
          })
          lobby.markModified("users")
          lobby.save()
            .then(lobby => {
              io.to(lobbyId).emit("Winning Card", winner)
            })
        })
    })
  })
}
