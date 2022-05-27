class Pathfinder {
    constructor(game, map) {
        this.game = game;
        this.map = map;

        this.spriteSheets = {
            pathArrow : new Image
        }
        this.spriteSheets.pathArrow.src = require("../entities/ui/sprites/pathfinder_arrow.png");

        this.currentPathMap = {
            moveableTiles : [],       // [x, y, canStopHere(0/1), costSoFar, costBack]
            attackableTiles : []
        }

        this.path = {
            steps : [],
            costSofar : 0
        }

    }

    buildPathArrow() {
        let steps = this.path.steps;

        steps[0].arrowSprite = steps[0].direction - 1;

        for (let i = 1; i < steps.length - 1; i++) {
            let currentStep = steps[i]

            let nextDirection = currentStep.direction;
            let previousDirection = steps[i - 1].direction;

            if (previousDirection == nextDirection) {
                if (previousDirection % 2) {
                    currentStep.arrowSprite = 4;
                    continue;
                }
                currentStep.arrowSprite = 5;
                continue;
            }

            let elbowCode = nextDirection + previousDirection * 10;

            switch (elbowCode) {
                case 14 :
                case 23 :
                    currentStep.arrowSprite = 6;
                    break;
                case 12 :
                case 43 :
                    currentStep.arrowSprite = 7;
                    break;
                case 21 :
                case 34 :
                    currentStep.arrowSprite = 8;
                    break;
                case 32 :
                case 41 :
                    currentStep.arrowSprite = 9;
                    break;
            }
        }

        steps[steps.length - 1].arrowSprite = steps[steps.length - 2].direction + 9;
    }

    calculateAttackableTiles(moveableTilesList, attackerId) {

        let mapChunk = new MapChunk(moveableTilesList, 1);
        let frontiers = mapChunk.calculateFrontierFromOutside(true, true);
        
        let attackableTiles = [];
        
        let map = this.map;
        let attackerTeam = this.game.units_manager.getUnitDatas(attackerId).team;
        
        console.log("calculate atk tiles");
        frontiers.outerFrontier.forEach( tile => {
            if (tile[0] <= 0 || tile[1] <= 0 || tile [0] > this.map.gridWidth || tile[1] > this.map.gridHeight) return
            if (!map.checkIfMoveAble(tile[0], tile[1], "foot")) return

            let asUnit = this.game.units_manager.findUnitFromPosition(tile[0], tile[1])
            if (asUnit) {
                let unitDatas = this.game.units_manager.getUnitDatas(asUnit)
                if (unitDatas.team == attackerTeam) return
            }

            attackableTiles.push(tile);
        })

        return attackableTiles;
    }

    calculateMoveableTiles(unitId) {
        console.time("Calculating moveables tiles");

        let game = this.game;
        let map = this.map;
        let units_manager = game.units_manager;
        let pathfinder = this;

        let hero = units_manager.getUnitDatas(unitId);
        let moveType = hero.moveType;
        let moveDistance = hero.moveDistance;

        let start = {
            x : hero.posX,
            y : hero.posY,
            weight : 1
        };

        let closeUnits = units_manager.getNearbyUnits(unitId);
        
        let tilesChecked = [];
        let tilesInReach = [[start.x, start.y, false, 0, moveDistance]];
        let frontier = [start];

        tilesChecked.push([start.x, start.y]);

        for (let i = 0; i < moveDistance; i++) {
            let newFrontier = [];

            frontier.forEach( frontierTile => {
                let neighbours = [
                    {x : frontierTile.x     , y : frontierTile.y - 1},    // northern neighbour - 0
                    {x : frontierTile.x - 1 , y : frontierTile.y    },    // western neighbour  - 1
                    {x : frontierTile.x + 1 , y : frontierTile.y    },    // eastern neighbour  - 2
                    {x : frontierTile.x     , y : frontierTile.y + 1},    // southern neighbour - 3
                ]

                let checkedCount = 0;

                neighbours.forEach( neighbour => {
                    // On s'assure d'être dans les limites de la carte
                    if (neighbour.x < 1 || neighbour.y < 1 || neighbour.x > map.gridWidth || neighbour.y > map.gridHeight) {
                        checkedCount ++;
                        return
                    }

                    // On verifie qu'on à pas déjà validé cette case
                    if (tilesChecked.find(checkedTile => checkedTile[0] == neighbour.x && checkedTile[1] == neighbour.y)) {
                        checkedCount ++;
                        return
                    }

                    let neighbourDatas = map.getTileDatas(neighbour.x, neighbour.y);

                    // On vérifie qu'il est possible de se deplacer dans la case avec le moyen de locomotion sélectioné
                    if (!pathfinder.checkMoveType(neighbourDatas.moveAble, moveType)) {
                        tilesChecked.push([neighbour.x, neighbour.y]);
                        checkedCount ++;
                        return
                    }

                    // On regarde si une unité ne se trouve pas déjà sur la case
                    let unitInPlace = closeUnits.find(unit => unit.posX == neighbour.x && unit.posY == neighbour.y)
                    let canStopHere = true;

                    if (unitInPlace) {
                        // S'il s'agit d'un ennemi on bloque la route
                        if (!unitInPlace.team == hero.team) {
                            tilesChecked.push([neighbour.x, neighbour.y]);
                            checkedCount ++;
                            return
                        }

                        // S'il s'agit d'un allié on rend le terrain plus dur à traverser
                        neighbourDatas.moveCost = neighbourDatas.moveCost * 2;
                        canStopHere = false;
                    }

                    // Enfin on vérifie qu'on à accumulé assez de portée de deplacement
                    if (frontierTile.weight < neighbourDatas.moveCost) return

                    newFrontier.push({x : neighbour.x, y : neighbour.y, weight : 1});
                    tilesChecked.push([neighbour.x, neighbour.y]);
                    tilesInReach.push([neighbour.x, neighbour.y, canStopHere, i + 1, (moveDistance - i + neighbourDatas.moveCost - 2)]);
                    checkedCount++;
                })

                // Si au moins un des voisins est en attente d'avoir assez de portée de déplacement, alors on remet la case dans la frontière en augmentant son poids
                if(checkedCount < 4) newFrontier.push({x : frontierTile.x, y : frontierTile.y, weight : frontierTile.weight + 1});

            });
            frontier = newFrontier;
        }

        console.timeEnd("Calculating moveables tiles");
        return tilesInReach;
    }

    calculatePath(mapX, mapY) {
        this.clearPath()

        if (this.currentPathMap.moveableTiles.lentgh == 0) return;
        
        let hero = this.game.units_manager.getSelectedUnitDatas();
        if (!hero) return;
        if (mapX == hero.posX && mapY == hero.posY) return;
        
        let goal = this.currentPathMap.moveableTiles.find( tile => tile[0] == mapX && tile[1] == mapY && tile[2] == true);
        if (!goal) return this.clearPath();

        let lookingDirection = 1; // east : 1 - south : 2 - west : 3 - north : 4
        this.path.steps.push({mapX : goal[0], mapY : goal[1], costSoFar : goal[3]});
        
        for (let i = 0; i < hero.moveDistance ; i++) {
            let lastStep = this.path.steps[0];
            let cheaperTiles = this.currentPathMap.moveableTiles.filter( tile => tile[3] < lastStep.costSoFar);

            let neighbours = [
                {x : lastStep.mapX + 1 , y : lastStep.mapY    },    // eastern neighbour  - 1
                {x : lastStep.mapX     , y : lastStep.mapY + 1},    // southern neighbour - 2
                {x : lastStep.mapX - 1 , y : lastStep.mapY    },    // western neighbour  - 3
                {x : lastStep.mapX     , y : lastStep.mapY - 1},    // northern neighbour - 4
            ]

            for (let i = 0; i < 4; i++) {
                let direction = lookingDirection + i;
                if (direction > 4 ) direction = direction % 4;

                let neighbour = neighbours[direction - 1];

                let tileToCheck = cheaperTiles.find( tile => tile[0] == neighbour.x && tile[1] == neighbour.y);
                if (!tileToCheck) continue;

                lookingDirection = direction;
                this.path.steps.unshift({mapX : tileToCheck[0], mapY : tileToCheck[1], costSoFar : tileToCheck[3], direction : direction});
                break;
            }

            if (this.path.steps[0].costSoFar == 0) break;            
        }
        this.buildPathArrow();
    }

    checkMoveType(tileMoves, moveType) {
        let moveAble = false;

        switch (moveType) {
            case "climbing" :
                moveAble = tileMoves.climbing;
                break

            case "fly" :
                moveAble = tileMoves.fly;
                break;
            
            case "foot" :
                moveAble = tileMoves.foot;
                break;

            case "swiming" :
                moveAble = tileMoves.swiming;
                break;
        }

        return moveAble;
    }

    checkIfCanMoveHere(mapX, mapY) {
        if (!this.currentPathMap.moveableTiles) return false;

        let canMoveHere = false;
        this.currentPathMap.moveableTiles.find(tile => tile[0] == mapX && tile[1] == mapY && tile[2] == true) ? canMoveHere = true : canMoveHere = false;

        return canMoveHere;
    }

    clearPath() {
        this.path = {
            steps : [],
            costSofar : 0
        }
    }

    getAttackableTiles() {
        return JSON.parse(JSON.stringify(this.currentPathMap.attackableTiles));
    }

    getEnemiesInReach() {
        let enemies = [];
        this.currentPathMap.attackableTiles.forEach(tile => {
            let unit = this.game.units_manager.findUnitFromPosition(tile[0], tile[1]);
            if (!unit) return
            if (unit.team == this.game.turns_manager.getTeamTurn()) return

            enemies.push(unit);
        })

        return enemies;
    }

    renderCurrentPathMap(ctx, zoom) {
        this.renderMoveableTiles(ctx, zoom);
        this.renderAttackableTiles(ctx, zoom);
    }

    renderAttackableTiles(ctx, zoom) {
        let attackableTiles = this.currentPathMap.attackableTiles;

        if(!attackableTiles) return;

        attackableTiles.forEach( tile => {

            let tileX = tile[0];
            let tileY = tile[1];

            let xOrigin = (tileX - 1) * 16 * zoom + zoom;
            let yOrigin = (tileY - 1) * 16 * zoom + zoom;
            let size    = 16 * zoom - (zoom * 2);

            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(xOrigin, yOrigin, size, size);
        });
    }

    renderMoveableTiles(ctx, zoom) {
        let moveableTiles = this.currentPathMap.moveableTiles;
        //console.log(moveableTiles);

        if(!moveableTiles) return;

        moveableTiles.forEach( tile => {
            if(!tile[2]) return // Si la case est à porté mais qu'on ne peut pas s'y arrêter alors on ne l'affiche pas

            let tileX = tile[0];
            let tileY = tile[1];

            let xOrigin = (tileX - 1) * 16 * zoom + zoom;
            let yOrigin = (tileY - 1) * 16 * zoom + zoom;
            let size    = 16 * zoom - (zoom * 2);

            ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
            ctx.fillRect(xOrigin, yOrigin, size, size);
        });
    }

    resetPathMap() {
        this.currentPathMap.moveableTiles = [];
        this.currentPathMap.attackableTiles = [];
    }

    renderPath(ctx, zoom) {
        if (this.path.steps.length == 0) return
 
        let colorCode = this.game.teams_manager.getTeamColorCode(this.game.units_manager.getSelectedUnitDatas().team);
        let innerRow = 3;
        let row = 0;

        switch (colorCode) {
            case "blue" :
                row = 0 + innerRow;
                break;
            case "red" :
                row = 5 + innerRow;
                break;
            case "green" :
                row = 10 + innerRow;
        }

        this.path.steps.forEach( step => {
            ctx.drawImage(this.spriteSheets.pathArrow, step.arrowSprite * 25, row * 25, 24, 24, (step.mapX - 1) * 16 * zoom, (step.mapY - 1) * 16 * zoom, 24 * zoom, 24 * zoom);
        })
    }

    setNewPathMap(unitId) {
        console.time("Total pathfinding time");

        let moveableTiles = this.calculateMoveableTiles(unitId);
        this.currentPathMap.moveableTiles = moveableTiles;
        let attackableTiles = this.calculateAttackableTiles(moveableTiles, unitId)
        this.currentPathMap.attackableTiles = attackableTiles;

        console.timeEnd("Total pathfinding time");
    }

    setNewReachMap(mapX, mapY) {
        let tilesInReach = [
            [mapX       , mapY - 1  ],
            [mapX + 1   , mapY - 1  ],
            [mapX + 1   , mapY      ],
            [mapX + 1   , mapY + 1  ],
            [mapX       , mapY + 1  ],
            [mapX - 1   , mapY + 1  ],
            [mapX - 1   , mapY      ],
            [mapX - 1   , mapY - 1  ]
        ]

        let map = this.map;
        let attackableTiles = this.currentPathMap.attackableTiles;
        tilesInReach.forEach( tile => {
            if (tile[0] <= 0 || tile[1] <= 0 || tile [0] > map.gridWidth || tile[1] > map.gridHeight) return
            if (!map.checkIfMoveAble(tile[0], tile[1], "foot")) return

            attackableTiles.push(tile);
        })
    }
}

class MapChunk {
    // tileList tiles must have format [x, y, true/false, ...] where x/y are the original map cordinates and ... can be all additional informations you want
    constructor(tileList, radius) {
        this.xOrigin = undefined;
        this.yOrigin = undefined;

        this.height = undefined;
        this.width = undefined;
        this.firstTileId = undefined;
        this.map = [];

        this.build(tileList,  radius);
    }

    build(tileList, radius) {
        let northernFrontier = tileList[0][1];
        let westernFrontier = tileList[0][0];
        let easternFrontier = tileList[0][0];
        let southernFrontier = tileList[0][1];

        tileList.forEach( tile => {
            if (tile[1] < northernFrontier) northernFrontier = tile[1];
            if (tile[0] < westernFrontier) westernFrontier = tile[0];
            if (tile[0] > easternFrontier) easternFrontier = tile[0];
            if (tile[1] > southernFrontier) southernFrontier = tile[1];
        })

        this.xOrigin = westernFrontier - radius;
        this.yOrigin = northernFrontier - radius;
        this.height = (southernFrontier + radius) - (northernFrontier - radius) + 1;
        this.width = (easternFrontier + radius) - (westernFrontier - radius) + 1;

        for (let i = 0; i < (this.height * this.width); i++) {
            this.map.push(null);
        }
        
        tileList.forEach( tile => {
            this.map[this.getChunkIndexFromOriginalCoordinates(tile[0], tile[1])] = tile;
        })
        
        this.firstTileId = this.map.findIndex( element => element != null);
    }

    calculateFrontierFromOutside(withCheckIfneighbourIsTrue = true, withDiagonals = true) {

        console.time("calculate frontiers");

        let outerFrontier = [];
        let innerFrontier = [];

        let startingPoint = this.getNeighbourIndex(this.firstTileId, "north");
        let cursorIndex = startingPoint;

        let frontierComplete = false;
        let lookingDirection = 5;
        let numberOfRotations = 0;

        function getDirectionCode(currentLookingDirection, side) {
            let directionToLook = currentLookingDirection + side;
            if (directionToLook > 8) directionToLook = 1;
            if (directionToLook == 0) directionToLook = 8;

            return directionToLook
        }

        function pushToOuterFrontier(index) {
            if(outerFrontier[outerFrontier.length - 1] != index) outerFrontier.push(index);
        }

        function pushToInnerFrontier(index) {
            if(innerFrontier[innerFrontier.lenght - 1] != index) innerFrontier.push(index);
        }

        while (!frontierComplete) {
            if (lookingDirection > 8) lookingDirection -= 8;
            if (lookingDirection <= 0) lookingDirection += 8;

            let tileToCheckIndex = this.getNeighbourIndex(cursorIndex, lookingDirection);

            // Si on trouve une case à l'intérieure de la frontière
            if (this.map[tileToCheckIndex]) {

                // Si la case est libre alors on ajoute à la fois le curseur et cette dernière dans leurs frontières respectives
                if (this.map[tileToCheckIndex][2] === true || !withCheckIfneighbourIsTrue) {

                    pushToInnerFrontier(tileToCheckIndex);
                    pushToOuterFrontier(cursorIndex);

                    lookingDirection -= 2;
                    numberOfRotations ++;
                    continue;
                }

                // Si la case est occupée et qu'on ne compte pas la portée en diagonales alors on n'ajoute aucune des deux
                if (!withDiagonals) {
                    lookingDirection -= 2;
                    numberOfRotations ++;
                    continue;
                }

                // Sinon on verifie les diagonales précédente et suivante
                let previousDiagonalNeighbourIndex = this.getNeighbourIndex(cursorIndex, getDirectionCode(lookingDirection, 1));
                let previousDiagonalNeighbour = this.map[previousDiagonalNeighbourIndex];
                if (previousDiagonalNeighbour) {
                    if(previousDiagonalNeighbour[2] === true) {
                        pushToInnerFrontier(previousDiagonalNeighbourIndex);
                        pushToOuterFrontier(cursorIndex);
    
                        lookingDirection -= 2;
                        numberOfRotations ++;
                        continue;
                    }
                }

                let nextDiagonalNeighbourIndex = this.getNeighbourIndex(cursorIndex, getDirectionCode(lookingDirection, -1));
                let nextDiagonalNeighbour = this.map[nextDiagonalNeighbourIndex];
                if (nextDiagonalNeighbour) {
                    if (nextDiagonalNeighbour[2] === true) {
                        pushToInnerFrontier(nextDiagonalNeighbourIndex);
                        pushToOuterFrontier(cursorIndex);

                        lookingDirection -= 2;
                        numberOfRotations ++;
                        continue;
                    }
                }

                lookingDirection -= 2;
                numberOfRotations ++;
                continue;
            }

            // Si on tombe sur une case hors de la frontière alors s'apprête a y déplace le curseur
            // Mais avant cela s'il s'agit de la première rotation et qu'on compte les diagonales, alors on ajoutes les cases aux frontière si la case intérieure est libre
            if (numberOfRotations == 0 && withDiagonals) {

                let diagonalNeighbourIndex = this.getNeighbourIndex(cursorIndex, getDirectionCode(lookingDirection, 1));
                let neighbour = this.map[diagonalNeighbourIndex];

                //if (neighbour && (neighbour[2] === true || !withCheckIfneighbourIsTrue)) {
                if (neighbour[2] === true || !withCheckIfneighbourIsTrue) {

                    pushToInnerFrontier(diagonalNeighbourIndex);
                    pushToOuterFrontier(cursorIndex);
                }
            }

            // Et si on est revenus au point de départ on arrête là
            if (tileToCheckIndex == startingPoint) {
                frontierComplete = true;
                break;
            }

            cursorIndex = tileToCheckIndex;
            lookingDirection += 2;
            numberOfRotations = 0;
        }

        console.timeEnd("calculate frontiers");

        outerFrontier = outerFrontier.sort().filter(function(item, pos, ary) {
            return !pos || item != ary[pos - 1];
        });

        innerFrontier = innerFrontier.sort().filter(function(item, pos, ary) {
            return !pos || item != ary[pos - 1];
        });

        let rebuildedOuterFrontier = [];
        outerFrontier.forEach( tileIndex => {
            let coordinates = this.getMapCoordinatesFromIndex(tileIndex);
            rebuildedOuterFrontier.push([coordinates.x, coordinates.y]);
        });

        let rebuildedInnerFrontier = [];
        innerFrontier.forEach( tileIndex => {
            rebuildedInnerFrontier.push([this.map[tileIndex][0], this.map[tileIndex][1]]);
        });

        return {outerFrontier : rebuildedOuterFrontier, innerFrontier : rebuildedInnerFrontier};
    }

    getChunkIndexFromOriginalCoordinates(x, y) {
        let mapX = x - this.xOrigin + 1;
        let mapY = y - this.yOrigin + 1;
        let mapIndex = (mapY - 1) * this.width + mapX;

        return mapIndex;
    }

    getChunkCoordinatesFromIndex(index) {
        let x = index % this.width;
        let y = Math.ceil(index / this.height);

        return {x : x, y : y};
    }

    getMapCoordinatesFromIndex(index) {
        let x = ((index - 1) % this.width) + this.xOrigin;
        let y = Math.ceil(index / this.width) + this.yOrigin - 1;

        return {x : x, y : y};
    }

    getNeighbourIndex(originIndex, direction) {
        let index = undefined;
        let numberToDirection = [
            "north",          // 1
            "northeast",      // 2
            "east",           // 3
            "southeast",      // 4
            "south",          // 5
            "southwest",      // 6
            "west",           // 7
            "northwest"       // 8
        ]

        if (!isNaN(direction)) direction = numberToDirection[direction - 1];
         
        switch (direction) {
            case "north" :
                index = originIndex - this.width;
                break;

            case "northeast" :
                index = (originIndex - this.width) + 1;
                break;
            
            case "east" :
                index = originIndex + 1;
                break;

            case "southeast" :
                index = (originIndex + this.width) + 1;
                break;

            case "south" :
                index = originIndex + this.width;
                break;

            case "southwest" :
                index = (originIndex + this.width) - 1;
                break;

            case "west" :
                index = originIndex - 1;
                break;

            case "northwest" :
                index = (originIndex - this.width) - 1;
                break;
        }

        return index;
    }
}

export {Pathfinder}