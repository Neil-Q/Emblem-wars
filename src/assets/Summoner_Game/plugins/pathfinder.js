class Pathfinder {
    constructor(game, map) {
        this.game = game
        this.map = map;

        this.currentPathMap = {
            moveableTiles : null,       // [x, y, canStopHere(0/1)]
            attackableTiles : null
        }

        this.enemiesReachMaps = this.initReachesMaps();
    }

    trackEnemy(enemyId) {
        let teamTurn = this.game.turns_manager.getTeamTurn();
        let nameOfPlayingTeam = this.game.teams_manager.getTeamName(teamTurn);

        // On commence par verifier que l'unité qu'on vient de demander ne se trouve pas déjà dans la liste
        // Si c'est le cas on l'enlève
        if (this.enemiesReachMaps[nameOfPlayingTeam].trackedEnemies.find( enemy => enemy.id == enemyId)) {
            let newIndividualReachs = [];

            this.enemiesReachMaps[nameOfPlayingTeam].trackedEnemies.forEach( enemy => {
                if (enemy.id != enemyId) newIndividualReachs.push(enemy);  
            })

            this.enemiesReachMaps[nameOfPlayingTeam].trackedEnemies = newIndividualReachs;
            this.mergeTrackedReach(nameOfPlayingTeam);
            return
        }

        let enemyMoveableTiles = this.calculateMoveableTiles(enemyId);
        let enemyAttackableTiles = this.calculateAttackableTiles(enemyMoveableTiles);

        let enemyReachableTiles = enemyMoveableTiles.concat(enemyAttackableTiles);
        let enemyDatas = this.game.units_manager.getUnitDatas(enemyId);


        let enemy = {};
        enemy.id = enemyId;
        enemy.posX = enemyDatas.posX;
        enemy.posY = enemyDatas.posY;
        enemy.moveDistance = enemyDatas.moveDistance;
        enemy.reachMap = enemyReachableTiles;

        this.enemiesReachMaps[nameOfPlayingTeam].trackedEnemies.push(enemy);

        this.mergeTrackedReach(nameOfPlayingTeam);

        console.log("Added unit to tracked enemies : " + enemy.id);
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

    calculateAttackableTiles(moveableTilesList, attackerId) {
        let mapChunk = new MapChunk(moveableTilesList, 1);
        let frontiers = mapChunk.calculateFrontierFromOutside(true, true);

        let attackableTiles = [];

        let map = this.map;
        let attackerTeam = this.game.units_manager.getUnitDatas(attackerId).team;

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
        let tilesInReach = [[start.x, start.y, false]];
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
                    tilesInReach.push([neighbour.x, neighbour.y, canStopHere]);
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

    mergeTrackedReach(teamName) {
        let reachMap = []

        this.enemiesReachMaps[teamName].trackedEnemies.forEach( enemy => {
            reachMap = reachMap.concat(enemy.reachMap);
        });

        let reachMapIndexes = []
        reachMap.forEach( tile => reachMapIndexes.push(this.map.getMapIndexFromCoordinates(tile[0], tile[1])));

        reachMapIndexes = reachMapIndexes.sort().filter(function(item, pos, ary) {
            return !pos || item != ary[pos - 1];
        });
    
        reachMap = [];
        reachMapIndexes.forEach( tile => {
            let coordinates = this.map.getMapCoordinatesFromIndex(tile);
            reachMap.push([coordinates.x, coordinates.y]);
        });

        this.enemiesReachMaps[teamName].totalReach = reachMap;
    }

    initReachesMaps() {
        let enemiesReachMaps = {};

        this.game.teams_manager.teams.forEach( team => {
            enemiesReachMaps[team.name] = {
                trackedEnemies : [],
                totalReach : []
            }
        })

        return enemiesReachMaps;
    }

    renderTrackedEnemiesReach(ctx, zoom) {
        let playingTeam = this.game.turns_manager.getTeamTurnName();
        let reachableTiles = this.enemiesReachMaps[playingTeam].totalReach;

        if(!reachableTiles) return;

        reachableTiles.forEach( tile => {

            let tileX = tile[0];
            let tileY = tile[1];

            let xOrigin = (tileX - 1) * 16 * zoom ;
            let yOrigin = (tileY - 1) * 16 * zoom ;
            let size    = 16 * zoom ;

            ctx.fillStyle = "rgba(245, 0, 0, 0.2)";
            ctx.fillRect(xOrigin, yOrigin, size, size);
        });
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
        this.currentPathMap.moveableTiles = null;
        this.currentPathMap.attackableTiles = null;
    }

    setNewPathMap(unitId) {
        console.time("Total pathfinding time");

        let moveableTiles = this.calculateMoveableTiles(unitId);
        this.currentPathMap.moveableTiles = moveableTiles;
        let attackableTiles = this.calculateAttackableTiles(moveableTiles, unitId)
        this.currentPathMap.attackableTiles = attackableTiles;

        console.timeEnd("Total pathfinding time");
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