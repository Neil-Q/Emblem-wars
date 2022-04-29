class Map_cursor {
    constructor() {
        this.color = "rgba(0, 0, 255, 0.8)";
        this.width = 4;
        this.baseSize = 16;
    }

    render(ctx, zoom, posX, posY, color = this.color) {
        let xOrigin = (posX - 1) * this.baseSize * zoom;
        let yOrigin = (posY - 1) * this.baseSize * zoom;

        let size = this.baseSize * zoom - 4

        ctx.strokeStyle = color;
        ctx.lineWidth = this.width;
        ctx.strokeRect(xOrigin + 2, yOrigin + 2, size, size);
    }
}

export {Map_cursor}