const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const newG = require('./globby').newIOServer;
const delayStartBlocker = require('./blockers').delayStartBlocker




app.use('/static', express.static('public'))

const types = [
    "rock",
    "paper",
    "scissors"
]
const speed = 5;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


function getRandomType(players){
    let typesLeft = [...types];
    Object.keys(players).forEach((player) => {
        typesLeft = typesLeft.filter((type) => {
            return type != player.type
        })
    })
    if(typesLeft.length === 0){
        return types[getRandomInt(3)]
    }
    else{
        return typesLeft[getRandomInt(typesLeft.length)]
    }
}

function squareCollisionDetection(x1,y1,x2,y2,side){
    if (x1 + side >= x2 && x1 <= x2 + side && y1 + side >= y2 && y1 <= y2 + side) {
        return true
    }
    return false;
}

function dieAndReborn(player,players, killer){
    player.x = getRandomInt(500)
    player.y = getRandomInt(1000)
    const tempKillerType = killer.type
    killer.type = player.type
    player.type = tempKillerType//getRandomType(players)
    player.directionX = null
    player.directionY = null
    player.width = 50
    player.height =50
    player.score = 0;
}

function moveTowards(currentPosition, targetPosition, speed) {
    if(targetPosition.x === null || targetPosition.y === null){
        return
    }
    // Calculate the direction vector from current to target
    let direction = {
        x: targetPosition.x - currentPosition.x,
        y: targetPosition.y - currentPosition.y
    };

    // Calculate the distance to the target
    let distance = Math.sqrt(direction.x ** 2 + direction.y ** 2);

    // Normalize the direction vector
    if (distance > 0) {
        direction.x /= distance;
        direction.y /= distance;

        // Move the current position towards the target
        currentPosition.x += direction.x * speed;
        currentPosition.y += direction.y * speed;

        // Check if the object has reached or overshot the target
        if (distance < speed) {
            currentPosition.x = targetPosition.x;
            currentPosition.y = targetPosition.y;
        }
    }

    if(currentPosition.x > 500){
        currentPosition.x = 500-17.5;
    }
    else if(currentPosition.x < 17.5){
        currentPosition.x = 17.5
    }

    if(currentPosition.y > 1000){
        currentPosition.y = 1000;
    }
    else if(currentPosition.y < 0){
        currentPosition.y = 25;
    }
}

newG({
    baseState: {
        players:{

        }
    },
    moveFunction: function (player, move, state) {
        const thePlayer = state.players[player.ref];
        
        thePlayer.directionX = move.x;
        thePlayer.directionY = move.y
    },
    minPlayers: 1,
    maxPlayers: 50, // Number of Players you want in a single game
    timeFunction: function (state) {
        Object.values(state.players).forEach((player) => {
            if(player.directionX && player.directionY){
                moveTowards(player,{x:player.directionX,y:player.directionY}, speed)
            }
            Object.values(state.players).forEach((player2) => {
                if(squareCollisionDetection(player.x,player.y,player2.x,player2.y,player.width)){
                    if(player.type === 'rock'){
                        if(player2.type === 'scissors'){
                            dieAndReborn(player2, state.players, player)
                            player.score+=1;
                        }
                        else if(player.type === 'paper'){
                            dieAndReborn(player, state.players, player2)
                            player2.score+=1;
                        }
                    }
                    else if(player.type === 'paper'){
                        if(player2.type === "rock"){
                            dieAndReborn(player2, state.players, player)
                            player.score+=1
                        }
                        else if(player2.type === 'scissors'){
                            dieAndReborn(player, state.players,player2)
                            player2.score+=1
                        }
                    }
                    else if(player.type === "scissors"){
                        if(player2.type === "paper"){
                            dieAndReborn(player2, state.players, player)
                            player.score+=1;
                        }
                        else if(player2.type === "rock"){
                            dieAndReborn(player, state.players, player2)
                            player2.score+=1
                        }
                    }
                }
                
            })
        })
        //State Change on every frame
    },
    delay:10,
    joinBlockerFunction: function(){
        return true
    },
    // joinBlockerFunction: delayStartBlocker.joinBlockerFunction,
    statePresenter: function (state, playerRef) {
        const toReturn = {...state};
        toReturn.players[playerRef] = {...toReturn.players[playerRef]};
        toReturn.players[playerRef].isMe = true;
        return toReturn;
    },
    connectFunction: function (state, playerRef) {
        state.players[playerRef] = {
            x:getRandomInt(500),
            y:getRandomInt(1000),
            type:getRandomType(state.players),
            directionX:null,
            directionY:null,
            width:35,
            height:35,
            score:0
        }

    },
    // startBlockerFunction:function(minPlayers, maxPlayers, currentPlayers, state){
    //     return state
    // },
    disconnectFunction: function (state, playerRef) {
        state.players[playerRef] = undefined;
        delete state.players[playerRef]
        console.log(state.players)
    }
},
    io,
    false,
    {
        joinBotFunction: function (game, minPlayers, maxPlayers) {
            if (game.players.length < 3 && game.players.length > 1) {
                // game.joinBot('tralala')
            }
        },
        botAIFunction: function (game, bot) {
            game.move(bot.socketId, '')
        }
    })


app.get('/', function (req, res) {
    return res.status(200).sendFile(__dirname + '/exampleBot.html');
});


http.listen(3005, function () {
    console.log('listening on *:3000');
});