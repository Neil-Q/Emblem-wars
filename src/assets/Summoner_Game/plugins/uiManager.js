import { Map_cursor }           from "../entities/ui/map_cursor.js"
import { Tile_infos_panel }     from "../entities/ui/tile_infos_panel.js"

class Ui_manager {
    constructor(game) {
        this.game = game;

        this.items = {
            map_cursor : new Map_cursor(),
            tile_infos_panel : new Tile_infos_panel()
        };

        this.states = [
            new Ui_state_map(this)          //0
        ]
        this.currentState = this.states[0];
    }

    render(ctx, zoom) {
        this.currentState.render(ctx, zoom);
    }

    renderMapCursor(ctx, zoom) {
        let mapX = this.game.pointer.mapX;
        let mapY = this.game.pointer.mapY;

        this.items.map_cursor.render(ctx, zoom, mapX, mapY);
    }

    renderTileInfosPanel(ctx, zoom) {
        let tileDatas = this.game.map.getTileDatas();
        
        if(tileDatas) {
            let mouseX = this.game.pointer.mouseX;
            let canvasWidth = this.game.canvas.width;
            let canvasHeight = this.game.canvas.height;
            
            this.items.tile_infos_panel.render(ctx, zoom, tileDatas, mouseX, canvasWidth, canvasHeight);
        }
    }

}

/**
 * UI STATES
 */

/**
 * MAP STATE
 */

class Ui_state_map {
    constructor(manager) {
        this.manager = manager;
    }

    render(ctx, zoom) {
        this.manager.renderMapCursor(ctx, zoom);
        this.manager.renderTileInfosPanel(ctx, zoom);
    }
}

export {Ui_manager}