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
            new Game_state_map(this),               // 0  
            new Game_state_unitSelected(this),      // 1     
            new Game_state_unitMoving(this),        // 2
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

    fire(event, datas) {
        // On envoie d'abord l'événement au gestionnaire de menus
        let menuAction = this.ui_manager.fire(event, datas);

        // Si un menu à utilisé l'événement et renvoie "true" alors on stop la propagation de l'événement
        if (menuAction === true) return;

        // Sinon c'est l'état global qui prend en charge l'événement
        this.currentState.fire(event, datas);
    }

    fireDefault(event) {
        console.log(event);
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

        this.map.loadMap("map_01");

        this.units_manager.createUnit(0, "guard", 1, 1, 1, 15, 11);
        this.units_manager.createUnit(0, "guard", 2, 1, 1, 16, 8);
        this.units_manager.createUnit(0, "warrior", 1, 1, 1, 13, 8);
        this.units_manager.createUnit(0, "warrior", 2, 1, 1, 22, 10);
        this.units_manager.createUnit(1, "swordsman", 1, 1, 1, 22, 8);
        this.units_manager.createUnit(1, "swordsman", 2, 1, 1, 20, 5);
        this.units_manager.createUnit(1, "soldier", 1, 1, 1, 7, 9);
        this.units_manager.createUnit(1, "soldier", 2, 1, 1, 7, 6);

        let inputsManager = new Inputs_manager(this);
        inputsManager.listen();

        console.log(this);
        this.renderer.render();

        let TestEvent = {
            name : "TestEvent 1",
            timeout : 200,
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

    setState(state, datas = null) {
        this.currentState.quit()

        switch(state) {
            case "Map" : {
                this.currentState = this.states[0];
                break;
            }

            case "Unit_Moving" : {
                this.currentState = this.states[2];
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

        this.currentState.enter(datas);
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
       
    }

    enter() {
    }

    fire(event) {
        switch (event) {
            case "click" :                
                this.clicked();
                break;
            case "mousedown" :                
                this.mouseDown();
                break;
            case "mouseup" :                
                this.mouseUp();
                break;
            case "space" :
                this.game.nextTurn();
                break;
        }
    }

    mouseDown() {
        let unitId = this.game.units_manager.findUnitFromPosition(this.game.pointer.mapX, this.game.pointer.mapY);
        
        if (unitId) {
                this.game.units_manager.selectUnit(unitId);
                this.game.setState("Unit_Selected");
                return
        }
    }

    mouseUp() {

    }

    quit() {
    }
}

class Game_state_unitSelected {
    constructor(game) {
        this.game = game;
        this.selectedUnitDatas = null;
        this.selectedUnitCanPlay = true;
    }

    clicked() {
        let mapX = this.game.pointer.mapX;
        let mapY = this.game.pointer.mapY;

        // Si on clic sur une case sur laquelle l'unité peut bouger alors on l'y déplace
        if (this.game.map.pathfinder.checkIfCanMoveHere(mapX, mapY)) {
            let datas = {
                selectedUnitDatas : this.selectedUnitDatas,
                targetMapX : mapX,
                targetMapY : mapY
            }
            this.game.setState("Unit_Moving", datas);
        }
    }

    enter() {
        this.selectedUnitDatas = this.game.units_manager.getSelectedUnitDatas();
        this.game.map.pathfinder.setNewPathMap(this.selectedUnitDatas.id);
        this.game.renderer.showLayer("pathfinder");

        this.selectedUnitCanPlay = true;
        if (this.selectedUnitDatas.team !== this.game.turns_manager.getTeamTurn()) this.selectedUnitCanPlay = false;
        if (!this.game.turns_manager.isReady(this.selectedUnitDatas.id)) this.selectedUnitCanPlay = false;
    }

    escape() {
        this.game.units_manager.unselectUnit()
        this.game.setState("Map");
    }

    fire(event) {
        switch (event) {
            case "click" :                
                this.clicked();
                break;  
            case "escape" :
                this.escape() ;
                break;
            case "mouseUp" :
                this.mouseUp();
                break;
            case "rightClick" :
                this.rightClick();
                break;
            default :
                this.game.fireDefault(event);
        }
    }

    mouseUp() {
        if (this.selectedUnitCanPlay == true) return
        this.escape();
    }

    rightClick() {
        this.escape();
    }

    quit() {
        this.game.map.pathfinder.resetPathMap();
        this.game.renderer.hideLayer("pathfinder");
    }
}

class Game_state_unitMoving {
    constructor(game) {
        this.game = game;

        this.selectedUnitDatas = undefined
        this.targetMapX = undefined;
        this.targetMapY = undefined;
    }

    clicked() {
        this.game.turns_manager.returnToWaitingline(this.selectedUnitDatas.id);
        this.game.units_manager.unselectUnit();

        this.game.setState("Map");
    }

    enter(datas) {
        this.selectedUnitDatas = datas.selectedUnitDatas;
        this.targetMapX = datas.targetMapX;
        this.targetMapY = datas.targetMapY;

        this.game.map.pathfinder.setNewReachMap(this.targetMapX, this.targetMapY);
        this.game.renderer.showLayer("pathfinder");
        
        this.game.ui_manager.lockMapCursorPosition();

        // On verifie si un ennemie est à portée
        let haveEnemyInReach = false;
        let tilesInReach = this.game.map.pathfinder.getAttackableTiles();
        let hero = this.selectedUnitDatas;
        let game = this.game;
        console.log(haveEnemyInReach);

        function checkForEnemyInReach(tile) {
            let unit = game.units_manager.findUnitFromPosition(tile[0], tile[1]);
            if (!unit) return true;

            unit = game.units_manager.getUnitDatas(unit);

            if (unit.team == hero.team) return true;
            haveEnemyInReach = true;
            return false;
        }
        tilesInReach.every(checkForEnemyInReach);

        this.game.ui_manager.openMapActionChoiceMenu(this.targetMapX, this.targetMapY, haveEnemyInReach);
    }

    fire(event) {
        switch (event) {
            case "click" :                
                this.clicked();
                break;  
            case "escape" :
                this.escape() ;
                break;
            case "rightClick" :
                this.escape();
                break;
            case "wait" :
                this.wait()
                break;
        }
    }

    escape() {
        this.game.setState("Unit_Selected");
    }

    quit() {
        this.game.ui_manager.unlockMapCursorPosition();

        this.game.map.pathfinder.resetPathMap();
        this.game.renderer.hideLayer("pathfinder");

        this.game.ui_manager.closeMapActionChoiceMenu();
    }

    wait() {
        this.game.units_manager.moveUnitTo(this.targetMapX, this.targetMapY, this.selectedUnitDatas.id);
        this.game.turns_manager.returnToWaitingline(this.selectedUnitDatas.id);
        this.game.setState("Map");
    }
}



export {Game};