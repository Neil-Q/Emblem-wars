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
            wait : false,
        }

        this.buttons = [];
        this.currentSelected = 0

        this.mapX = undefined;
        this.mapY = undefined;

        this.xOrigin = undefined;
        this.yOrigin = undefined;

        this.width = 84;
        this.height = null;
    }

    build(mapX, mapY, attack = false, wait = false) {
        this.reset()
        this.setPossibleChoices(attack, wait)
        
        let menu = this;
        let parts = this.spriteParts;
        let height = 0;
        
        height += parts.topBorder.height;
        Object.keys(menu.choices).forEach(choice => {
            if (menu.choices[choice] == false) return
            height += parts.bodySection.height;
            
            let button = {
                name        : choice,
                yOrigin     : 4 + ((menu.buttons.length) * parts.bodySection.height)
            }
            
            menu.buttons.push(button);
        })
        height += parts.bottomBorder.height;
        
        this.height = height;
        this.setOrigin(mapX, mapY);
        this.currentSelected = 0;
    }

    clicked() {
        let button = this.getButtonFromPosition(this.game.pointer.mouseX, this.game.pointer.mouseY);

        if (button != undefined) this.game.fire(this.buttons[this.currentSelected].name);

        return true;
    }

    fire(event, datas = null) {
        let response = false;

        switch (event) {
            case "a" :
            case "enter" :
                this.game.fire(this.buttons[this.currentSelected].name);
                response = true;
                break;

            case "arrowDown" :
                this.updateSelectedButton("down");
                response = true;
                break;

            case "arrowUp" :
                this.updateSelectedButton("up");
                response = true;
                break;

            case "click" : 
                response = this.clicked(datas);
                break;

            case "mouseMove" :
                this.updateSelectedButton();
                break;
        }

        return response;
    }

    getButtonFromPosition(globalX, globalY) {
        let zoom = this.game.zoom;
        let relativeX = globalX - (this.xOrigin + 4);
        let relativeY = globalY - (this.yOrigin + 4);

        let buttonIndex = undefined;

        // Verify if in the right x range
        if (relativeX < (4 * zoom) || relativeX > (this.width - 4) * zoom) return;

        // Then the right Y range for each button
        this.buttons.forEach((button, index) => {
            if (relativeY < (button.yOrigin * zoom) || relativeY > (button.yOrigin + 13) * zoom) return;

            buttonIndex = index;
        });

        return buttonIndex;
    }

    render(ctx, zoom) {
        let parts = this.spriteParts;

        let xOrigin = this.xOrigin
        let yOrigin = this.yOrigin

        let ybuilder = yOrigin;

        // draw top border
        ctx.drawImage(this.spriteSheet, 0, parts.topBorder.yOrigin, this.width, parts.topBorder.height, xOrigin, ybuilder, this.width * zoom, parts.topBorder.height * zoom);
        ybuilder += (parts.topBorder.height * zoom);

        // render choices
        this.buttons.forEach( (button, index) => {
            // render background
            ctx.drawImage(this.spriteSheet, 0, parts.bodySection.yOrigin, this.width, parts.bodySection.height, xOrigin, ybuilder, this.width * zoom, parts.bodySection.height * zoom);

            // Render either selected or selected sprite version
            if (index == this.currentSelected) {
                ctx.drawImage(this.spriteSheet, 0, parts[button.name + "Selected"].yOrigin, this.width, 19, xOrigin, ybuilder, this.width * zoom, 19 * zoom);
                ctx.drawImage(this.spriteSheet, 0, parts.arrow.yOrigin, this.width, 19, xOrigin, ybuilder, this.width * zoom, 19 * zoom);
            }
            else {
                ctx.drawImage(this.spriteSheet, 0, parts[button.name].yOrigin, this.width, 19, xOrigin, ybuilder, this.width * zoom, 19 * zoom);
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

    setPossibleChoices(attack, wait) {
        this.choices.attack = attack;
        this.choices.wait = wait;
        //this.choices.harmonize = harmonize;
    }

    setOrigin(mapX, mapY) {
        this.mapX = mapX;
        this.mapY = mapY;

        let zoom = this.game.zoom;
        let xOrigin = this.mapX * 16 * zoom;
        let yOrigin = Math.ceil((this.mapY * 16 * zoom) - (16 * zoom / 2) - (this.height / 2 * zoom));

        this.mapX < (this.game.map.gridWidth / 2) + 1  ? xOrigin += (2 * zoom) : xOrigin -= (18 * zoom + this.width * zoom);

        this.xOrigin = xOrigin;
        this.yOrigin = yOrigin;
    }

    updateSelectedButton(direction = null) {
        if (direction == "up" && this.currentSelected > 0) return this.currentSelected -= 1;
        if (direction == "down" && this.currentSelected < this.buttons.length - 1) return this.currentSelected += 1;

        let targetedButton = this.getButtonFromPosition(this.game.pointer.mouseX, this.game.pointer.mouseY);
        if (targetedButton !== undefined) this.currentSelected = targetedButton;
    }
}

export { Map_action_choice_menu };