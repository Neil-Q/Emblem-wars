import { Sprites_renderer } from "./sprites_renderer.js"

class Renderer {
    constructor(game) {
        this.game = game;
        this.canvas = this.game.canvas;
        this.ctx = this.canvas.getContext("2d");
    
        this.sprites_renderer = new Sprites_renderer(game);
        this.zoom = game.zoom;

        this.extraLayers = {
            pathfinder : false
        };

        this.ctx.imageSmoothingEnabled = false;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    hideLayer(layer) {
        this.setLayerVisiblity(layer, false)
        
    }

    renderUnitsOnMap() {
        let units = this.game.units_manager.getAllUnitsTypeAndPosition();

        units.forEach( unit => {
            this.sprites_renderer.renderUnit(unit);
        })

    }

    render() {
        this.clearCanvas();

        this.game.map.render(this.ctx, this.zoom);
        this.game.map.pathfinder.renderTrackedEnemiesReach(this.ctx, this.zoom);
        if(this.extraLayers.pathfinder) this.game.map.pathfinder.renderCurrentPathMap(this.ctx, this.zoom);
        //this.game.units_manager.renderUnits(this.ctx, this.zoom);
        this.renderUnitsOnMap();
        this.game.ui_manager.render(this.ctx, this.zoom);

        window.requestAnimationFrame(this.render.bind(this));
    }

    showLayer(layer) {
        this.setLayerVisiblity(layer, true)
    }

    setLayerVisiblity(layer, isVisible) {
        switch (layer) {
            case "pathfinder" :
                this.extraLayers.pathfinder = isVisible;
                break;
            default :
                console.log("No layer found");
        }
    }
}

export {Renderer}