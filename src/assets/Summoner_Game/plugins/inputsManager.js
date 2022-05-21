class Inputs_manager {
    constructor (game) {
        this.game = game;
    }

    listen() {
        let canvas = this.game.canvas;

        canvas.addEventListener("mousemove", event => {
            this.game.pointer.update(event);
        });

        canvas.addEventListener("click", event => {
            let datas = {
                x : event.offsetX,
                y : event.offsetY
            }
            this.game.fire("click", datas);
        });

        canvas.addEventListener("mousedown", () => {
            this.game.fire("mousedown");
        });

        canvas.addEventListener("mouseup", () => {
            this.game.fire("mouseUp");
        });

        canvas.addEventListener("contextmenu", e => {
            e.preventDefault();
            this.game.fire("rightClick");
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