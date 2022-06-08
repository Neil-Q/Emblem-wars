import { Unit } from "../entities/units/unit.js";


class Units_factory {
    constructor(game) {
        this.game = game;

        this.baseUnitBlueprint = {
            maxHP               : [15       ,1.046   ],
            maxMP               : [10       ,1.046   ],
            MPRegeneration      : [1        ,1.046   ],

            strength            : [10       ,1.046   ],
            power               : [10       ,1.046   ],
            
            defense             : [4        ,1.046   ],
            resistance          : [2        ,1.046   ],
            //dodge             : speed - 85
            
            //precision         : depend of dodge (dodge + 85)
            //distancePrecision : depend of contact precision (precision - 30)
            
            criticalChance      : [[5        ,1.12983  ], [15    ,1.0584   ], [25   ,1.0381   ], [35    ,1.02832  ]],
            //luck              : depend of critical chances 
        
            speed               : [100      ,1.0251  ],
            moveDistance        : 5,

            cost                : [100      ,1.12983 ]
        }

        this.modulatorsTable = {
            //                     -----   ----     ---     --      -                +      ++      +++    ++++    +++++
            maxHP               : [0.65   ,0.7    ,0.75   ,0.8    ,0.9    ,1      ,1.125  ,1.25   ,1.375  ,1.5    ,1.625  ],
            maxMP               : [0.65   ,0.7    ,0.75   ,0.8    ,0.9    ,1      ,1.125  ,1.25   ,1.375  ,1.5    ,1.625  ],
            MPRegeneration      : [0.65   ,0.7    ,0.75   ,0.8    ,0.9    ,1      ,1.125  ,1.25   ,1.375  ,1.5    ,1.625  ],

            strength            : [0.7    ,0.75   ,0.8    ,0.85   ,0.9    ,1      ,1.1    ,1.2    ,1.3    ,1.4    ,1.5    ],
            power               : [0.75   ,0.8    ,0.85   ,0.9    ,0.95   ,1      ,1.1    ,1.2    ,1.3    ,1.4    ,1.5    ],

            defense             : [0      ,0.2    ,0.4    ,0.6    ,0.8    ,1      ,1.25   ,1.5    ,1.75   ,2      ,2.25   ],
            resistance          : [0      ,0.2    ,0.4    ,0.6    ,0.8    ,1      ,1.25   ,1.5    ,1.75   ,2      ,2.25   ],

            precision           : [-25    ,-20    ,-15    ,-10    ,-5     ,0      ,+5     ,+10    ,+15    ,+20    ,+25    ],
            distancePrecision   :                                         [0      ,+10    ,+20    ,+30    ,+40    ,+50    ],

            criticalChance      :                                         [0      ,+5     ,+10    ,+15    ,+20    ,+25    ],
            luck                :                                         [1      ,1.25   ,1.5    ,1.75   ,2      ,2.25   ],

            speed               : [0.65   ,0.7    ,0.75   ,0.8    ,0.9    ,1      ,1.05   ,1.1    ,1.15   ,1.2    ,1.25   ],
            moveDistance        : [-4     ,false  ,-3     ,-2     ,-1     ,0      ,+1     ,+2     ,+4     ,+6     ,+9     ],

            cost                :                                         [1      ,1.2    ,1.4    ,1.6    ,1.8    ,2      ]
        }

        this.archetypes = {
            guard : {
                name                : ["Guarde", "Guardien", "Sentinelle"],
                mainWeapons         : ["lance", "halberd"],
                backupWeapons       : false,

                maxHP               : [+1],
                maxMP               : false,
                MPRegeneration      : false,
        
                strength            : [-1],
                power               : false,
        
                defense             : [+2],
                resistance          : [ 0],
        
                precision           : [ 0],
                distancePrecision   : false,
        
                criticalChance      : [ 0],
                luck                : [+1],
        
                speed               : [-1],
                moveType            : "foot",
                moveDistance        : [-1],
        
                cost                : [+1]
            },
            soldier : {
                name                : ["Soldat", "Vétéran", "Hero"],
                mainWeapons         : ["sword", "axe", "lance"],
                backupWeapons       : false,

                maxHP               : [ 0],
                maxMP               : false,
                MPRegeneration      : false,
        
                strength             : [ 0],
                power               : false,
        
                defense             : [ 0],
                resistance          : [ 0],
        
                precision           : [ 0],
                distancePrecision   : false,
        
                criticalChance      : [ 0],
                luck                : [ 0],
        
                speed               : [ 0],
                moveType            : "foot",
                moveDistance        : [ 0],
        
                cost                : [ 0]
            },
            swordsman : {
                name                : ["Epéiste", "Fine lame", "Maître d'arme"],
                mainWeapons         : ["sword", "rapier"],
                backupWeapons       : false,

                maxHP               : [ 0],
                maxMP               : false,
                MPRegeneration      : false,
        
                strength             : [ 0],
                power               : false,
        
                defense             : [ 0],
                resistance          : [ 0],
        
                precision           : [+1],
                distancePrecision   : false,
        
                criticalChance      : [+1],
                luck                : [ 0],
        
                speed               : [+1],
                moveType            : "foot",
                moveDistance        : [ 0],
        
                cost                : [+1]
            },
            warrior : {
                name                : ["Guerrier", "Sacageur", "Maraudeur"],
                mainWeapons         : ["axe", "masse", "hammer"],
                backupWeapons       : false,

                maxHP               : [+1],
                maxMP               : false,
                MPRegeneration      : false,
        
                strength            : [+2],
                power               : false,
        
                defense             : [ 0],
                resistance          : [ 0],
        
                precision           : [-1],
                distancePrecision   : false,
        
                criticalChance      : [ 0],
                luck                : [ 0],
        
                speed               : [-1],
                moveType            : "foot",
                moveDistance        : [ 0],
        
                cost                : [+1]
            },
        }

    }

    buildNewUnit(id, team, archetype, rank, level, weaponId) {

        let rankedLevel = (rank - 1) * 10 + level - (rank - 1);

        let base = this.baseUnitBlueprint;
        let modulators = this.archetypes[archetype];
        let modulatorsTable = this.modulatorsTable;

        let codeName = archetype + "_" + rank;
        let name = modulators.name[rank - 1];
        let weapons = [modulators.mainWeapons[weaponId - 1]];
        if (modulators.backupWeapons) modulators.backupWeapons.forEach( weapon => weapons.push(weapon));

        let prototypeStats = {
            maxHP               : undefined,
            maxMP               : 0,
            MPRegeneration      : 0,

            strength            : undefined,
            power               : 0,

            defense             : undefined,
            resistance          : undefined,
            
            criticalChance      : undefined,
            
            speed               : undefined,
            actionTime          : undefined,
            moveType            : modulators.moveType,
            moveDistance        : base.moveDistance + modulatorsTable.moveDistance[5 + modulators.moveDistance[0]],

            precision           : undefined,
            distancePrecision   : 0,
            luck                : undefined,

            levelTresholds      : [],
            experience          : undefined
        };

        if (rankedLevel > 1) {

            prototypeStats.maxHP                                                = Math.round((base.maxHP[0] * (base.maxHP[1] ** (rankedLevel - 1))) * modulatorsTable.maxHP[5 + modulators.maxHP[0]]);
            if (modulators.maxMP) prototypeStats.maxMP                          = Math.round((base.maxMP[0] * (base.maxMP[1] ** level)) * modulatorsTable.maxMP[5 + modulators.maxMP]);
            if (modulators.MPRegeneration) prototypeStats.MPRegeneration        = Math.round((base.MPRegeneration[0] * (base.MPRegeneration[1] ** (rankedLevel - 1))) * modulatorsTable.MPRegeneration[5 + modulators.MPRegeneration]);

            prototypeStats.strength                                             = Math.round((base.strength[0] * (base.strength  [1] ** (rankedLevel - 1))) * modulatorsTable.strength[5 + modulators.strength[0]]);
            if (modulators.power) prototypeStats.power                          = Math.round((base.power[0] * (base.power[1] ** level)) * modulatorsTable.power[5 + modulators.power]);

            prototypeStats.defense                                              = Math.round((base.defense[0] * (base.defense[1] ** (rankedLevel - 1))) * modulatorsTable.defense[5 + modulators.defense[0]]);
            prototypeStats.resistance                                           = Math.round((base.resistance[0] * (base.resistance[1] ** (rankedLevel - 1))) * modulatorsTable.resistance[5 + modulators.resistance[0]])

            prototypeStats.criticalChance                                       = Math.round((base.criticalChance[rank - 1][0] * (base.criticalChance[rank - 1][1] ** (level - 1))) + modulatorsTable.criticalChance[modulators.criticalChance[0]]);

            prototypeStats.speed                                                = Math.round((base.speed[0] * (base.speed[1] ** (rankedLevel - 1))) * modulatorsTable.speed[5 + modulators.speed[0]]);
            prototypeStats.actionTime                                           = Math.round((100 / prototypeStats.speed) * 100);

            prototypeStats.precision                                            = Math.round((base.speed[0] * (base.speed[1] ** (rankedLevel - 1))) + modulatorsTable.precision[5 + modulators.precision[0]]);
            if (modulators.distancePrecision) prototypeStats.distancePrecision  = Math.round((prototypeStats.speed - 30) + modulatorsTable.distancePrecision[5 + modulators.distancePrecision[0]]);

            prototypeStats.luck                                                 = Math.round((base.criticalChance[rank - 1][0] * (base.criticalChance[rank - 1][1] ** (level - 1))) * modulatorsTable.luck[modulators.luck[0]] / 2);
        } else {

            prototypeStats.maxHP                                                = Math.round(base.maxHP[0] * modulatorsTable.maxHP[5 + modulators.maxHP[0]]);
            if (modulators.maxMP) prototypeStats.maxMP                          = Math.round(base.maxMP[0] * modulatorsTable.maxMP[5 + modulators.maxMP]);
            if (modulators.MPRegeneration) prototypeStats.MPRegeneration        = Math.round(base.MPRegeneration[0] * modulatorsTable.MPRegeneration[5 + modulators.MPRegeneration]);

            prototypeStats.strength                                             = Math.round(base.strength[0] * modulatorsTable.strength[5 + modulators.strength[0]]);
            if (modulators.power) prototypeStats.power                          = Math.round(base.power[0] * modulatorsTable.power[5 + modulators.power]);

            prototypeStats.defense                                              = Math.round(base.defense[0] * modulatorsTable.defense[5 + modulators.defense[0]]);
            prototypeStats.resistance                                           = Math.round(base.resistance[0] * modulatorsTable.resistance[5 + modulators.resistance[0]])

            prototypeStats.criticalChance                                       = Math.round(base.criticalChance[rank - 1][0] + modulatorsTable.criticalChance[modulators.criticalChance[0]]);

            prototypeStats.speed                                                = Math.round(base.speed[0] * modulatorsTable.speed[5 + modulators.speed[0]]);
            prototypeStats.actionTime                                           = Math.round((100 / prototypeStats.speed) * 100);

            prototypeStats.precision                                            = Math.round(base.speed[0] + modulatorsTable.precision[5 + modulators.precision[0]]);
            if (modulators.distancePrecision) prototypeStats.distancePrecision  = Math.round((prototypeStats.speed - 30) + modulatorsTable.distancePrecision[modulators.distancePrecision[0]]);

            prototypeStats.luck                                                 = Math.round(base.criticalChance[rank - 1][0] * modulatorsTable.luck[modulators.luck[0]] / 2);
        }

        for (let i = 1; i <= 10 ; i++) {
            let treshold = base.cost[0] * (base.cost[1] ** ((rank - 1) * 10 - rank + i));
            treshold = Math.round(treshold * modulatorsTable.cost[modulators.cost]);

            prototypeStats.levelTresholds.push(treshold);
        }

        prototypeStats.experience = prototypeStats.levelTresholds[level - 1];

        let unit = new Unit(id, team, codeName, name, weapons, prototypeStats);

        return unit;
    }
}

export { Units_factory }