import { Fight_stats_panel }        from "../entities/ui/fight_stats_panel.js"
import { Map_action_choice_menu }   from "../entities/ui/map_action_choice_menu.js"
import { Map_cursor }               from "../entities/ui/map_cursor.js"
import { Tile_infos_panel }         from "../entities/ui/tile_infos_panel.js"
import { Turn_indicator }           from "../entities/ui/turn_indicator.js"

class Ui_manager {
    constructor(game) {
        this.game = game;

        // items and panels
        this.fight_stats_panel  = new Fight_stats_panel (this.game);
        this.map_cursor         = new Map_cursor(this.game);
        this.tile_infos_panel   = new Tile_infos_panel();
        this.turn_indicator     = new Turn_indicator();
        
        // menus
        this.map_action_choice_menu  = new Map_action_choice_menu(this.game, this);

        this.toRender = {

            // items and panels
            fight_stats_panel : false,
            mapCursor : true,
            tileInfosPanel : true,
            turnIndicator : true,

            // menus
            mapActionChoiceMenu : false
        }

        this.currentMenu = null;
    }

    closeMapActionChoiceMenu() {
        this.toRender.mapActionChoiceMenu = false;
        this.currentMenu = null;
    }

    close(panelOrMenuToOpen) {
        switch (panelOrMenuToOpen) {
            case "fight_stats_panel" :
                this.toRender.fight_stats_panel = false;
                break;
        }
    }

    fire(event, datas) {
        if (!this.currentMenu) return
        let menu = this.currentMenu;

        return menu.fire(event, datas);
    }

    lockMapCursorPosition(mapX = false, mapY = false) {
        this.map_cursor.lockPosition(mapX, mapY);
    }

    open(panelOrMenuToOpen, datas) {
        switch (panelOrMenuToOpen) {
            case "fight_stats_panel" :
                this.fight_stats_panel.build(datas.attacker, datas.defender);
                this.toRender.fight_stats_panel = true;
                break;
            
            case "map_action_choice_menu" :
                this.map_action_choice_menu.build(datas.mapX, datas.mapY, datas.attack, datas.wait);
                this.toRender.mapActionChoiceMenu = true;
                this.currentMenu = this.map_action_choice_menu;
                break;
        }
    }

    openMapActionChoiceMenu(mapX, mapY, attack = false, harmonize = false) {
        this.map_action_choice.build(mapX, mapY, attack, harmonize);
        this.toRender.mapActionChoiceMenu = true;
        this.currentMenu = "mapActionChoiceMenu";
    }

    render(ctx, zoom) {
        if(this.toRender.mapCursor) this.map_cursor.render(ctx, zoom);
        if(this.toRender.tileInfosPanel) this.renderTileInfosPanel(ctx, zoom);
        if(this.toRender.turnIndicator) this.renderTurnIndicator(ctx, zoom);
        if(this.toRender.fight_stats_panel) this.fight_stats_panel.render(ctx, zoom);
        
        if(this.toRender.mapActionChoiceMenu) this.map_action_choice_menu.render(ctx, zoom);
    }

    renderTileInfosPanel(ctx, zoom) {
        let tileDatas = this.game.map.getTileDatas();

        if(!tileDatas) return

        let mouseX = this.game.pointer.mouseX;
        let canvasWidth = this.game.canvas.width;
        let canvasHeight = this.game.canvas.height;
        let color = this.game.teams_manager.getTeamColor(this.game.turns_manager.getTeamTurn());
              
        this.tile_infos_panel.render(ctx, zoom, tileDatas, mouseX, canvasWidth, canvasHeight, color);
    }

    renderTurnIndicator(ctx, zoom) {
        let teamTurn = this.game.turns_manager.getTeamTurn();
        let teamName = this.game.teams_manager.getTeamName(teamTurn);
        let teamColor = this.game.teams_manager.getTeamColor(teamTurn);

        let mouseX = this.game.pointer.mouseX;
        let mouseY = this.game.pointer.mouseY;

        let canvasWidth = this.game.canvas.width;
        let canvasHeight = this.game.canvas.height;

        this.turn_indicator.render(ctx, zoom, teamName, teamColor, mouseX, mouseY, canvasWidth, canvasHeight);
    }

    unlockMapCursorPosition() {
        this.map_cursor.unlockPosition();
    }

    updateMapCursorPosition(mapX, mapY) {
        this.map_cursor.updatePosition(mapX, mapY);
    }
}

export {Ui_manager}