const monggoose = require("mongoose");

const gameSchema = new monggoose.Schema({
    player1: {
        type: String,
        required: true,
    },
    player2:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    turn: {
        type: String,
        required: true,
    },
    board: {
        type: Array,
        required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: 86400 },
});

module.exports = monggoose.model("game", gameSchema);