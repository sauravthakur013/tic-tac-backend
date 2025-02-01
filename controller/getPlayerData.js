const monggoose = require("mongoose");
const PlayerService = require("../models/players");
const gameService = require("../models/gameModule");

const getPlayerData = async (req, res) => {
  try {
    const playerId = req.query.id; // Extract the player ID from the query parameters
    const player = await PlayerService.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    const playerData = {
      id: player._id,
      name: player.name,
      status: player.status,
    };
    return res.status(200).json({ data: playerData });
  } catch (error) {
    console.error("Error removing player:", error);
    res
      .status(500)
      .json({ error: "An error occurred while removing the player" });
  }
};

const getPlayerDataById = async (req, res) => {
  try {
    console.log(req.query.player1, req.query.player2);

    const dataToAdd = {
      player1: req.query.player1,
      player2: req.query.player2,
      status: true,
      turn: req.query.player1,
      board: Array(9).fill(null),
    };

    const player1 = await PlayerService.findById(req.query.player1);
    const player2 = await PlayerService.findById(req.query.player2);
    
    const game = new gameService(dataToAdd);
    const gameCreated = await game.save();

    const returnData = {
      _id: gameCreated._id,
      player1: player1,
      player2: player2,
      turn: req.query.player1,
      board: gameCreated.board,
    };

    return res.status(200).json({ data: returnData });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getPlayerData, getPlayerDataById };
