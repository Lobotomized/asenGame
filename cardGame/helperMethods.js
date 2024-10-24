const cardsObj = require('./cards.js')

const bettingSteps  = [0,1,3,5,8,10]

const specials = {
    none:function(meRef,enemyRef,state){},
    riddle:function(meRef,enemyRef,state){
        const card = state.board[meRef];
        const enemyCard = state.board[enemyRef]
        if(card.intelligence > enemyCard.intelligence){
            enemyCard.strength = 0;
            enemyCard.agility = 0;
            enemyCard.intelligence = 0;
        }
    },
    warExperience:function(meRef,enemyRef,state){
        const card = state.board[meRef];
        card[state.mode] += state.tie.taken.length
    },
    training:function(meRef,enemyRef,state){
        const card = state.board[meRef];

        card[state.mode] += 3;
    },
    entangle:function(meRef,enemyRef,state){
        const enemyCard = state.board[enemyRef]
        enemyCard.agility = 1;
    },
    haste:function(meRef,enemyRef,state){
        state[meRef].hand.forEach((card)  => {
            card.agility+=1;
        })
    },
    curse:function(meRef,enemyRef,state){
        const enemyFirstCard = state[enemyRef].hand[0]
        if(enemyFirstCard){
            enemyFirstCard.agility = 1;
            enemyFirstCard.intelligence = 1;
            enemyFirstCard.strength = 1;
        }
    },
    antiMage:function(meRef,enemyRef,state){
        const card = state.board[meRef];
        const enemyCard = state.board[enemyRef]
        if(card.intelligence < enemyCard.intelligence){
            enemyCard.strength = 0;
            enemyCard.intelligence = 0;
            enemyCard.agility = 0;
        }
    },
    wish:function(meRef,enemyRef,state){
        state[meRef].taken.push(    
            { animation:"", 
                intelligence: 0, strength: 0, agility: 0,descriptionTitle:"Wish", description:"", special: "none" },
        )
    },
    science:function(meRef,enemyRef,state){
        state[meRef].hand.forEach((card)  => {
            card[state.mode]+=1;
        })
    },
    warCry: function(meRef,enemyRef,state){
        const card = state.board[meRef];
        if(state.mode === 'strength'){
            card.strength += 6;
        }
    },
    hell: function(meRef,enemyRef,state){
        const takenCount = parseInt(state[meRef].taken.length/2)
        const card = state.board[meRef];
        card[state.mode]+= takenCount;
    },
    copy:function(meRef,enemyRef,state){
        console.log("tuka")
        const card = state.board[meRef];
        const enemyCard = state.board[enemyRef]
        if(card[state.mode] < enemyCard[state.mode] && state[meRef].hand[0]){
            console.log("Na vtoroto")
            card[state.mode] = state[meRef].hand[0][state.mode]
        } 
        console.log(card , '  na tretoto')       
    }
}

module.exports = {
    cleanBoard:function(board, winner){
        if(!winner){
            return;
        }
        winner.taken.push(board.player1, board.player2);
        board.player1 = null;
        board.player2 = null;
        board.winnerCard = null;
        
    },
    special:function(meRef, enemyRef,state){
        const card = state.board[meRef]
        console.log(card.special)
        specials[card.special](meRef,enemyRef,state)
    },
    oppositePlayer:function(player){
        if(player === 'player1'){
            return 'player2'
        }
        return 'player1';
    },
    //Return true if my turn and false if not
    checkIfMyTurn:function(me, turn){
        if(me === turn){
            return true;
        }
        return false;
    },
    //return false if no such card exists and true if it does
    playCard:function(player,playerRef, cardIndex, board){
        const card = player.hand[cardIndex];
        if(!card){
            return false
        }
        board[playerRef] = card;
        player.hand.splice(cardIndex, 1)
        return true;
    },
    bet:function(player, move, state){
        if(state.currentBettingStep === 5){
            state.koeficient = {
                better:player,
                value:bettingSteps[state.currentBettingStep-1]
            }
            state.turn = player;
            return move.mode
        }
        else if(move.giveUp){
            state.turn = module.exports.oppositePlayer(player)
            return state.tempMode;
        }
        else{
            state.tempMode = move.mode;
            state.currentBettingStep+=1;
            state.koeficient = {
                better:player,
                value:bettingSteps[state.currentBettingStep-1]
            }
            return 'betting'
        }
    },
    //Return true if battle and false if not
    checkForBattle: function(board){
        if(!board.player1 || !board.player2){
            return false;
        }
        return true;
    },
    //Do the battle and return the player who won
    battle: function(state){
        const cardPlayerOne = state.board.player1;
        const cardPlayerTwo = state.board.player2;

        // cardPlayerOne.special(state);
        // cardPlayerTwo.special(state);
        const playerOneValue = cardPlayerOne[state.mode];
        const playerTwoValue = cardPlayerTwo[state.mode];
        if(playerOneValue === playerTwoValue){
            return 'tie'
        }
        else if(playerOneValue > playerTwoValue){
            state.board.winnerCard = state.board.player1
            return 'player1'
        }
        else{
            state.board.winnerCard = state.board.player2
            return 'player2'
        }
        
    },
    drawCard: function(player, publicDeck){
        if(publicDeck.length === 0){
            return;
        }
        player.hand.push(publicDeck.pop());
    },
    //return true if finished and false if not
    isRoundFinished: function(player1Hand,player2Hand){
        if(player1Hand.length === 0 && player2Hand.length === 0){
            return true;
        }
        return false;
    },

    //Not done
    countRoundAndClean: function(state){
        const playerOnePoints = state.player1.taken.length;
        const playerTwoPoints = state.player2.taken.length;
        const playerOneKoeficient = state.koeficient.better === 'player2' ? state.koeficient.value : 1
        const playerTwoKoeficient = state.koeficient.better === 'player1' ? state.koeficient.value : 1
        if(playerOnePoints > playerTwoPoints){
            state.player1.score += playerOneKoeficient
        }
        else if (playerOnePoints < playerTwoPoints){
            state.player2.score += playerTwoKoeficient
        }
        state.board.publicDeck = Object.values(cardsObj);
        state.player1.taken = [];
        state.player2.taken = [];
        state.tie.taken = [];
        state.mode = 'betting';
        state.currentBettingStep = 1;
        state.koeficient = null
        
    },
    giveStartingCards: function(state){
        state.board.publicDeck.sort(() => Math.random() - 0.5);
        state.player1.hand = state.board.publicDeck.splice(-5)
        state.player2.hand = state.board.publicDeck.splice(-5);
    }
}