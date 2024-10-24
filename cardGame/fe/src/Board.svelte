<script lang="ts">
    import Card from './Card.svelte';
    import type { Board } from './types/State';
    import type { modeType } from './types/mode';

    export let board:Board;
    export let mode:modeType;
    export let animateCounter:number;
    
</script>

<div class="board">
    <div style={animateCounter===0 ? "" : `opacity:${(1-((50-animateCounter)/50))}`} class="me">
        {#if board.player1}
                <Card card={board.player1} mode={mode}></Card>
        {/if}
    </div>

    <div style={animateCounter===0 ? "" : `opacity:${((70-animateCounter)/50)}`} class="battleGround"> 
        <!-- ${((70-animateCounter)/50)} -->
        {#if board.winnerCard}
                <Card  mode={mode} card={board.winnerCard}></Card>
        {/if}
    </div>
    <div style={animateCounter===0 ? "" : `opacity:${(1-((50-animateCounter)/50))}`} class="enemy">
        {#if board.player2}
                <Card card={board.player2} mode={mode}></Card>
        {/if}
    </div>
</div>


<style>
    .board{
        display:grid;
        grid-template-columns: repeat(5,1fr);
        width:100%;
        grid-template-areas: "me . battleGround . enemy";
        grid-template-rows:1fr;
        height:100%;
    }
    .me{
        grid-area:me;
    }
    .enemy{
        grid-area:enemy;
    }
    .battleGround{
        grid-area:battleGround;
    }
    
</style>