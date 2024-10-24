<script lang="ts">
  import io  from 'socket.io-client';
  import Hand from './Hand.svelte';
  import Vote from './Vote.svelte'
  import Board from './Board.svelte'
    import type { stateType } from './types/State';

  let socket = io();
  let state:stateType | null  = null;

  socket.on('returnState', (innerState:stateType) => {
      state = innerState;
  }) // Return State

</script>

<main>
  {#if state}
  <Vote socket={socket} state={state}></Vote>
  {/if}
  {#if state}
  <div class="all">
      <div class="scoreBoard">
        <p><b>{state.meRef === state.turn ? 'My Turn' : 'Enemy Turn'}</b></p>

        <p>
          <b>Sets :</b>
          <br>
          Your points : {state.me?.score}
          <br>
          Enemy points : {state.enemyScore}
        </p>

        <p>
          <b>Decks : </b><br>
          Public cards left : {state.board?.publicDeck.length}
          <br>
          Tied cards : {state.tie?.taken.length}
        </p>

        <p>
          <b>Cards you've taken :</b> <br>
          Taken cards : {state?.me?.taken.length}
          <br>
          <b>Cards enemy's taken :</b>
           <br>
          Taken cards : {state?.enemyTaken}
        </p>

        <p>
          Helper: <br>
          The special of the first played card executes first.
        </p>
      </div>
      
      {#if state.board}
        <div class="board">
          <Board animateCounter={state.animateCounter} mode={state.mode} board={state.board}></Board>
        </div>
      {/if}
      
      
      {#if state.me && state.me.hand}
        <div class="hand">
          <Hand socket={socket} mode={state.mode} cards={state.me.hand}></Hand>
        </div>
      {/if}

  </div>


  {/if}
</main>


<style>
  .hand{
    grid-area: hand;
  }

  .board{
    grid-area: board;
  }

  .scoreBoard{
    grid-area: scoreBoard;
    display:flex;
    flex-direction: column;
  }

  main{
    height:100%;
    width:100%;
  }

  .all{
    height:100%;
    width:100%;
    display:grid;
    grid-template: 
    "board board board scoreBoard"
    "hand hand hand scoreBoard";
    grid-template-rows: 1fr 1fr;

  }
</style>