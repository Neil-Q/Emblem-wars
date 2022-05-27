class Map_cursor {
    constructor(game) {
        this.game = game;
        this.width = 4;

        this.spriteSheet = new Image;
        this.spriteSheet.src = require("./sprites/map_cursor.png");
        
        this.locked = false;

        this.mapX = undefined;
        this.mapY = undefined;

        this.duration = 500;
        this.start = null;

        this.form = 0;
    }

    changeType(type) {
        this.form = type;
    }

    lockPosition() {
        this.locked = true;
    }

    render(ctx, zoom) {
        if (this.start == null) this.start = Date.now();

        let xOrigin = (this.mapX - 1) * 16 * zoom - (4 * zoom);
        let yOrigin = (this.mapY - 1) * 16 * zoom - (4 * zoom);

        let color = this.game.teams_manager.getTeamColorCode(this.game.turns_manager.getTeamTurn());

        let phase = Math.floor(((Date.now() - this.start) % this.duration) / (this.duration / 4));

        let spriteX = this.form * 75;
        spriteX += phase * 25;

        if(phase == 3) spriteX -= 25;

        let spriteY = 0;

        switch(color) {
            case "blue" :
                spriteY = 0;
                break;
            case "red"  :
                spriteY = 25;
                break;
        }

        ctx.drawImage(this.spriteSheet, spriteX, spriteY, 23, 23, xOrigin, yOrigin, 23 * zoom, 23 * zoom);
    }

    unlockPosition() {
        this.locked = false
    }

    updatePosition(mapX, mapY) {
        if(this.locked) return

        this.mapX = mapX;
        this.mapY = mapY;
    }
}

export {Map_cursor}