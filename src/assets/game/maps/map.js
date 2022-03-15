class Map {
    constructor(canvas) {
        this.image = undefined;
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
                buildedLayout.push(tileProperties);
            }
            else {
                errors ++
                let yError = Math.ceil((i + 1) / this.gridWidth);
                let xError = (i + 1) % this.gridWidth;
                console.log("Tileset non trouvé aux coordonnées x:" + xError + " / y:" + yError);

                buildedLayout.push(tilesetsLibrary.find(element => element.id == "error"));
            }
        }

        if (errors == 0) {
            console.log("Map succesfully builded");
        }

        return buildedLayout;
    }

    drawMap() {
        this.ctx.drawImage(this.image, 0, 0, this.image.width * 3, this.image.height * 3);
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

export {Map};