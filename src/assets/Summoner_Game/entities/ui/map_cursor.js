class Map_cursor {
    constructor(game) {
        this.game = game;
        this.builded = false;

        this.width = 4;

        this.spriteSheet = new Image;
        this.spriteSheet.onload = () => this.buildCursors();
        this.spriteSheet.src = require("./sprites/map_cursor.png");

        this.cursors = [];
        
        this.locked = false;

        this.mapX = undefined;
        this.mapY = undefined;

        this.duration = 500;
        this.start = null;

        this.form = 0;

    }

    async buildCursors() {
        this.spriteSheet = await this.game.colorizer.toTransparent(this.spriteSheet);

        for (let i = 1; i <= this.game.teams_manager.getNumberOfTeams(); i++) {
            let colorCode = this.game.teams_manager.getTeamColorCode(i);
            let colorizedCursor = await this.game.colorizer.colorize(this.spriteSheet, colorCode);
            this.cursors.push(colorizedCursor);
        }

        this.builded = true;
    }

    changeType(type) {
        this.form = type;
    }

    lockPosition() {
        this.locked = true;
    }

    render(ctx, zoom) {
        if (!this.builded) return
        if (this.start == null) this.start = Date.now();

        let xOrigin = (this.mapX - 1) * 16 * zoom - (4 * zoom);
        let yOrigin = (this.mapY - 1) * 16 * zoom - (4 * zoom);

        let team = this.game.turns_manager.getTeamTurn();
        let phase = Math.floor(((Date.now() - this.start) % this.duration) / (this.duration / 4));
        
        let spriteX = this.form * 75;
        spriteX += phase * 25;
        let spriteY = 0;
        
        if(phase == 3) spriteX -= 25;
        
        ctx.drawImage(this.cursors[team - 1], spriteX, spriteY, 23, 23, xOrigin, yOrigin, 23 * zoom, 23 * zoom);
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