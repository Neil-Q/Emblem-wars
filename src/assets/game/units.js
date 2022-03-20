class Unit {
    constructor(id, team, posX, posY, maxHp, attack, defense, precision, dodge, critic, luck, speed, move) {
        this.id = id;
        this.team = team;
        this.posX = posX;
        this.posY = posY;
        this.state = null; // null / hover / selected 

        this.maxHp = maxHp; //base 20
        this.attack = attack; // base 15
        this.defense = defense; // base 5
        this.precision = precision; // base 110
        this.dodge = dodge; // base 20
        this.critic = critic; // base 10
        this.luck = luck; // base 5
        this.speed = speed; // base 100
        this.moove = move; //base 8
    }

    draw(ctx, zoom, color) {
        let posY = this.posY * 16 * zoom - (8 * zoom);
        let posX = this.posX * 16 * zoom - (8 * zoom);
        let radius = 15 * zoom / 2;
        
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(posX, posY , radius, 0, 2 * Math.PI);
        ctx.fill();

        if (this.state == "selected") {
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fill();

            console.log("unité selectionnée");
        }
    }

    moveTo(x, y) {
        this.posX = x;
        this.posY = y;
    }
}

class UnitsManager {
    constructor(canvas, teams) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.unitsList = [];
        this.teams = teams;
        this.unitsCreated = 0;
        this.selectedUnit = null; //id
    }

    addUnit(team, posX, posY, maxHp, attack, defense, precision, dodge, critic, luck, speed, move) {
        let newUnit = new Unit(this.unitsCreated + 1 , team, posX, posY, maxHp, attack, defense, precision, dodge, critic, luck, speed, move);
        this.unitsCreated ++;

        this.unitsList.push(newUnit);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawUnits(zoom) {
        this.clearCanvas();

        this.unitsList.forEach(unit => {
            unit.draw(this.ctx, zoom, this.teams[unit.team - 1].color);
        });
    }

    findUnitFromId(id) {
        return this.unitsList.find((element => element.id == id));
    }

    findUnitFromPosition(x, y) {
        let unit = this.unitsList.find((element => element.posX == x && element.posY == y));

        if (unit) {
            return unit.id
        }
    }

    getSelectedUnit() {
        return this.findUnitFromId(this.selectedUnit);
    }

    isSelected(id) {
        let unit = this.unitsList.find((element => element.id == id));

        return unit.state == "selected" ? true : false;
    }

    moveSelectedUnit(x , y) {
        let unit = this.getSelectedUnit();
        unit.moveTo(x, y);
    }

    selectUnit(unitId) {

        if (this.selectedUnit) {
            this.unselectPreviousUnit()
        }
        
        let unit = this.findUnitFromId(unitId);

        this.selectedUnit = unit.id;
        unit.state = "selected";
    }

    unselectPreviousUnit() {
        this.getSelectedUnit().state = null;
        this.selectedUnit = null;
    }

}

export {Unit, UnitsManager};