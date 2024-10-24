<script lang="ts">
    import type { CardType } from "./types/Card";
    import type { modeType } from "./types/mode";
    import Card from "./Card.svelte";

    export let socket;
    export let cards:CardType[];
    export let mode: modeType
</script>


<div class="cards">

        {#each cards as card, cardIndex}
        

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#key card.cardTitle}
        <div on:click={() => {
            socket.emit('move' , {
                cardIndex
            })
        }} >
            <Card mode={mode} card={card}></Card>
        </div>
        {/key}

        {/each}


</div>

<style>
     .cards{
        display:flex;
        flex-direction: row;
        gap:8px;
    }
</style>