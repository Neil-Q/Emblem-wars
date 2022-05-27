class Pointer {
    constructor(game) {
        this.game = game;
        this.zoom = game.zoom;

        this.mouseX = undefined;
        this.mouseY = undefined;

        this.mapX = undefined;
        this.mapY = undefined;
    }

    update(event) {

        //Empêche les valeures negatives lorsque la sourie est sur les bords haut et gauche
        event.offsetX > 0 ? this.mouseX = event.offsetX : this.mouseX = 1;
        event.offsetY > 0 ? this.mouseY = event.offsetY : this.mouseY = 1;

        let currentGridX = Math.ceil(this.mouseX / (16 * this.zoom));
        let currentGridY = Math.ceil(this.mouseY / (16 * this.zoom));

        // Si on change de case
        if (currentGridX != this.mapX || currentGridY != this.mapY) this.moveCursor(currentGridX, currentGridY);
    }

    moveCursor(mapX, mapY) {
        this.mapX = mapX;
        this.mapY = mapY;

        this.game.ui_manager.updateMapCursorPosition(this.mapX, this.mapY)
        this.game.fire("cursorMove");
    }

    moveCursorDown() {
        let mapX = this.mapX;
        let mapY = this.mapY + 1 ;

        if (mapY <= this.game.map.gridHeight) this.moveCursor(mapX, mapY);
    }

    moveCursorLeft() {
        let mapX = this.mapX - 1;
        let mapY = this.mapY;

        if (mapX >= 1) this.moveCursor(mapX, mapY);
    }

    moveCursorRight() {
        let mapX = this.mapX + 1;
        let mapY = this.mapY;

        if (mapX <= this.game.map.gridWidth) this.moveCursor(mapX, mapY);
    }

    moveCursorUp() {
        let mapX = this.mapX;
        let mapY = this.mapY - 1 ;

        if (mapY >= 1) this.moveCursor(mapX, mapY);
    }
}

export {Pointer}