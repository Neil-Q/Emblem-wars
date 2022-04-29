class Teams_manager {
    constructor() {
        this.teams = [
            {
                name:  "blue",
                color: "rgba(0, 0, 255, 1)"
            },
            {
                name: "red",
                color: "rgba(255, 0, 0, 1)"
            }
        ]
    }

    getColor(teamId) {
        return this.teams[teamId].color;
    }
}

export {Teams_manager}