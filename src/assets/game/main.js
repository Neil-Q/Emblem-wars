import * as Map from "./maps/map.js";
import * as Ui from "./ui.js";
import * as Unit from "./units.js"

let gameLocation = undefined;

let mapCanvas = undefined;
let unitsCanvas = undefined;
let uiCanvas = undefined;

let map = undefined;
let ui = undefined;
let teams = [{"color": "rgb(0, 0, 255)"}, {"color": "rgb(255, 0, 0)"}]
let unitsManager = undefined;

let zoom = 3;

let pointer = {
    mouseX : undefined,
    mouseY : undefined,

    mapX : undefined,
    mapY : undefined,

    relativeMapX : undefined,
    relativeMapY : undefined
}

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

function initGame(locationId) {

    gameLocation = document.getElementById(locationId);

    mapCanvas = createCanvas("summonerGameMapLayer", 1);
    unitsCanvas = createCanvas("summonerGameUnitsLayer", 2);
    uiCanvas = createCanvas("summonerGameUiCanvas", 3);

    map = new Map.Map(mapCanvas);

    map.loadMap("map_01");

    map.image.onload = function () {
        map.drawMap(zoom, 0, 0);
    }

    ui = new Ui.UiManager(uiCanvas);
    unitsManager = new Unit.UnitsManager(unitsCanvas, teams);
}

function runGame(locationId) {

    initGame(locationId);

    unitsManager.addUnit(1, 15, 11, 20, 15, 5, 110, 20, 10, 5, 100, 8);
    unitsManager.addUnit(1, 16, 8, 20, 15, 5, 110, 20, 10, 5, 100, 8);
    unitsManager.addUnit(2, 22, 10, 30, 22, 7, 130, 40, 20, 10, 67, 8);

    unitsManager.drawUnits(zoom);


    gameLocation.addEventListener("mousemove", event => {

        let pointerUpdate = updatePointer(event);

        if (pointerUpdate) {
           
            let tileDatas = map.getTileDatas(pointer.mapX, pointer.mapY);

            ui.clearCanvas();
            ui.drawCursor(pointer.mapX, pointer.mapY, zoom);
            ui.drawTileInfos(tileDatas, pointer.mouseX);
        }
    });

    gameLocation.addEventListener("click", function() {
        let clickedUnitId = unitsManager.findUnitFromPosition(pointer.mapX, pointer.mapY);
        
        if (clickedUnitId) {
            clickedUnitId == unitsManager.selectedUnit ?
            unitsManager.unselectPreviousUnit() : unitsManager.selectUnit(clickedUnitId);            
        }
        else if (unitsManager.selectedUnit){ 
            unitsManager.moveSelectedUnit(pointer.mapX, pointer.mapY);
            unitsManager.unselectPreviousUnit();
        }

        unitsManager.drawUnits(zoom);
    });
}

function updatePointer(event) {
        event.offsetX > 0 ? pointer.mouseX = event.offsetX : pointer.mouseX = 1;
        event.offsetY > 0 ? pointer.mouseY = event.offsetY : pointer.mouseY = 1;

        let currentGridX = Math.ceil(pointer.mouseX / (16 * zoom));
        let currentGridY = Math.ceil(pointer.mouseY / (16 * zoom));

        if (currentGridX != pointer.gridX || currentGridY != pointer.gridY) {
            pointer.mapX = currentGridX;
            pointer.mapY = currentGridY;

            return true
        }
        else {
            return false
        }
}

export {runGame};