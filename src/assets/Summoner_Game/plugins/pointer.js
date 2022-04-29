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
        if (currentGridX != this.mapX || currentGridY != this.mapY) {
            this.mapX = currentGridX;
            this.mapY = currentGridY;
        }
    }
}

export {Pointer}