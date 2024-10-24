import type { CardType } from "./Card"
import type { modeType } from "./mode"

export type stateType = {
    me?:player,
    currentBettingStep:number,
    tie:{taken:CardType[]},
    board?:Board,
    turn:turn,
    mode:modeType,
    animateCounter:number,
    lastBattleWinner: turn,
    tempMode: modeType,
    koeficient: {
        mode:modeType,
        value:number,
        better:turn
    },
    meRef:turn,
    enemyScore:number,
    enemyTaken:number
    
}

export type turn = 'player1' | 'player2' | null

export type player = {
    hand:CardType[],
    taken:CardType[],
    score:Number
}

export type Board = {
    player1:CardType,
    player2:CardType,
    winnerCard:CardType,
    publicDeck:CardType[]
}