class Tile_infos_panel {
    constructor() {}

    render(ctx, zoom, tileDatas, mouseX, canvasWidth, canvasHeight, color) {
        let xOrigin = mouseX < (canvasWidth / 2) ? (canvasWidth - 200) : 8;
        let yOrigin = canvasHeight - (70*zoom);
        
        // Dessine le fond du cadre
        ctx.fillStyle = "rgba(255, 230, 230, 0.8)";
        ctx.fillRect(xOrigin, yOrigin, 192, 192);

        // Dessine le nom du type de case
        ctx.fillStyle = color;
        ctx.fillRect(xOrigin + 4 , yOrigin + 4 , 184, 80);

        ctx.fillStyle = "rgba(255, 230, 230, 0.8)"
        ctx.font = "36px arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tileDatas.name, xOrigin + 96, yOrigin + 44);

        //Dessine les informations    
        ctx.fillStyle = color;
        ctx.font = "24px arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "baseline";
        ctx.fillText("DEF : " + tileDatas.bonusDef, xOrigin + 20, yOrigin + 115);
        ctx.fillText("ESQ : " + tileDatas.bonusDodge, xOrigin + 20, yOrigin + 165);     
    }
}

export { Tile_infos_panel }