<template>
    <div id="summonerGame">        
    </div>
</template>

<script>
import * as SummonerGame from "@/assets/game/main.js";

export default {
    name: "SummonerGame",
    mounted() {
        SummonerGame.launchGame("summonerGame");
        //let mapCanvas = document.getElementById('mapLayer');

        /*mapCanvas.addEventListener("mousemove", event => {
            //mouseX = event.x;
            //mouseY = event.y;

            //console.log("x: " + mouseX + " / y: " + mouseY);
            console.log("x: " + event.offsetX + " / y: " + event.offsetY);
            //console.log(event);
        });*/
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

/*#mapLayer {  
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: beige;
}

#unitsLayer {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: rgba(0, 0, 0, 0.1);
}*/
</style>