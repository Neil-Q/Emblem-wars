class Base_unit {
    constructor(id, team, posX, posY, speed) {
        this.id = id;
        this.team = team;

        this.posX = posX;
        this.posY = posY;

        this.moveType = "foot";
        this.moveDistance = 7;
        this.speed = speed;

        this.states = [
            "map_neutral",
            "map_selected"
        ]
        this.currentState = this.states[0];
    }

    moveTo(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }
}

export {Base_unit}