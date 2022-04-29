import { Inputs_manager }   from "./plugins/inputsManager.js";
import { Map }              from "./plugins/map.js";
import { Pointer }          from "./plugins/pointer.js";
import { Renderer }         from "./plugins/renderer.js";
import { Teams_manager }    from "./plugins/teamsManager.js";
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
            console.log(this);
            this.map.show();
        }

        //this.map.image.onload = this.renderer.render();
        this.map.loadMap("map_01");

        this.units_manager.addUnit(0, 15, 11);
        this.units_manager.addUnit(0, 16, 8);
        this.units_manager.addUnit(1, 22, 10);
        
        let inputsManager = new Inputs_manager(this);
        inputsManager.listen();

        console.log(this);
        this.renderer.render();
    }

    setState(state) {
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
    }
}

/**
 * GAME STATES
 */

/**
 * MAP STATE
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

    fire(event) {
        switch (event) {
            case "click" :                
                this.clicked()
                break;    
        }
    }
}

/**
 *  UNIT SELECTED STATE
 */

class Game_state_unitSelected {
    constructor(game) {
        this.game = game;
    }

    clicked() {
        let mapX = this.game.pointer.mapX;
        let mapY = this.game.pointer.mapY;

        // Si on reclic sur l'unité selectionnée alors on la déselectionne et on retourne sur la map
        if (mapX == this.game.units_manager.selectedUnit.posX && mapY == this.game.units_manager.selectedUnit.posY) {
            this.game.units_manager.unselectUnit()

            this.game.setState("Map");
        }

        // Sinon on verifie qu'on à cliqué sur une case sur laquelle une unité peut se déplacer
        else if (!this.game.map.checkIfMoveAble()) {
            console.log("Unit can't move on this terrain");
        }

        // On verifie que la case n'est pas déjà occupée
        else if (this.game.units_manager.findUnitFromPosition(mapX, mapY)) {
            console.log("Unit can't move here because tile is already occupied");
        }

        // L'unité peut donc bouger à l'emplacement séléctionné alors on la déplace on retourne sur la map
        else {
            this.game.units_manager.moveUnitTo(mapX, mapY);
            this.game.units_manager.unselectUnit()

            this.game.setState("Map");
        }
    }

    fire(event) {
        switch (event) {
            case "click" :                
                this.clicked()
                break;    
        }
    }
}



export {Game};