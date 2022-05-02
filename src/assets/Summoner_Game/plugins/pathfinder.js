class Pathfinder {
    constructor(map) {
        this.map = map;

        this.currentPathMap = {
            moveableTiles : null,       // [x, y, canStopHere(0/1)]
            attackableTiles : null
        }
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

    calculateMoveAbleTiles(unitId) {
        let game = this.map.game;
        let units_manager = game.units_manager;
        let map = this.map;
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
        let tilesInReach = [];
        let frontier = [start];

        tilesChecked.push([start.x, start.y]);

        for (let i = 0; i < moveDistance; i++) {
            let newFrontier = [];

            frontier.forEach(function(frontierTile) {
                let neighbours = [
                    {x : frontierTile.x     , y : frontierTile.y - 1},    // northern neighbour - 0
                    {x : frontierTile.x - 1 , y : frontierTile.y    },    // western neighbour  - 1
                    {x : frontierTile.x + 1 , y : frontierTile.y    },    // eastern neighbour  - 2
                    {x : frontierTile.x     , y : frontierTile.y + 1},    // southern neighbour - 3
                ]

                let checkedCount = 0;

                neighbours.forEach(function(neighbour) {
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
        return tilesInReach;
    }

    renderCurrentPathMap(ctx, zoom) {
        this.renderMoveableTiles(ctx, zoom);
    }

    renderMoveableTiles(ctx, zoom) {
        let moveableTiles = this.currentPathMap.moveableTiles;
        //console.log(moveableTiles);

        if(!moveableTiles) return;

        moveableTiles.forEach(function(tile) {
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
        let moveableTiles = this.calculateMoveAbleTiles(unitId);
        this.currentPathMap.moveableTiles = moveableTiles;
    }
}

export {Pathfinder}