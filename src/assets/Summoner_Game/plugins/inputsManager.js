class Inputs_manager {
    constructor (game) {
        this.game = game;
    }

    listen() {
        this.game.canvas.addEventListener("mousemove", event => {
            this.game.pointer.update(event);
        });

        this.game.canvas.addEventListener("click", () => {
            this.game.fire("click");
        });

        this.game.canvas.addEventListener("mousedown", () => {
            this.game.fire("mousedown");
        });

        this.game.canvas.addEventListener("mouseup", () => {
            this.game.fire("mouseup");
        });

        document.addEventListener("keydown", key => {
            switch (key.key) {
                case " " :
                    this.game.fire("space");
                    break;
                case "Escape" :
                    this.game.fire("escape");
                    break;
            }
        })
    }
}

export {Inputs_manager}