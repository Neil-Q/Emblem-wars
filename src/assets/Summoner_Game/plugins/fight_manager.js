class Fight_manager {
    constructor (game) {
        this.game = game;

        this.weaponStats = {
            sword : {
                archetype : "sword",
                damageType : "physical",

                damages : 1,
                precision : 0,
                critical : 0,
                speed : 1,

            },

            lance : {
                archetype : "lance",
                damageType : "physical",

                damages : 1.1,
                precision : -10,
                critical : 0,
                speed : 1
            },

            axe : {
                archetype : "axe",
                damageType : "physical",

                damages : 1.2,
                precision : -15,
                critical : 0,
                speed : 0.95
            },

        }
    }

    calculateFightingProbabilities(attackerStats, defenderStats, attackerWeapon = 0, defenderWeapon = 0) {

        let attackerProbabilities = {
            hp : attackerStats.currentHP,
            damages : undefined,
            hittingChances : undefined,
            criticalChances : undefined,
            bonusAttackChances : 0
        }

        let defenderProbabilities = {
            hp : defenderStats.currentHP,
            damages : undefined,
            hittingChances : undefined,
            criticalChances : undefined,
            bonusAttackChances : 0
        }

        let attackerWeaponStats = this.weaponStats[attackerStats.weapons[attackerWeapon]];
        let defenderWeaponStats = this.weaponStats[defenderStats.weapons[defenderWeapon]];

        // calculating base stats
        let attackerRawDamages      = (attackerWeaponStats.damageType == "physical" ? attackerStats.strength : attackerStats.power)        * attackerWeaponStats.damages
        let attackerDefense         =  defenderWeaponStats.damageType == "physical" ? attackerStats.defense  : attackerStats.resistance
        let attackerFightingSpeed   = attackerStats.speed * attackerWeaponStats.speed;
        let attackerDodge           = attackerFightingSpeed - 85;
        let attackerPrecision       = attackerStats.precision + attackerWeaponStats.precision;
        let attackerCriticalChance  = attackerStats.criticalChance + attackerWeaponStats.critical;
        let attackerLuck            = attackerStats.luck;

        let defenderRawDamages      = (defenderWeaponStats.damageType == "physical" ? defenderStats.strength : defenderStats.power)        * defenderWeaponStats.damages
        let defenderDefense         =  attackerWeaponStats.damageType == "physical" ? defenderStats.defense  : defenderStats.resistance
        let defenderFightingSpeed   = defenderStats.speed * defenderWeaponStats.speed;
        let defenderDodge           = defenderFightingSpeed - 85;
        let defenderPrecision       = defenderStats.precision + defenderWeaponStats.precision;
        let defenderCriticalChance  = defenderStats.criticalChance + defenderWeaponStats.critical;
        let defenderLuck            = defenderStats.luck;

        // add weapon triangle corrections
        function applyTriangleBonusTo(WhoIsAdvantaged) {
            switch (WhoIsAdvantaged) {
                case "attacker" :
                    attackerPrecision += 10;
                    attackerFightingSpeed *= 1.05;

                    defenderPrecision -= 10;
                    defenderFightingSpeed /= 1.05;
                    break;
                
                case "defender" :
                    defenderPrecision += 10;
                    defenderFightingSpeed *= 1.05;

                    attackerPrecision -= 10;
                    attackerFightingSpeed /= 1.05;
                    break;
            }
        }

        switch (attackerWeaponStats.archetype) {
            case "sword" :
                if (defenderWeaponStats.archetype == "axe")     applyTriangleBonusTo("attacker");
                if (defenderWeaponStats.archetype == "lance")   applyTriangleBonusTo("defender");
                break;
            case "lance" :
                if (defenderWeaponStats.archetype == "sword")   applyTriangleBonusTo("attacker");
                if (defenderWeaponStats.archetype == "axe")     applyTriangleBonusTo("defender");
                break;
            case "axe" :
                if (defenderWeaponStats.archetype == "lance")   applyTriangleBonusTo("attacker");
                if (defenderWeaponStats.archetype == "sword")   applyTriangleBonusTo("defender");
                break;
        }

        // calculate each unit potential damages
        attackerProbabilities.damages = Math.floor(attackerRawDamages - defenderDefense);
        defenderProbabilities.damages = Math.floor(defenderRawDamages - attackerDefense);
        
        // calculate each unit chances of hitting
        attackerProbabilities.hittingChances = Math.floor(attackerPrecision - defenderDodge);
        defenderProbabilities.hittingChances = Math.floor(defenderPrecision - attackerDodge);

        // calculate each chances of performing a critical hit
        attackerProbabilities.criticalChances = Math.floor(attackerCriticalChance - defenderLuck);        
        defenderProbabilities.criticalChances = Math.floor(defenderCriticalChance - attackerLuck);
        
        // calculate chances of counter attack/double attack
        if(defenderFightingSpeed * 1.25 > attackerFightingSpeed) {          
            attackerProbabilities.bonusAttackChances = 0;
            defenderProbabilities.bonusAttackChances = Math.floor(((defenderFightingSpeed * 0.25) / (attackerFightingSpeed * 0.5))*100);
        }
        else if (attackerFightingSpeed > defenderFightingSpeed * 1.5) {
            defenderProbabilities.bonusAttackChances = 0;
            attackerProbabilities.bonusAttackChances = Math.floor((attackerFightingSpeed - (defenderFightingSpeed * 1.5)) / (defenderFightingSpeed * 0.5));
        }

        // Apply min/max ranges
        attackerProbabilities.damages = Math.max(attackerProbabilities.damages, 0);
        defenderProbabilities.damages = Math.max(defenderProbabilities.damages, 0);

        attackerProbabilities.hittingChances = Math.min(Math.max(attackerProbabilities.hittingChances, 0), 100);
        defenderProbabilities.hittingChances = Math.min(Math.max(defenderProbabilities.hittingChances, 0), 100);

        attackerProbabilities.criticalChances = Math.min(Math.max(attackerProbabilities.criticalChances, 0), 100);
        defenderProbabilities.criticalChances = Math.min(Math.max(defenderProbabilities.criticalChances, 0), 100);

        defenderProbabilities.bonusAttackChances = Math.max(Math.min(defenderProbabilities.bonusAttackChances, 100), 0);
        attackerProbabilities.bonusAttackChances = Math.max(Math.min(attackerProbabilities.bonusAttackChances, 100), 0);


        return {attackerStats : attackerProbabilities, defenderStats : defenderProbabilities};
    }
}

export { Fight_manager }