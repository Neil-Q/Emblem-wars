class Ui {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCursor(column, row, zoom) {
        let tileSize = zoom * 16;
        let xOrigin = (column - 1) * tileSize;
        let yOrigin = (row - 1) * tileSize;

        /*this.ctx.fillStyle = "rgba(0, 0, 255, 0.2)"
        this.ctx.fillRect(xOrigin, yOrigin, tileSize, tileSize);*/
        this.ctx.strokeStyle = "rgba(0, 0, 255, 0.8)";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(xOrigin, yOrigin, tileSize, tileSize);
    }

    drawTileInfos(tileDatas, mouseX) {
        
        let xOrigin = mouseX < (this.canvas.width / 2) ? (this.canvas.width - 200) : 8;
        let yOrigin = this.canvas.height - 200
        
        // Dessine le fond du cadre
        this.ctx.fillStyle = "rgba(255, 230, 230, 0.8)"
        this.ctx.fillRect(xOrigin, yOrigin, 192, 192);

        // Dessine le nom du type de case
        this.ctx.fillStyle = "rgb(0, 0, 230)"
        this.ctx.fillRect(xOrigin + 4 , yOrigin + 4 , 184, 80);

        this.ctx.fillStyle = "rgba(255, 230, 230, 0.8)"
        this.ctx.font = "36px arial";
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(tileDatas.name, xOrigin + 96, yOrigin + 44);

        //Dessine les informations

        this.ctx.fillStyle = this.ctx.fillStyle = "rgb(0, 0, 230)"
        this.ctx.font = "24px arial";
        this.ctx.textAlign = "left"
        this.ctx.textBaseline = "baseline";
        this.ctx.fillText("DEF : " + tileDatas.bonusDef, xOrigin + 20, yOrigin + 115);
        this.ctx.fillText("ESQ : " + tileDatas.bonusDodge, xOrigin + 20, yOrigin + 165);

        //console.log(tileDatas);
    }
}

export {Ui}