class Unit {
    constructor (id, team, codeName, name, weapons, stats) {
        this.id = id;
        this.team = team;

        this.codeName = codeName;
        this.name = name;
        this.weapons = weapons;

        this.experience = stats.experience;
        this.levelTresholds = stats.levelTresholds;

        this.posX = undefined;
        this.posY = undefined;

        this.maxHP = stats.maxHP;
        this.currentHP = this.maxHP;

        this.maxMP = stats.maxMP;
        this.currentMP = this.maxMP;

        this.strength = stats.strength;
        this.power = stats.power;

        this.defense = stats.defense;
        this.resistance = stats.resistance;

        this.precision = stats.precision;
        this.distancePrecision = stats.distancePrecision;

        this.criticalChance = stats.criticalChance;
        this.luck = stats.luck;

        this.speed = stats.speed;
        this.actionTime = stats.actionTime;
        this.moveType = stats.moveType;
        this.moveDistance = stats.moveDistance;
    }

    moveTo(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }
}

export { Unit }
