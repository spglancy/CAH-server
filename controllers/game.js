module.exports = io => {
  const Lobby = require("../models/lobby")
  io.on("connection", client => {
    //handle lobby creation
    io.on("New Game", (owner, lobbyId, whiteCards, blackCards) => {
      Lobby.create({
        users: [owner],
        owner: owner.name,
        whiteCards,
        blackCards,
        currBlack: null,
        currPlayed: [],
        lobbyId,
        sets: [],
        czar: null
      })
        .then(() => {
          client.emit("Lobby Created", lobby._id)
        })
        .catch(err => console.log(err))
    })

    //starts the game
    io.on("Start Game", () => {})

    //adds user to lobby
    io.on("Join Lobby", () => {})

    //handle user playing card
    io.on("Play Card", () => {})

    //handle czar picking winner
    io.on("Pick Card", () => {})
  })
}
