class Teams_manager {
    constructor() {
        this.teams = [
            {
                name :  "blue",
                color : "rgba(0, 0, 255, 1)",
                colorCode : "blue"
            },
            {
                name : "red",
                color : "rgba(255, 0, 0, 1)",
                colorCode : "red"
            }
        ]
    }

    getTeamColor(teamId) {
        return this.teams[teamId].color;
    }

    getTeamColorCode(teamId) {
        return this.teams[teamId].colorCode;
    }

    getTeamName(teamId) {
        return this.teams[teamId].name;
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