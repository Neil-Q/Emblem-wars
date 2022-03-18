import * as Map from "./maps/map.js";
import * as Ui from "./ui.js";

let gameLocation = undefined;

let mapCanvas = undefined;
let unitsCanvas = undefined;
let uiCanvas = undefined;

let map = undefined;
let ui = undefined;

let zoom = 3;

let mouseX = undefined;
let mouseY = undefined;
let gridX = undefined;
let gridY = undefined;

function createCanvas(id, zIndex) {
    let newCanvas = document.createElement("canvas");

    newCanvas.id = id;
    newCanvas.height = gameLocation.offsetHeight;
    newCanvas.width = gameLocation.offsetWidth;

    newCanvas.style.position = "absolute";
    newCanvas.style.top = "0";
    newCanvas.style.left = "0";
    newCanvas.style.height = gameLocation.offsetHeight.toString() + "px";
    newCanvas.style.width = gameLocation.offsetWidth.toString() + "px";
    newCanvas.style.zIndex = zIndex;
    
    gameLocation.appendChild(newCanvas);

    return newCanvas;
}

function launchGame(locationId) {

    gameLocation = document.getElementById(locationId);

    mapCanvas = createCanvas("summonerGameMapLayer", 1);
    unitsCanvas = createCanvas("summonerGameUnitsLayer", 2);
    uiCanvas = createCanvas("summonerGameUiCanvas", 3);

    unitsCanvas.style.backgroundColor = "rgba(0,0,0,0)";
    uiCanvas.style.backgroundColor = "rgba(0,0,0,0)";

    console.log("canvas height = " + mapCanvas.height);
    map = new Map.Map(mapCanvas);

    map.loadMap("map_01");

    map.image.onload = function () {
        map.drawMap(zoom, 0, 0);
    }

    ui = new Ui.Ui(uiCanvas);

    gameLocation.addEventListener("mousemove", event => {

        event.offsetX > 0 ? mouseX = event.offsetX : mouseX = 1;
        event.offsetY > 0 ? mouseY = event.offsetY : mouseY = 1;

        let currentGridX = Math.ceil(mouseX / (16 * zoom));
        let currentGridY = Math.ceil(mouseY / (16 * zoom));

        if (currentGridX != gridX || currentGridY != gridY) {
            gridX = currentGridX;
            gridY = currentGridY;

            let tileDatas = map.getTileDatas(gridX, gridY);

            ui.clearCanvas();
            ui.drawCursor(gridX, gridY, zoom);
            ui.drawTileInfos(tileDatas, mouseX);
        }
    });
}

export {launchGame};