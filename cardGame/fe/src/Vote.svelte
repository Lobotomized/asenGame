<script lang="ts">
export let socket;
export let state;

$:myTurn = state.turn === state.meRef;
$:isMyTurn = myTurn ? "Your turn" : "Enemies turn";


const bettingSteps  = [0,1,3,5,8,10]
const modes:string[] = [
  'Intelligence',
  'Agility',
  'Strength'
]
</script>

<dialog open={state.mode === 'betting'}>
    <div class="container">
        {#if myTurn}
        {#if !state?.koeficient?.value || state.koeficient.value < 10}
          {#if state?.koeficient}
          <span>Enemy voted for {state.tempMode} with coefficient {bettingSteps[state.currentBettingStep-1]} to 1 </span>
          {/if}
          <div class="bets">
            {#each modes as mode}
              {#if mode.toLowerCase() !== state.tempMode}
              <div class="modeBet">
                <h3 class="modeName">{mode.substring(0,3)}</h3>
                <button on:click={() =>{
                  socket.emit('move', {
                    mode:mode.toLowerCase()
                  })}}>Bet {bettingSteps[state.currentBettingStep]} to 1</button>
              </div>
              {/if}
            {/each}
          </div>
        {/if}
        
        {#if state.currentBettingStep > 1}
          <button on:click={() => {
              socket.emit('move', {
                giveUp:true
              })
          }}>Give up</button>
        {/if}
      
      {:else}
          <h3>Enemy is voting</h3>
      {/if}
    </div>

</dialog>

<style>
    
  dialog{
    background:var(--card-background);
    z-index:10;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
  }
 .container{
  background:var(--card-background);
  display:flex;
  flex-direction: column;
 }
 button{
  font-weight:bolder;
  color:var(--letters-color);
  padding:8px;
  border-radius:12px;
  background: var(--active-stat-color);
  outline: none;
  border: solid;
  border-width: 3px;
  cursor:pointer;
  transition: 0.5s ease-out;
 }

 button:hover{
  background-color: var(--letters-color);
  color:var(--active-stat-color);
 }
 
 .modeName{
  line-clamp: 3;
 }

 .modeBet{
  display:flex;
  flex-direction: column;
  align-items: center;
  margin-left:20px;
  margin-right:20px;
 }

 .bets{
  display:flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom:15px;
 }
</style>