<template>
    <div id="summonerGame">
        <canvas id="mapLayer" width="640" height="448"></canvas>
    </div>
</template>

<script>
export default {
    name: "SummonerGame"
}
</script>

<style>

#summonerGame {
    width: 640px;
    height: 448px;
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