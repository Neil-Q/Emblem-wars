class Base_unit {
    constructor(id, team, posX, posY) {
        this.id = id;
        this.team = team;

        this.posX = posX;
        this.posY = posY;

        this.moveType = "foot";
        this.moveDistance = 7;

        this.states = [
            "map_neutral",
            "map_selected"
        ]
        this.currentState = this.states[0];
    }

    loadStates() {
        console.log("load states");
        console.log(this);
        this.states = [
            //new Unit_state_neutral(this),
            1,
            2
        ];
        this.currentState = this.states[0];
        console.log(this);
    }

    moveTo(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }

    render(ctx, zoom, color) {

        switch(this.currentState) {
            case "map_neutral" : 
                this.render_neutral(ctx, zoom, color);
                break;
            
            case "map_selected" :
                this.render_selected(ctx, zoom, color);
                break;
            default :
                console.log("unable to render unit " + this.id);
        }
    }

    render_neutral(ctx, zoom, color) {
        let posY = this.posY * 16 * zoom - (8 * zoom);
        let posX = this.posX * 16 * zoom - (8 * zoom);
        let radius = 15 * zoom / 2;
        
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(posX, posY , radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    render_selected(ctx, zoom, color) {
        let posY = this.posY * 16 * zoom - (8 * zoom);
        let posX = this.posX * 16 * zoom - (8 * zoom);
        let radius = 15 * zoom / 2;
        
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(posX, posY , radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.arc(posX, posY , radius*0.65, 0, 2 * Math.PI);
        ctx.fill();
    }

    setState(state) {
        switch(state) {
            case "neutral" : 
                this.currentState = this.states[0];
                break;
            
            case "selected" : 
                this.currentState = this.states[1];
                break;

            default : 
                console.log("Unit state not found");
            
        }
    }
}

export {Base_unit}