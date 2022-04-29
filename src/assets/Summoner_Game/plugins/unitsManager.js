import { Base_unit } from "../entities/units/baseUnit.js";

class Units_manager {
    constructor(game) {
        this.game = game;

        this.unitsList = [];
        this.unitsCreated = 0;

        this.selectedUnit = null;
    }

    addUnit(team, posX, posY) {
        let newUnit = new Base_unit(this.unitsCreated + 1 , team, posX, posY);
        this.unitsCreated ++;

        this.unitsList.push(newUnit);
    }

    findUnitFromPosition(mapX, mapY) {
        let unit = this.unitsList.find((element => element.posX == mapX && element.posY == mapY));

        return unit ? unit.id : null;
    }

    findUnitFromId(id) {
        let unit = this.unitsList.find(element => element.id == id);

        return unit ? unit : null;
    }

    moveUnitTo(posX, posY, id = undefined) {
        let unit = undefined;
        id ? unit = this.findUnitFromId(id) : unit = this.selectedUnit;

        unit.moveTo(posX, posY);
    }

    renderUnits(ctx, zoom) {
        this.unitsList.forEach(unit => {
            let color = this.game.teams_manager.getColor(unit.team);
            unit.render(ctx, zoom, color);
        });
    }

    selectUnit(id) {
        let unit = this.unitsList.find(element => element.id == id);
        this.selectedUnit = unit;
        unit.setState("selected");
    }

    unselectUnit() {
        this.selectedUnit.setState("neutral");
        this.selectedUnit = null;
    }
}

export {Units_manager}