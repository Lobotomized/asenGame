const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const newG = require('./globby').newIOServer;
const delayStartBlocker = require('./blockers').delayStartBlocker
const {battle,special, drawCard,playCard,bet, checkIfMyTurn, checkForBattle, cleanBoard, isRoundFinished, countRoundAndClean, giveStartingCards, oppositePlayer} = require('./helperMethods.js')
const cardsObj = require('./cards.js')

app.use('/static', express.static('public'))
app.use('/assets', express.static('fe/dist/assets'))

const ANIMATE_COUNTER = 25;
const ANIMATE_SPECIAL_COUNTER = 15;

/*
Effect - {
effect:funk,
name:String,
descr:String,
priority:Number,
}

Move while betting - {
 Mode: Strength, Agility, Intelligence,
 Bet: 1|3|5|8|10
}
 Move while playing - {
 cardIndex:number
 }
 Card - {
 int:Number,
 str:Number,
 agi:Number,
 special:Effect,
 img:String
 }

 state - {
 player1: {
    hand:Card[],
    taken:Card[]
 },
 player2: {
    hand:Card[],
    taken:Card[]
 },

 board: {
    CardPlayer1:Card,
    CardPlayer2:Card,
    WinnerCard:Card,
    PublicDeck:Card[]
 },
 Turn:player1 | player2 | Animate,
 Mode: Intelligence, Strength, Agility, Betting
 AnimCounter: Number,
 LastBattleWinner: player1 | player2 | null
 }
*/
const genericSpecial = 'genericSpecial'

const cards = Object.values(cardsObj)

newG({
    baseState: {
        player1: {
            hand:[],
            taken:[],
            score:0
        },
        player2: {
            hand: [],
            taken: [],
            score:0
        },
        currentBettingStep:1,
        tie: {
            taken:[]
        },
        board: {
            player1: null,
            player2: null,
            winnerCard: null,
            publicDeck: cards
        },
        turn: 'player1',
        mode:'betting',
        animateCounter: 0,
        animateSpecialCounter:0,
        lastBattleWinner: null,
        tempMode:null,
        koeficient:null, //{value:1,better:'player1'},
    },
    moveFunction: function (player, move, state) {
        //State Change on Move
        if(!checkIfMyTurn(player.ref,state.turn)){
            return
        }
        if(state.animateCounter > 0){
            return
        }
        if(state.mode === 'betting'){
            if(!move.mode && !move.giveUp){
                return
            }
            const theBet = bet(player.ref, move, state)
            if(theBet != 'betting'){
                state.mode = theBet;
                state.tempMode = null
            }
            if(move.mode || move.giveUp){
                state.turn = oppositePlayer(state.turn)
            }
            return
        }
        if(!playCard(state[player.ref],player.ref, move.cardIndex,state.board)){
            return
        }
        
        //set Turn if
        if(state.board['player1']){
            state.turn = 'player2'
        }
        else if(state.board['player2']){
            state.turn = 'player1'
        }

        drawCard(state[player.ref], state.board.publicDeck)
        if(!checkForBattle(state.board)){
            return
        }
        special(oppositePlayer(player.ref),player.ref, state)
        special(player.ref,oppositePlayer(player.ref), state);

        const winner = battle(state)
        let prevBattleWinner = state.lastBattleWinner
        state.lastBattleWinner = winner;
        if(winner === "tie" && prevBattleWinner && prevBattleWinner != "tie"){
            state.turn = prevBattleWinner
        }
        else if(winner === "tie"){
            state.turn = "player1"
        }
        else{
            state.turn = winner
        }
        state.animateCounter = ANIMATE_COUNTER
    },
    minPlayers: 2,
    maxPlayers: 2, // Number of Players you want in a single game
    timeFunction: function (state) {
        if(state.mode === 'betting'){
            if(state.player1.hand.length === 0){
                giveStartingCards(state)
            }
            return
        }
        //Dokato namalqva animate countera animate the battle
        if(state.animateCounter){
            state.animateCounter--;
            return;
        }
        if(state.board.player1 && state.board.player2){
            //Prepare for next turn
            cleanBoard(state.board, state[state.lastBattleWinner])
        }
        if(isRoundFinished(state.player1.hand, state.player2.hand)){
            countRoundAndClean(state)
            giveStartingCards(state)
            return
        }
        //State Change on every frame
    },
    startBlockerFunction: delayStartBlocker.startBlockerFunction(1000),
    joinBlockerFunction: delayStartBlocker.joinBlockerFunction,
    statePresenter: function (state, playerRef) {
        const toReturn = {...state};
        toReturn[oppositePlayer(playerRef)] = ''
        toReturn.me = state[playerRef]
        toReturn.meRef = playerRef
        toReturn.enemyScore = state[oppositePlayer(playerRef)].score
        toReturn.enemyTaken = state[oppositePlayer(playerRef)].taken.length
        return toReturn;
    },
    // connectFunction: function (state, playerRef) {

    // },
    disconnectFunction: function (state, playerRef) {
        state[playerRef] = undefined;
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
    return res.status(200).sendFile(__dirname + '/fe/dist/index.html');
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});