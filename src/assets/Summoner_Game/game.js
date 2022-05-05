import { Inputs_manager }   from "./plugins/inputsManager.js";
import { Map }              from "./plugins/map.js";
import { Pointer }          from "./plugins/pointer.js";
import { Renderer }         from "./plugins/renderer.js";
import { Teams_manager }    from "./plugins/teamsManager.js";
import { Turns_manager }    from "./plugins/turnsManager.js";
import { Ui_manager }       from "./plugins/uiManager.js";
import { Units_manager }    from "./plugins/unitsManager.js";

class Game {
    constructor() {
        this.location = undefined;
        this.zoom = 3;

        this.renderer = undefined;
        this.canvas = undefined;
        this.pointer = new Pointer(this);
        this.teams_manager = new Teams_manager();
        this.ui_manager = new Ui_manager(this);
        this.units_manager = new Units_manager(this);
        this.turns_manager = new Turns_manager(this);
        this.map = undefined;

        this.states = [
            new Game_state_map(this),                    // 0
            new Game_state_unitSelected(this)            // 1
        ]
        this.currentState = this.states[0];
    }

    createCanvas() {
        let newCanvas = document.createElement("canvas");
    
        newCanvas.height = this.location.offsetHeight;
        newCanvas.width = this.location.offsetWidth;
    
        newCanvas.style.position = "absolute";
        newCanvas.style.top = "0";
        newCanvas.style.left = "0";
        newCanvas.style.height = this.location.offsetHeight.toString() + "px";
        newCanvas.style.width = this.location.offsetWidth.toString() + "px";
        
        this.location.appendChild(newCanvas);
        this.canvas = newCanvas;
    }

    fire(event) {
        this.currentState.fire(event);
    }

    launch(location) {
        window.summonerGame = this;

        this.location = location;
        this.createCanvas();

        this.renderer = new Renderer(this);
        this.map = new Map(this);

        this.map.image.onload = () => {
            this.map.showMap();
        }

        //this.map.image.onload = this.renderer.render();
        this.map.loadMap("map_01");

        this.units_manager.addUnit(0, 15, 11, 100);
        this.units_manager.addUnit(0, 16, 8, 50);
        this.units_manager.addUnit(0, 13, 8, 70);
        this.units_manager.addUnit(1, 22, 10, 100);
        this.units_manager.addUnit(1, 22, 8, 50);
        this.units_manager.addUnit(1, 20, 5, 60);

        let inputsManager = new Inputs_manager(this);
        inputsManager.listen();

        console.log(this);
        this.renderer.render();

        let TestEvent = {
            name : "TestEvent 1",
            timeout : 100,
            fire : function() {
                console.log(this.name);
            }
        }

        this.turns_manager.addEventToline(TestEvent);
        this.turns_manager.nextTurn();
    }

    nextTurn() {
        this.turns_manager.nextTurn();
    }

    setState(state) {
        this.currentState.quit()

        switch(state) {
            case "Map" : {
                this.currentState = this.states[0];
                break;
            }

            case "Unit_Selected" : {
                this.currentState = this.states[1];
                break;
            }

            default : {
                console.log("Game state not found");
            }
        }

        this.currentState.enter();
    }
}

/**
 * GAME STATES ------------------------------------------------------------------
 */

class Game_state_map {
    constructor(game) {
        this.game = game;
    }

    clicked() {
        let unitId = this.game.units_manager.findUnitFromPosition(this.game.pointer.mapX, this.game.pointer.mapY);

        if (unitId) {
            this.game.units_manager.selectUnit(unitId);
            this.game.setState("Unit_Selected");
            return
        }
    }

    enter() {

    }

    fire(event) {
        switch (event) {
            case "click" :                
                this.clicked()
                break;
            case "space" :
                this.game.nextTurn();
                break;
        }
    }

    quit() {

    }
}

class Game_state_unitSelected {
    constructor(game) {
        this.game = game;
        this.selectedUnitDatas = null;
    }

    clicked() {
        let mapX = this.game.pointer.mapX;
        let mapY = this.game.pointer.mapY;

        // Si on reclic sur l'unité selectionnée alors on la déselectionne et on retourne sur la map
        if (mapX == this.game.units_manager.selectedUnit.posX && mapY == this.game.units_manager.selectedUnit.posY) {
            this.game.units_manager.unselectUnit()

            this.game.setState("Map");
        }
   
        // On vérifie que c'est à son équipe de jouer
        if (this.game.turns_manager.getTeamTurn() != this.selectedUnitDatas.team) return console.log("You can't play ennemy units");

        // On verifie que l'unité est prête à faire une action
        if (!this.game.turns_manager.isReady(this.selectedUnitDatas.id)) return console.log("this unit is not ready to play yet");

        // Si on clic sur une case sur laquelle l'unité peut bouger alors on l'y déplace
        if (!this.game.map.pathfinder.checkIfCanMoveHere(mapX, mapY)) return console.log("Unit can not move here");

        // L'unité peut donc bouger à l'emplacement séléctionné alors on la déplace on retourne sur la map
        else {
            this.game.units_manager.moveUnitTo(mapX, mapY);
            this.game.turns_manager.returnToWaitingline(this.selectedUnitDatas.id);
            this.game.units_manager.unselectUnit();

            this.game.setState("Map");
        }
    }

    enter() {
        this.selectedUnitDatas = this.game.units_manager.getSelectedUnitDatas();
        this.game.map.pathfinder.setNewPathMap(this.selectedUnitDatas.id);
        this.game.renderer.showLayer("pathfinder");
    }

    fire(event) {
        switch (event) {
            case "click" :                
                this.clicked()
                break;    
        }
    }

    quit() {
        this.game.map.pathfinder.resetPathMap();
        this.game.renderer.hideLayer("pathfinder");
    }
}



export {Game};