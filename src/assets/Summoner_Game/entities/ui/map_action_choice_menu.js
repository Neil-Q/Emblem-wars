class Map_action_choice_menu {
    constructor(game, ui_manager) {
        this.game = game;
        this.ui_manager = ui_manager;

        this.spriteSheet = new Image;
        this.spriteSheet.src = require("./sprites/map_action_choice_menu.png");

        this.spriteParts = {
            topBorder : {
                yOrigin     : 0,
                height      : 4,
            },

            bodySection : {
                yOrigin     : 20,
                height      : 14,
            },

            bottomBorder : {
                yOrigin     : 40,
                height      : 3,
            },

            arrow : {
                yOrigin     : 60,
                heigh       : 11,
            },

            attack : {
                yOrigin     : 80,
                heigh       : 13,
            },

            attackSelected : {
                yOrigin     : 100,
                heigh       : 13,
            },

            harmonize : {
                yOrigin     : 120,
                heigh       : 13,
            },

            harmonizeSelected : {
                yOrigin     : 140,
                heigh       : 13,
            },

            wait : {
                yOrigin     : 160,
                heigh       : 13,
            },

            waitSelected : {
                yOrigin     : 180,
                heigh       : 13,
            },

        }

        this.choices = {
            attack : false,
            harmonize : false,
            wait : true,
        }

        this.currentSelected = "wait";

        this.mapX = undefined;
        this.mapY = undefined;

        this.width = 84;
        this.height = null;

        this.buttons = [];
    }

    build(mapX, mapY, attack = false, harmonize = false) {
        this.reset()

        this.setOrigin(mapX, mapY);
        this.setPossibleChoices(attack, harmonize)

        let menu = this;
        let parts = this.spriteParts;
        let height = 0;

        height += parts.topBorder.height;
        height += parts.bottomBorder.height;
        Object.keys(menu.choices).forEach(choice => {
            if (menu.choices[choice] == false) return
            height += parts.bodySection.height;
            
            let button = {
                name        : choice,
                yOrigin     : 4 + ((menu.buttons.length) * parts.bodySection.height)
            }

            menu.buttons.push(button);
        })

        this.height = height;
    }

    clicked(datas = null) {
        let button = this.getButton(datas.x, datas.y);

        if (button) this.game.fire(button);

        return true;
    }

    fire(event, datas = null) {
        let response = false;

        switch (event) {
            case "click" : {
                response = this.clicked(datas);
            }
        }

        return response;
    }

    getButton(globalX, globalY) {
        let zoom = this.game.zoom;
        let relativeX = globalX - (this.mapX * 16 * zoom + 2 * zoom);
        let relativeY = globalY - Math.ceil((this.mapY * 16 * zoom) - (16 * zoom / 2) - (this.height / 2 * zoom));

        let buttonClicked = false;

        if (relativeX < (4 * zoom) || relativeX > (this.width - 4) * zoom) return false;

        this.buttons.forEach(button => {
            if (relativeY < (button.yOrigin * zoom) || relativeY > (button.yOrigin + 13) * zoom) return false;

            buttonClicked = button.name;
        });

        return buttonClicked;
    }

    render(ctx, zoom) {
        let menu = this;
        let parts = this.spriteParts;

        this.updateSelection();

        let xOrigin = this.mapX * 16 * zoom + 2 * zoom;
        let yOrigin = Math.ceil((this.mapY * 16 * zoom) - (16 * zoom / 2) - (this.height / 2 * zoom));

        let ybuilder = yOrigin;

        // draw top border
        ctx.drawImage(this.spriteSheet, 0, parts.topBorder.yOrigin, this.width, parts.topBorder.height, xOrigin, ybuilder, this.width * zoom, parts.topBorder.height * zoom);
        ybuilder += (parts.topBorder.height * zoom);

        // render choices
        Object.keys(menu.choices).forEach(choice => {
            if (menu.choices[choice] == false) return 
            ctx.drawImage(this.spriteSheet, 0, parts.bodySection.yOrigin, this.width, parts.bodySection.height, xOrigin, ybuilder, this.width * zoom, parts.bodySection.height * zoom);

            if (menu.currentSelected == choice) {
                ctx.drawImage(this.spriteSheet, 0, parts[choice + "Selected"].yOrigin, this.width, 19, xOrigin, ybuilder, this.width * zoom, 19 * zoom);
                ctx.drawImage(this.spriteSheet, 0, parts.arrow.yOrigin, this.width, 19, xOrigin, ybuilder, this.width * zoom, 19 * zoom);
            }
            else {
                ctx.drawImage(this.spriteSheet, 0, parts[choice].yOrigin, this.width, 19, xOrigin, ybuilder, this.width * zoom, 19 * zoom);
            }

            ybuilder += (parts.bodySection.height * zoom)
        })

        // render bottom border
        ctx.drawImage(this.spriteSheet, 0, parts.bottomBorder.yOrigin, this.width, parts.bottomBorder.height, xOrigin, ybuilder, this.width * zoom, parts.bottomBorder.height * zoom);
    }

    reset() {
        this.choices = {
            attack : false,
            harmonize : false,
            wait : true,
        }

        this.mapX = undefined;
        this.mapY = undefined;

        this.height = null;

        this.buttons = [];
    }

    setPossibleChoices(attack, harmonize) {
        this.choices.attack = attack;
        this.choices.harmonize = harmonize;
    }

    setOrigin(mapX, mapY) {
        this.mapX = mapX;
        this.mapY = mapY;
    }

    updateSelection() {
        let targetedButton = this.getButton(this.game.pointer.mouseX, this.game.pointer.mouseY);
        if (targetedButton) this.currentSelected = targetedButton;
    }
}

export { Map_action_choice_menu };