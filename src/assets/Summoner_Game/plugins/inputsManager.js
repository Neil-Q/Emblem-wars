class Inputs_manager {
    constructor (game) {
        this.game = game;

        this.preventMultiplication = [];
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

            if (this.preventMultiplication.find( alreadyPushedKey => alreadyPushedKey == key.key)) return
            switch (key.key) {
                case " " :
                    this.game.fire("space");
                    this.preventMultiplication.push(key.key);
                    break;

                case "a" :
                    this.game.fire("a");
                    this.game.fire("a_down");
                    this.preventMultiplication.push(key.key);
                    break;

                case "ArrowDown" :
                    this.game.fire("arrowDown");
                    break;
                
                case "ArrowLeft" :
                    this.game.fire("arrowLeft");
                    break;
                
                case "ArrowRight" :
                    this.game.fire("arrowRight");
                    break;

                case "ArrowUp" :
                    this.game.fire("arrowUp");
                    break;

                case "Escape" :
                case "z" :
                    this.game.fire("escape");
                    this.preventMultiplication.push(key.key);
                    break;
            }    
        });

        document.addEventListener("keyup", key => {
            if (this.preventMultiplication.find( alreadyPushedKey => alreadyPushedKey == key.key)) {
                this.preventMultiplication = this.preventMultiplication.filter( alreadyPushedKey => alreadyPushedKey != key.key);
            }

            switch (key.key) {
                case "a" :
                    this.game.fire("a_up");
                    break;
            }
        });
    }
}

export {Inputs_manager}