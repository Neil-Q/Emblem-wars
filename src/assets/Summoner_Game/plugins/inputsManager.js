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

        document.addEventListener("keydown", key => {
            switch (key.key) {
                case " " :
                    this.game.fire("space");
                    break
            }
        })
    }
}

export {Inputs_manager}