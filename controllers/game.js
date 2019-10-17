module.exports = (io) => {
  const Lobby = require("../models/lobby")
  const Player = require("../models/player")
  io.on("connection", client => {
    //handle lobby creation
    client.on("New Game", (owner, lobbyId, whiteCards, blackCards) => {
      Player.findById(owner)
        .then(user => {
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
    client.on("Start Game", id => {
      Lobby.findById(id).then(lobby => {
        // setting random czar and black card
        lobby.czar = lobby.users[Math.floor(Math.random() * lobby.users.length)].id
        do {
          lobby.currBlack = lobby.blackCards.splice(Math.floor(Math.random() * lobby.blackCards.length), 1)[0]
        } while (lobby.currBlack.pick !== 1)
        lobby.save()
          .then(() => {
            io.to(id).emit("Game Started", lobby)
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
    client.on("Play Card", (lobbyId, user) => {
      //add card to played cards, give user a new card, update gamestate
    })

    //handle czar picking winner
    client.on("Pick Card", () => {
      //give winning user a point, set new blackcard, update gamestate
    })
  })
}
