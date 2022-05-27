class Teams_manager {
    constructor() {
        this.teams = [
            {
                id: 1,
                name :  "blue",
                color : "rgba(0, 0, 255, 1)",
                colorCode : "blue"
            },
            {   
                id: 2,
                name : "red",
                color : "rgba(255, 0, 0, 1)",
                colorCode : "red"
            },
            {
                id : 3,
                name : "Vert haha",
                color : "rgba(0, 255, 0, 1)",
                colorCode : "green"
            },
        ]
    }

    getNumberOfTeams() {
        return this.teams.length;
    }

    getTeamColor(teamId) {
        return this.teams[teamId - 1 ].color;
    }

    getTeamColorCode(teamId) {
        return this.teams[teamId - 1].colorCode;
    }

    getTeamName(teamId) {
        return this.teams[teamId - 1].name;
    }

    getTeamDatas(teamId) {
        let datas = {
            name :  this.getTeamName(teamId),
            color : this.getColor(teamId)
        }

        return datas;
    }
}

export {Teams_manager}