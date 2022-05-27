import { Colorizer }        from "./plugins/colorizer.js";
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
        this.colorizer = new Colorizer();
        this.pointer = new Pointer(this);
        this.teams_manager = new Teams_manager();
        this.ui_manager = new Ui_manager(this);
        this.units_manager = new Units_manager(this);
        this.turns_manager = new Turns_manager(this);
        this.map = undefined;

        this.states = [
            new Game_state_map(this),                   // 0  
            new Game_state_unitSelected(this),          // 1     
            new Game_state_unitMoving(this),            // 2
            new Game_state_UnitReadyToAttack(this),     // 3
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

        switch(event) {
            case "arrowDown" :
                this.pointer.moveCursorDown();
                break;
            
            case "arrowLeft" :
                this.pointer.moveCursorLeft();
                break;
            
            case "arrowRight" :
                this.pointer.moveCursorRight();
                break;

            case "arrowUp" :
                this.pointer.moveCursorUp();
                break;
            default :
                //console.log(event);
        }
    
        
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

        this.units_manager.createUnit(1, "guard", 1, 1, 1, 15, 11);
        this.units_manager.createUnit(1, "guard", 2, 1, 1, 16, 8);
        this.units_manager.createUnit(1, "warrior", 1, 1, 1, 13, 8);
        this.units_manager.createUnit(2, "warrior", 2, 1, 1, 22, 10);
        this.units_manager.createUnit(2, "swordsman", 1, 1, 1, 22, 8);
        this.units_manager.createUnit(2, "swordsman", 2, 1, 1, 20, 5);
        this.units_manager.createUnit(3, "soldier", 1, 1, 1, 6, 11);
        this.units_manager.createUnit(3, "soldier", 2, 1, 1, 7, 6);

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

            case "Unit_Ready_To_Attack" : {
                this.currentState = this.states[3];
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

    enter() {
    }

    fire(event) {
        switch (event) {
            case "a_down" :
            case "mousedown" :                
                this.mouseDown();
                break;

            case "space" :
                this.game.nextTurn();
                break;

            default :
                this.game.fireDefault(event);
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

    cursorMove() {
        this.game.map.pathfinder.calculatePath(this.game.pointer.mapX, this.game.pointer.mapY);
    }

    enter() {
        this.selectedUnitDatas = this.game.units_manager.getSelectedUnitDatas();
        this.game.map.pathfinder.setNewPathMap(this.selectedUnitDatas.id);
        this.game.renderer.showLayer("pathfinder");

        this.selectedUnitCanPlay = true;
        if (this.selectedUnitDatas.team !== this.game.turns_manager.getTeamTurn()) this.selectedUnitCanPlay = false;
        if (!this.game.turns_manager.isReady(this.selectedUnitDatas.id)) this.selectedUnitCanPlay = false;
    }

    goBack() {
        this.game.units_manager.unselectUnit();
        this.game.map.pathfinder.clearPath();
        this.game.setState("Map");
    }

    fire(event) {
        switch (event) {
            case "a" :
            case "click" :                
                this.clicked();
                break;

            case "cursorMove" :
                this.cursorMove();
                break;

            case "escape" :
            case "rightClick" :
                this.goBack() ;
                break;

            case "a_up" :
            case "mouseUp" :
                this.mouseUp();
                break;

            default :
                this.game.fireDefault(event);
        }
    }

    mouseUp() {
        if (this.selectedUnitCanPlay == true) return
        this.goBack();
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

        this.enemiesAtRange = [];
        this.alliesAtRange = []
    }

    attack() {
        let self = this;
        let datas = {
            enemiesAtRange : self.enemiesAtRange
        };
        this.game.setState("Unit_Ready_To_Attack", datas);
    }

    enter(datas) {
        this.selectedUnitDatas = this.game.units_manager.getSelectedUnitDatas();

        if(datas) {
            this.targetMapX = datas.targetMapX;
            this.targetMapY = datas.targetMapY;
        }

        this.game.map.pathfinder.setNewReachMap(this.targetMapX, this.targetMapY);
        this.game.renderer.showLayer("pathfinder");
        
        this.game.ui_manager.lockMapCursorPosition();

        // On verifie cherche les unités à porté
        let haveEnemyInReach = false;
        //let haveAllyInReach = false;

        this.enemiesAtRange = [];
        this.alliesAtRange = [];

        let tilesInReach = this.game.map.pathfinder.getAttackableTiles();
        let hero = this.selectedUnitDatas;
        let game = this.game;

        tilesInReach.forEach( tile => {
            let unit = game.units_manager.findUnitFromPosition(tile[0], tile[1]);
            if (!unit) return;

            unit = game.units_manager.getUnitDatas(unit);

            if (unit.team == hero.team) {
                //haveAllyInReach = true;
                this.alliesAtRange.push(unit);
                
                return;
            }
            
            haveEnemyInReach = true;
            this.enemiesAtRange.push(unit);
        })

        this.game.ui_manager.openMapActionChoiceMenu(this.targetMapX, this.targetMapY, haveEnemyInReach);
    }

    fire(event) {
        switch (event) {
            case "attack" :
                this.attack();
                break;

            case "escape" :
            case "rightClick" :
                this.goBack();
                break;

            case "wait" :
                this.wait()
                break;
        }
    }

    goBack() {
        this.game.map.pathfinder.clearPath();
        this.game.setState("Unit_Selected");
    }
    
    quit() {
        
        this.game.map.pathfinder.resetPathMap();
        this.game.renderer.hideLayer("pathfinder");       
        this.game.ui_manager.unlockMapCursorPosition();
        this.game.ui_manager.closeMapActionChoiceMenu();
    }

    wait() {
        this.game.units_manager.moveUnitTo(this.targetMapX, this.targetMapY, this.selectedUnitDatas.id);
        this.game.turns_manager.returnToWaitingline(this.selectedUnitDatas.id);
        this.game.map.pathfinder.clearPath();
        this.game.setState("Map");
    }
}

class Game_state_UnitReadyToAttack {
    constructor(game) {
        this.game = game;
        
        this.mapX = undefined;
        this.mapY = undefined;

        this.selectedUnitDatas = undefined;
        this.attackableUnits = [];

        this.currentTarget = undefined;
    }

    cursorMove() {
        let targetedUnit = this.attackableUnits.find( unit => unit.posX == this.game.pointer.mapX && unit.posY == this.game.pointer.mapY);

        if (!targetedUnit) {
            this.game.ui_manager.close("fight_stats_panel");
            this.game.ui_manager.items.map_cursor.changeType(0);
            return
        }
        
        this.game.ui_manager.items.map_cursor.changeType(1);
        let self = this;
        let datas = {
            attacker : self.selectedUnitDatas,
            defender : targetedUnit
        }
        this.game.ui_manager.open("fight_stats_panel", datas);
    }

    enter(datas) {
        this.mapX = datas.mapX;
        this.mapY = datas.mapY;

        this.selectedUnitDatas = this.game.units_manager.getSelectedUnitDatas();

        this.attackableUnits = datas.enemiesAtRange;
        console.log(this.attackableUnits);
    }

    fire(event) {
        switch (event) {
            
            case "cursorMove" :
                this.cursorMove()
                break;

            case "escape" :
            case "rightClick" :
                this.goBack();
                break;

            default :
                this.game.fireDefault(event);
                break;
        }
    }

    goBack() {
        this.game.setState("Unit_Moving");
    }

    quit() {

    }

}

export {Game};