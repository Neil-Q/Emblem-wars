class Turns_manager {
    constructor(game) {
        this.game = game;
        this.teams_manager = game.teams_manager;

        this.teamTurn = 1;

        this.waitingLine = {
            units : [],
            events : []
        }
        this.lounge = [];
        this.readyUnits = [];
    }

    advanceTime(time) {
        this.waitingLine.units.forEach( unit => {
            if (unit.timeout >= 1) unit.timeout -= time;
            if (unit.timeout < 0) unit.timeout = 0;
        })

        this.waitingLine.events.forEach( event => {
            if (event.timeout >= 1) event.timeout -= time;
            if (event.timeout < 0) event.timeout = 0;
        })

        console.log("Time advanced by " + time);
    }

    cleanlounge() {

        // S'il n'y a qu'une seule unité alors c'est son tour
        if (this.lounge.length == 1) {
            let unit = this.waitingLine.units.find(unit => unit.id == this.lounge[0]);
            this.lounge = [];
            
            return unit.team;
        }
        
        // Sinon s'il y en a plusieurs on calcule la plus rapide
        let unitsInLounge = [];

        this.lounge.forEach(unitId => {
            let unit = this.waitingLine.units.find(unit => unit.id == unitId);
            unitsInLounge.push(unit);
        })
        this.lounge = []; //reset

        let fastestUnitId = this.calculateFastestUnit(unitsInLounge);
        let fastestUnit = this.waitingLine.units.find(unit => unit.id == fastestUnitId);

        // Et on fait sortir les unités de la même équipe que la plus rapide
        unitsInLounge.forEach(unit => {
            if (unit.team != fastestUnit.team) this.pushToLounge(unit.id);
        })
        
        return fastestUnit.team;
    }

    nextTurn() {
        // On commencent par vérifier si des unités ne sont pas déjà prètes mais sans avoir encore eu le droit de jouer
        console.log(" ");
        console.log(" ");
        console.log("Next turn -----------------------------------------------------------------------")
        if(this.lounge.length >= 1) {
            let nextTeamToPlay = this.cleanlounge();
            this.setTeamTurn(nextTeamToPlay);

            console.log("No time elapsed");
            console.log("Team turn : " + this.teams_manager.teams[this.teamTurn].name);
            this.printAllUnitsStates();
            return
        }

        // On verifie qu'il reste des entités en file d'attente
        // Si ce n'est pas le cas on avance le temps d'une durée prédéfinie et on fait tourner le tour des joueurs        
        let nextTimeout = this.getTimeBeforeNextAction();
        if(!nextTimeout) {
            let teamTurn = this.getTeamTurn() + 1;
            if (teamTurn > this.teams_manager.teams.length - 1) teamTurn = 0;

            this.setTeamTurn(teamTurn);
            console.log("Advance time by default");
            this.advanceTime(100);
            console.log("Team turn : " + this.teams_manager.teams[this.teamTurn].name);
            this.printAllUnitsStates()
            return
        }

        // On trouve les événements devants avoir lieux et les unités qui seron prête au prochain moment
        let readyEvents = this.waitingLine.events.filter(event => event.timeout == nextTimeout);
        let readyUnits = this.waitingLine.units.filter(unit => unit.timeout == nextTimeout);

        // S'il n'y a que les unité d'un seul joueur en train d'attendre alors on verifie qu'il s'agit de la prochaine équipe dans l'ordre par defaut pour faire passer le temps jusqu'à son tour
        // Sinon on ne fait pas passer de temps et on fait jouer l'équipe suivante
        if (!this.waitingLine.units.find(unit => unit.team != readyUnits[0].team && unit.timeout >= 1)) {
            
            let teamTurn = this.getTeamTurn() + 1;
            if (teamTurn > this.teams_manager.teams.length - 1) teamTurn = 0;
            this.setTeamTurn(teamTurn);
            console.log("No time elapsed");
            console.log("Team turn : " + this.teams_manager.teams[this.teamTurn].name);

            return
        }
       
        // On commence par executer les événements s'il y en a
        if (readyEvents) {
            readyEvents.forEach(event => {
                event.fire();
                this.waitingLine.events.shift();
            });
        }
        
        // Si des unités sont prêtes on décide du prochain tour
        if (readyUnits) {
            readyUnits.forEach(unit => this.readyUnits.push(unit.id));

            // S'il n'y a qu'une unité de prète alors on donne le tour à son équipe
            if (readyUnits.length == 1) {
                this.setTeamTurn(readyUnits[0].team);
            }
    
            // Si plusieurs unités sont prètes on les envois dans le lounge
            else {
                readyUnits.forEach(unit => this.pushToLounge(unit.id));  
                let fastestTeam = this.cleanlounge();
                this.setTeamTurn(fastestTeam);    
            }
        }

        this.advanceTime(nextTimeout)
        console.log("Team turn : " + this.teams_manager.teams[this.teamTurn].name);
        this.printAllUnitsStates();
    }

    addEventToline(event) {
        this.waitingLine.events.push(event);
        this.sortWaitingLine("events");
    }

    addUnitToLine(id, team, speed) {
        let unit = {
            id : id,
            team : team,
            speed: speed,
            timeout : speed
        }
        this.waitingLine.units.push(unit);
        this.sortWaitingLine("units");
    }

    calculateFastestUnit(unitsList) {

        // Parmis les unités prètes on prends la ou les plus rapides si plusieurs ont la même vitesse
        unitsList.sort(function(a, b) {return a.speed - b.speed;})
        let fastestUnits = unitsList.filter(unit => unit.speed == unitsList[0].speed);
        let winner = fastestUnits[0].id;

        // S'il y en a plusieurs on en choisie une au hasard
        if (fastestUnits.length > 1) winner = fastestUnits[Math.floor(Math.random() * fastestUnits.length)].id;

        return winner
    }

    getTeamTurn() {
        return this.teamTurn;
    }

    getTimeBeforeNextAction() {
        let nextTimeout = false;

        let nextUnit = this.waitingLine.units.find(unit => unit.timeout >= 1);
        let nextEvent = this.waitingLine.events.find(event => event.timeout >= 1);

        if (nextUnit) nextTimeout = nextUnit.timeout;
        if (nextEvent && nextEvent.timeout <= nextTimeout) nextTimeout = nextEvent.timeout;

        return nextTimeout;
    }


    isReady(unitId) {
        let isUnitReady = this.readyUnits.find(unit => unit == unitId);
        if (isUnitReady) return true;
        return false;
    }

    printAllUnitsStates() {
        this.printReadyUnits();
        this.printUnitsInLounge();
        this.printWaitingUnit();
    }

    printReadyUnits() {
        console.log(" ");
        console.log("Ready units :");
        this.readyUnits.forEach( unitId => {
            let unit = this.waitingLine.units.find( unit => unit.id == unitId);
            console.log(unit);
        })
    }

    printUnitsInLounge() {
        console.log(" ");

        if (this.lounge.length == 0 ) return console.log("No unit in lounge");

        console.log("Units in lounge :");
        this.lounge.forEach( unitId => {
            console.log(this.waitingLine.units.find(unit => unit.id == unitId));
        })
    }

    printWaitingUnit() {
        console.log(" ");
        let waitings = [];
        this.waitingLine.units.forEach( unit => { if (unit.timeout >= 1) waitings.push(unit) });
        
        if (waitings.length == 0) return console.log("No unit waiting")
        console.log("Waiting units :");
        waitings.forEach( unit => { console.log(unit) });
    }

    pushToLounge(unitId) {
        this.lounge.push(unitId);
    }

    resetUnitTimeout(unitId) {
        let unitToReset = this.waitingLine.units.find(unit => unit.id == unitId);
        unitToReset.timeout = unitToReset.speed;

        this.sortWaitingLine("units");
    }

    returnToWaitingline(unitId) {
        let unitToMove = this.waitingLine.units.find(unit => unit.id == unitId);
        unitToMove.timeout = unitToMove.speed;
        this.sortWaitingLine("units");
        this.readyUnits = this.readyUnits.filter(unit => unit != unitId);
        
        console.log("Unit returned to waiting line ------------------");
        console.log(unitToMove);

        console.log(" ");
        this.printReadyUnits();
        this.printWaitingUnit();
    }

    setTeamTurn(team) {
        this.teamTurn = team;
    }

    sortWaitingLine(line) {
        switch (line) {
            case "units" :
                this.waitingLine.units.sort(function(a, b) {
                    return a.timeout - b.timeout;
                })
                break;

            case "events" :
                this.waitingLine.events.sort(function(a, b) {
                    return a.timeout - b.timeout;
                })
                break;
        }
    }
}

export { Turns_manager };