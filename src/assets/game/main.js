import * as Map from "./maps/map.js";

let map = undefined;

function launchGame() {
    map = new Map.Map(document.getElementById('mapLayer'));

    map.loadMap("map_01");

    map.image.onload = function () {
        map.drawMap();
    }
}

export {launchGame};