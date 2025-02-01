const monggoose = require("mongoose");

const playerSchema = new monggoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status:{
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: { type: Date, default: Date.now, expires: 86400 },
});

module.exports = monggoose.model("players", playerSchema);