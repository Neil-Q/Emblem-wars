<template>
    <div id="summonerGame">
        <canvas id="mapLayer" width="1104" height="720"></canvas>
    </div>
</template>

<script>
import * as SummonerGameScript from "@/assets/game/main.js";

export default {
    name: "SummonerGame",
    mounted() {
        SummonerGameScript.launchGame();
    }
}
</script>

<style>

#summonerGame {
    margin: auto;
}

#mapLayer {  
    position: relative;
    left: 0;
    top: 0;
    z-index: 0;
    background-color: beige;
}
</style>