const { v4: uuidv4 } = require("uuid");
const PlayerService = require("./../models/players");
// const { gameRequestFunction,setNameFunction } = require("./message");
const gameService = require("./../models/gameModule");

const FirstSocketConnection = async (wss) => {
  try {
    const playerConnections = new Map();

    const broadcastToAll = (data) => {
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          const broadcastToAllPayload = {
            type: "broadcastToAll",
            payload: data,
          };
          client.send(JSON.stringify(broadcastToAllPayload));
        }
      });
    };

    const setNameFunction = async (data, ws) => {
      const { name } = data;
      const newPlayerPayLoad = {
        name: name,
        status: true,
      };
      const player = new PlayerService(newPlayerPayLoad);
      const newPlayerCreated = await player.save();
      playerConnections.set(newPlayerCreated._id.toString(), ws);
      ws.connectionId = newPlayerCreated._id;
      const allPlayers = await PlayerService.find();
      broadcastToAll(allPlayers);
    };

    const gameRequestFunction = async (data, ws) => {
      const { toPlayerId } = data;
      const targetConnection = playerConnections.get(toPlayerId);
      if (
        targetConnection &&
        targetConnection.readyState === targetConnection.OPEN
      ) {
        const gameRequestPayload = {
          type: "gameRequest",
          fromPlayerId: data.fromPlayerId,
          toPlayerId: data.toPlayerId,
        };
        await targetConnection.send(JSON.stringify(gameRequestPayload));
      } else {
        console.log(`Player with ID ${toPlayerId} is not connected`);
      }
    };

    const gameRequestDeclineFunction = async (data, ws) => {
      const { fromPlayerId, toPlayerId } = data;
      const targetConnection = playerConnections.get(toPlayerId);
      if (
        targetConnection &&
        targetConnection.readyState === targetConnection.OPEN
      ) {
        const gameRequestDeclinePayload = {
          type: "gameDeclineResponse",
          toPlayerId: data.toPlayerId,
        };
        await targetConnection.send(JSON.stringify(gameRequestDeclinePayload));
      } else {
        console.log(`Player with ID ${toPlayerId} is not connected`);
      }
    };

    const acceptGameFunction = async (data, ws) => {
      const { fromPlayerId, toPlayerId } = data;
      const targetConnection = playerConnections.get(toPlayerId);
      if (
        targetConnection &&
        targetConnection.readyState === targetConnection.OPEN
      ) {
        const acceptGamePayload = {
          type: "gameAcceptResponse",
          fromPlayerId: data.fromPlayerId,
          toPlayerId: data.toPlayerId,
        };
        await targetConnection.send(JSON.stringify(acceptGamePayload));
      } else {
        console.log(`Player with ID ${toPlayerId} is not connected`);
      }
    };

    const moveFunction = async (data, ws) => {
      const { board, turn, player1, player2 } = data;
      const targetConnection1 = playerConnections.get(player1);
      const targetConnection2 = playerConnections.get(player2);
      const movePayload = {
        type: "move",
        board: board,
        turn: turn,
      };
      if (
        targetConnection1 &&
        targetConnection1.readyState === targetConnection1.OPEN
      ) {
        await targetConnection1.send(JSON.stringify(movePayload));
      } else {
        console.log(`Player with ID ${player1} is not connected`);
      }
      if (
        targetConnection2 &&
        targetConnection2.readyState === targetConnection2.OPEN
      ) {
        await targetConnection2.send(JSON.stringify(movePayload));
      } else {
        console.log(`Player with ID ${player2} is not connected`);
      }
    }

    const gameEndFunction = async (data, ws) => {
      console.log(data,'0000000000000000000');
      const { from, to } = data;
      const dataToSend = {
        type: "gameEnd",
      }
      const targetConnection2 = playerConnections.get(to);
      if (
        targetConnection2 &&
        targetConnection2.readyState === targetConnection2.OPEN
      ) {
        await targetConnection2.send(JSON.stringify(dataToSend));
      } else {
        console.log(`Player with ID ${to} is not connected`);
      }
    }

    wss.on("connection", async (ws) => {
      await ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "setName") setNameFunction(data, ws);
        if (data.type === "gameRequest") gameRequestFunction(data, ws);
        if (data.type === "gameDecline") gameRequestDeclineFunction(data, ws);
        if (data.type === "gameAccept") acceptGameFunction(data, ws);
        if (data.type === "move") moveFunction(data, ws);
        if (data.type === "endGame") gameEndFunction(data, ws);
      });

      await ws.on("close", async () => {
        playerConnections.delete(ws.connectionId.toString());
        const deletedPlayer = await PlayerService.findByIdAndDelete(
          String(ws.connectionId)
        );
        const game = await gameService.findOne({ $or: [{ player1: ws.connectionId}, { player2: ws.connectionId }] });
        if (game) {
          const target = game.player1 === ws.connectionId ? game.player2 : game.player1;
          const targetConnection = playerConnections.get(target);
          if (
            targetConnection &&
            targetConnection.readyState === targetConnection.OPEN
          ) {
            const gameEndPayload = {
              type: "endByRefresh",
            };
            await targetConnection.send(JSON.stringify(gameEndPayload));
          }
        }

        broadcastToAll(await PlayerService.find());
        console.log("WebSocket connection closed");
      });
    });

  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  FirstSocketConnection,
};
