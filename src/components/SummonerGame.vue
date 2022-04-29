<template>
    <div id="summonerGame">        
    </div>
</template>

<script>
import * as SummonerGame from "@/assets/Summoner_Game/game.js";

export default {
    name: "SummonerGame",
    mounted() {
        let gameLocation = document.getElementById("summonerGame");

        let summonerGame = new SummonerGame.Game();    
        summonerGame.launch(gameLocation);
    }
}
</script>

<style>
#summonerGame {
    margin: auto;
    position: relative;
    width: 1104px;
    height: 720px;
}
</style>