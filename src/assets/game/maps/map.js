class Map {
    constructor(canvas) {
        this.image = undefined;
        this.tileSize = 16;
        this.gridWidth = undefined;
        this.gridHeight = undefined;
        this.layout = undefined;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    buildLayout(layout) {
        let tilesetsLibrary = require("./mapTilesets.json");
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

        return buildedLayout;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap(zoom, offsetX, offsetY) {
        this.clearCanvas();
        this.ctx.drawImage(this.image, offsetX * 16 * zoom, offsetY * 16 * zoom, this.image.width * zoom, this.image.height * zoom);
    }

    getTileDatas(column, row) {
        let tileID = column + ((row - 1 )* this.gridWidth);
        let tileDatas = this.layout[tileID - 1];

        return tileDatas;
    }

    loadMap(mapName) {
        let mapData = require("./library/" + mapName + "_data.json");
        let mapImage = require("./library/" + mapName + "_image.png");

        this.image = new Image();
        this.image.src = mapImage;
        this.gridWidth = mapData.gridWidth;
        this.gridHeight = mapData.gridHeight;
        this.layout = this.buildLayout(mapData.layout);
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
        this.actor = null;
    }
}

export {Map};