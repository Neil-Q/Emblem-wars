import { Pathfinder } from "./pathfinder.js"

class Map {
    constructor(game) {
        this.game = game;

        this.image = new Image();
        this.layout = undefined;

        this.gridWidth = undefined;
        this.gridHeight = undefined;

        this.visible = false
        this.pathfinder = new Pathfinder(game, this);
    }

    buildLayout(layout) {
        let tilesetsLibrary = require("../maps/mapTilesets.json");
        let buildedLayout = [];
        let errors = 0;

        for(let i = 0; i < layout.length; i++) {
            let tileProperties = tilesetsLibrary.find(element => element.id == layout[i]);
            
            if (tileProperties) {
                let newTile = new Tile(tileProperties);
                buildedLayout.push(newTile);
            }
            else {
                let yError = Math.ceil((i + 1) / this.gridWidth);
                let xError = (i + 1) % this.gridWidth;
                console.log("Tileset non trouvé aux coordonnées x:" + xError + " / y:" + yError);

                let newTile = new Tile(tilesetsLibrary.find(element => element.id == "error"));
                buildedLayout.push(newTile);

                errors ++
            }
        }

        if (errors == 0) {
            console.log("Map succesfully builded");
        }

        this.layout = buildedLayout;
    }

    checkIfMoveAble(mapX = this.game.pointer.mapX, mapY = this.game.pointer.mapY, moveType = "foot") {
        let tileDatas = this.getTileDatas(mapX, mapY);
        let moveAble = this.checkMoveType(tileDatas.moveAble, moveType);
        return moveAble;
    }

    checkMoveType(tileMoves, moveType) {
        let moveAble = false;

        switch (moveType) {
            case "climbing" :
                moveAble = tileMoves.climbing;
                break

            case "fly" :
                moveAble = tileMoves.fly;
                break;
            
            case "foot" :
                moveAble = tileMoves.foot;
                break;

            case "swiming" :
                moveAble = tileMoves.swiming;
                break;
        }

        return moveAble;
    }

    getTileDatas(mapX = this.game.pointer.mapX, mapY = this.game.pointer.mapY) {
        let tileID = mapX + ((mapY - 1 ) * this.gridWidth);
        let tile = this.layout[tileID - 1];
        
        if(tile){
            let tileDatas = {
                name : tile.name,
                moveAble : tile.moveAble,
                moveCost : tile.moveCost,
                bonusDef : tile.bonusDef,
                bonusDodge : tile.bonusDodge,
                obstructView : tile.obstructView
            }
    
            return tileDatas;
        }
        return null
    }

    getMapCoordinatesFromIndex(index) {
        let x = index % this.gridWidth + 1;
        let y = Math.ceil(index / this.gridWidth);

        return {x : x, y : y};
    }

    getMapIndexFromCoordinates(mapX, mapY) {
        let index = ((mapY - 1) * this.gridWidth) + mapX - 1;

        return index;
    }

    loadMap(mapName) {

        let mapData = require("../maps/" + mapName + "_data.json");
            this.buildLayout(mapData.layout);
            this.gridWidth = mapData.gridWidth;
            this.gridHeight = mapData.gridHeight;

        this.image.src = require("../maps/" + mapName + "_image.png");
    }

    render(ctx, zoom) {
        if (this.visible) ctx.drawImage(this.image, 0, 0, this.image.width * zoom, this.image.height * zoom);
    }

    showMap() {
        this.visible = true;
    }
}

class Tile {
    constructor(properties) {
        this.name = properties.name;
        this.moveAble = properties.moveAble
        this.moveCost = properties.moveCost;
        this.bonusDef = properties.bonusDef;
        this.bonusDodge = properties.bonusDodge;
        this.obstructView = properties.obstructView;
        this.unit = null;
    }
}

export {Map}