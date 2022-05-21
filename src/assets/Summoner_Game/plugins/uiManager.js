import { Map_action_choice_menu }   from "../entities/ui/map_action_choice_menu.js"
import { Map_cursor }               from "../entities/ui/map_cursor.js"
import { Tile_infos_panel }         from "../entities/ui/tile_infos_panel.js"
import { Turn_indicator }           from "../entities/ui/turn_indicator.js"

class Ui_manager {
    constructor(game) {
        this.game = game;

        this.items = {
            map_cursor : new Map_cursor(),
            tile_infos_panel : new Tile_infos_panel(),
            turn_indicator : new Turn_indicator()
        };

        this.menus = {
            map_action_choice : new Map_action_choice_menu(this.game, this),
        }

        this.itemsToRender = {
            mapCursor : true,
            tileInfosPanel : true,
            turnIndicator : true,

            mapActionChoiceMenu : false
        }

        this.currentMenu = null;
    }

    closeMapActionChoiceMenu() {
        this.itemsToRender.mapActionChoiceMenu = false;
        this.currentMenu = null;
    }

    fire(event, datas) {

        if (!this.currentMenu) return

        let menu = undefined;

        switch (this.currentMenu) {
            case "mapActionChoiceMenu" :
                menu = this.menus.map_action_choice
                break;
        }

        return menu.fire(event, datas);
    }

    lockMapCursorPosition() {
        this.items.map_cursor.lockPosition();
    }

    openMapActionChoiceMenu(mapX, mapY, attack = false, harmonize = false) {
        this.menus.map_action_choice.build(mapX, mapY, attack, harmonize);
        this.itemsToRender.mapActionChoiceMenu = true;
        this.currentMenu = "mapActionChoiceMenu";
    }

    render(ctx, zoom) {
        if(this.itemsToRender.mapCursor) this.items.map_cursor.render(ctx, zoom);
        if(this.itemsToRender.tileInfosPanel) this.renderTileInfosPanel(ctx, zoom);
        if(this.itemsToRender.turnIndicator) this.renderTurnIndicator(ctx, zoom);
        
        if(this.itemsToRender.mapActionChoiceMenu) this.menus.map_action_choice.render(ctx, zoom);
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

    unlockMapCursorPosition() {
        this.items.map_cursor.unlockPosition();
    }

    updateMapCursorPosition(mapX, mapY) {
        this.items.map_cursor.updatePosition(mapX, mapY);
    }
}

export {Ui_manager}