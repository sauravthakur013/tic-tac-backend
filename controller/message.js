const PlayerService = require("./../models/players");

export const setNameFunction = async (data, ws) => {
  const { name } = data;
  const newPlayerPayLoad = {
    name: name,
    status: true,
  };
  const player = new PlayerService(newPlayerPayLoad);
  const newPlayerCreated = await player.save();
  ws.connectionId = newPlayerCreated._id;
  broadcastToAll(await PlayerService.find());
};

module.exports = { 
setNameFunction,
gameRequestFunction,
};
