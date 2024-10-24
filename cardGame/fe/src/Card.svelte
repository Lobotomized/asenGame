<script lang="ts">
    import type { CardType } from "./types/Card";
    import type { modeType } from "./types/mode";

    export let card:CardType;
    export let mode: modeType;

    $: animation = card.animation
    $: intelligence = card.intelligence;
    $: description = card.description;
    $: descriptionTitle = card.descriptionTitle;
    $: agility = card.agility;
    $: strength = card.strength;
    $: cardTitle = card.cardTitle
    let video:HTMLVideoElement;

    function playVideo() {
        console.log('here')
        video.play();
    }

    function pauseVideo() {
        video.pause();
        video.currentTime = 0; // Reset to start on pause
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mouseenter={playVideo} on:mouseleave={pauseVideo} class="card" >
    <div class="card-header">
        {cardTitle}
    </div>
    <div class="card-image">
        <video height="150px" bind:this={video} muted preload="auto">
            {#await import(`./assets/${animation}.mp4`) then { default: anim }}
                <source src={anim} type="video/mp4">
            {/await}
        </video>
    </div>
    <p class="description">
        <b>{descriptionTitle} </b><br/>
        {description}
    </p>
    <div class="card-stats">
        <div class="stat" class:activeStat={mode === 'agility'}>
            <h4>Agi</h4>
            <p>{agility}</p>
        </div>
        <div class="stat" class:activeStat={mode === 'intelligence'}>
            <h4>Int</h4>
            <p>{intelligence}</p>
        </div>
        <div class="stat" class:activeStat={mode === 'strength'}>
            <h4>Str</h4>
            <p>{strength}</p>
        </div>
    </div>
</div>


<style>
 :root{
    --umnojitel:5;
 }
 /* @media only screen and (max-width: 600px) {
  :root{
    --umnojitel:3;
  }
} */
 .card{
    color:#122020;
    display:flex;
    flex-direction: column;
    max-width:calc(50px *var(--umnojitel));
    background-color: var(--card-background);
    cursor:pointer;
    border-radius:25px;
    height:420px;
 }
 .card-header{
    font-weight:500;
    text-align: center;
    margin-bottom:5px;
    margin : 5px 20px 5px 20px;
 }
 .description{
    text-align: center;
    margin-left:calc(3px * var(--umnojitel));
    margin-right:calc(3px * var(--umnojitel));
    font-weight:normal;
    font-size:16px;
    height:100%;
 }
 .card-image{
    max-width:100%
 }
 .card-stats{
    display:flex;
    flex-direction: row;
    justify-content: space-between;
    margin:calc(2px * var(--umnojitel));
    gap:calc(4px * var(--umnojitel));
}
 video{
    max-width:100%;
 }
 .stat{
    border-width: 2px;
    border-style:solid;
    padding:calc(1px * var(--umnojitel));
    text-align: center;
    width:calc(1ch * var(--umnojitel));
    border-radius:25px;
    border-color:var(--card-background)
 }

 .stat > p {
    margin:2px;
 }
 .stat > h4{
    margin:2px;
 }
 .activeStat{
    background:#6da4a7;
 }

 .stat > p{
    font-weight:bolder;
    font-size:calc(6px * var(--umnojitel));
 }

</style>