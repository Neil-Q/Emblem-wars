class Renderer {
    constructor(game) {
        this.game = game;
        this.canvas = this.game.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.zoom = game.zoom;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    render() {
        this.clearCanvas();

        this.game.map.render(this.ctx, this.zoom);
        this.game.units_manager.renderUnits(this.ctx, this.zoom);
        this.game.ui_manager.render(this.ctx, this.zoom);

        window.requestAnimationFrame(this.render.bind(this));
    }
}

export {Renderer}