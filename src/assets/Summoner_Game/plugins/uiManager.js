import { Map_cursor }           from "../entities/ui/map_cursor.js"
import { Tile_infos_panel }     from "../entities/ui/tile_infos_panel.js"
import { Turn_indicator }       from "../entities/ui/turn_indicator.js"

class Ui_manager {
    constructor(game) {
        this.game = game;

        this.items = {
            map_cursor : new Map_cursor(),
            tile_infos_panel : new Tile_infos_panel(),
            turn_indicator : new Turn_indicator()
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

        if(!tileDatas) return

        let mouseX = this.game.pointer.mouseX;
        let canvasWidth = this.game.canvas.width;
        let canvasHeight = this.game.canvas.height;
        let color = this.game.teams_manager.getTeamColor(this.game.turns_manager.getTeamTurn());
              
        this.items.tile_infos_panel.render(ctx, zoom, tileDatas, mouseX, canvasWidth, canvasHeight, color);
    }

    renderTurnIndicator(ctx, zoom) {
        let teamTurn = this.game.turns_manager.getTeamTurn();
        let teamName = this.game.teams_manager.getTeamName(teamTurn);
        let teamColor = this.game.teams_manager.getTeamColor(teamTurn);

        let mouseX = this.game.pointer.mouseX;
        let mouseY = this.game.pointer.mouseY;

        let canvasWidth = this.game.canvas.width;
        let canvasHeight = this.game.canvas.height;

        this.items.turn_indicator.render(ctx, zoom, teamName, teamColor, mouseX, mouseY, canvasWidth, canvasHeight);
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
        this.manager.renderTurnIndicator(ctx, zoom);
    }
}

export {Ui_manager}