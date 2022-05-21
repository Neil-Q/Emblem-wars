class Map_cursor {
    constructor() {
        this.color = "rgba(0, 0, 255, 0.8)";
        this.width = 4;
        this.baseSize = 16;

        this.mapX = undefined;
        this.mapY = undefined;

        this.locked = false;
    }

    lockPosition() {
        this.locked = true;
    }

    render(ctx, zoom, color = this.color) {
        let xOrigin = (this.mapX - 1) * this.baseSize * zoom;
        let yOrigin = (this.mapY - 1) * this.baseSize * zoom;

        let size = this.baseSize * zoom - 4

        ctx.strokeStyle = color;
        ctx.lineWidth = this.width;
        ctx.strokeRect(xOrigin + 2, yOrigin + 2, size, size);
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