import { Base_unit } from "../entities/units/baseUnit.js";
//import { Units_factory } from "./unitsFactory.js";

class Units_manager {
    constructor(game) {
        this.game = game;
//        this.unit_factory = new Units_factory(game);

        this.unitsList = [];
        this.unitsCreated = 0;

        this.selectedUnit = null;
    }

    addUnit(team, posX, posY, speed) {
        let newUnit = new Base_unit(this.unitsCreated + 1 , team, posX, posY, speed);
        this.unitsCreated ++;

        this.unitsList.push(newUnit);
        this.game.turns_manager.addUnitToLine(newUnit.id, newUnit.team, newUnit.speed);
        this.game.renderer.sprites_renderer.loadMapSpriteSheet("guard", "blue");
        this.game.renderer.sprites_renderer.loadMapSpriteSheet("guard", "red");
    }

    /*createUnit(type, level, team, posX, posY) {


    }*/

    findUnitFromPosition(mapX, mapY) {
        let unit = this.unitsList.find((element => element.posX == mapX && element.posY == mapY));

        return unit ? unit.id : null;
    }

    findUnitFromId(id) {
        let unit = this.unitsList.find(element => element.id == id);

        return unit ? unit : null;
    }

    getAllUnitsSpeed() {
        let list = [];

        this.unitsList.forEach(unit => {
            list.push({id : unit.id, speed : unit.speed});
        });

        return list;
    }

    getAllUnitsTypeAndPosition() {
        let list = [];

        this.unitsList.forEach( unit => {
            let unitDatas = {
                id : unit.id,
                type : "guard",
                team : unit.team,
                posX : unit.posX,
                posY : unit.posY
            }

            list.push(unitDatas);
        })

        return list;
    }

    getNearbyUnits(unitId = this.selectedUnit.id, radius) {
        let mainUnit = this.findUnitFromId(unitId);

        let closeUnits = [];
        
        this.unitsList.forEach(unit => {
            if (unit.posX < mainUnit.posX - radius) return
            if (unit.posX > mainUnit.posX + radius) return
            if (unit.posY < mainUnit.posX - radius) return
            if (unit.posY < mainUnit.posX + radius) return

            let unitDatas = {
                id   : unit.id,
                posX : unit.posX,
                posY : unit.posY,
                team : unit.team
            }
            closeUnits.push(unitDatas);
        });

        return closeUnits;
    }

    getSelectedUnitDatas() {
        let datas = this.getUnitDatas(this.selectedUnit.id);
        return datas;
    }

    getSelectedUnitId() {
        return this.selectedUnit.id;
    }

    getUnitDatas(unitId) {
        let unit = this.findUnitFromId(unitId);

        let datas = {
            id :            unit.id,
            team :          unit.team,
            posX :          unit.posX,
            posY :          unit.posY,
            moveType :      unit.moveType ,
            moveDistance :  unit.moveDistance
        }

        return datas;
    }

    moveUnitTo(posX, posY, id = undefined) {
        let unit = undefined;
        id ? unit = this.findUnitFromId(id) : unit = this.selectedUnit;

        unit.moveTo(posX, posY);
    }
    
    selectUnit(id) {
        let unit = this.unitsList.find(element => element.id == id);
        this.selectedUnit = unit;
    }

    unselectUnit() {
        this.selectedUnit = null;
    }
}

export {Units_manager}