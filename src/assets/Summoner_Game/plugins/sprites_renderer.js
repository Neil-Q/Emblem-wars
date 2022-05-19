class Sprites_renderer {
    constructor(game) {
        this.game = game;
        this.canvas = this.game.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.zoom = game.zoom;

        this.units_manager = game.units_manager;

        this.spritesSheets = {
        }
    }

    /*composeSpriteColor(sprite, color = 120) {
        console.log(this.compositorCanvas);
        //this.compositorCanvas.height = 16;
        //this.compositorCanvas.width = 16;

        this.compositorCtx.drawImage(sprite, 16, 0, 16, 16, 0, 0, 16, 16);
        let spriteBase = this.compositorCtx.getImageData(0, 0, 16, 16);
        let data = spriteBase.data;

        function HSVtoRGB(h, s, v) {
            let r, g, b, i, f, p, q, t;
            if (arguments.length === 1) {
                s = h.s, v = h.v, h = h.h;
            }
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        } 

        for (let i = 0; i < data.length; i += 4) {
            if (data[i+4] != 0) {

                let value = (data[i] + data[i+1] + data[i+2]) / 3 / 255;
                let rgbValue = HSVtoRGB(color / 360, 1, value);
    
                data[i] = rgbValue.r;
                data[i+1] = rgbValue.g;
                data[i+2] = rgbValue.b;
            }
        }

        this.compositorCtx.clearRect(0, 0, 16, 16);
        this.compositorCtx.putImageData(spriteBase, 0 ,0);

        let spriteImage = new Image();
        spriteImage.src = this.compositorCanvas.toDataURL();
        console.log(spriteImage);
        return spriteImage;
    }*/

    renderUnit(unit) {
        let color = this.game.teams_manager.getTeamColorCode(unit.team);
        let sprite = this.spritesSheets[unit.codeName + "_map_" + color];
        if (!sprite || sprite == "loading") return;

        let xOrigin = (unit.posX - 1) * 16 * this.zoom - 4 * this.zoom;
        let yOrigin = (unit.posY - 1) * 16 * this.zoom - 8 * this.zoom;

        this.ctx.drawImage(sprite, 0, 0, 24, 24, xOrigin, yOrigin, 24 * this.zoom, 24 * this.zoom);

        let mask = this.spritesSheets[unit.codeName + "_map_mask"];
        
        if (this.game.turns_manager.getTeamTurn() != unit.team) {

            if (!this.game.turns_manager.isReady(unit.id)) {
                this.ctx.globalAlpha = 0.8;
                this.ctx.drawImage(mask, 0, 24, 24, 24, xOrigin, yOrigin, 24 * this.zoom, 24 * this.zoom);

                this.ctx.globalAlpha = 1;
                return
            }

            this.ctx.globalAlpha = 0.4;
            this.ctx.drawImage(mask, 0, 24, 24, 24, xOrigin, yOrigin, 24 * this.zoom, 24 * this.zoom);

            this.ctx.globalAlpha = 1;
            return
        }

        if (!this.game.turns_manager.isReady(unit.id)) {
            this.ctx.globalAlpha = 0.4;
            this.ctx.drawImage(mask, 0, 0, 24, 24, xOrigin, yOrigin, 24 * this.zoom, 24 * this.zoom);

            this.ctx.globalAlpha = 1;
        }
    }

    loadMapSpriteSheet(codeName, color) {
        let spritesSheets = this.spritesSheets;

        if (!spritesSheets[codeName + "_map_mask"]) {
            spritesSheets[codeName + "_map_mask"] = "loading";

            let newMaskSheet = new Image();
            newMaskSheet.onload = () => {
                spritesSheets[codeName + "_map_mask"] = newMaskSheet;
            }
            newMaskSheet.src = require("../entities/units/sprites/" + codeName + "_map_mask.png");
        }

        if (!spritesSheets[codeName + "_map_" + color]) {
            spritesSheets[codeName + "_map_" + color] = "loading";

            let newSheet = new Image();
            newSheet.onload = () => {
                spritesSheets[codeName + "_map_" + color] = newSheet;
            }
            newSheet.src = require("../entities/units/sprites/" + codeName + "_map_" + color + ".png");
        }
        
    }

    loadFightingSpriteSheet(name) {
        if (this.spritesSheets[name]) return console.log(this.spritesSheets[name]);
        
        this.spritesSheets[name] = "loading";

        let newSheet = new Image();
        let spritesSheets = this.spritesSheets;

        newSheet.onload = () => {
            spritesSheets[name] = newSheet;
        }
        newSheet.src = require("../entities/units/sprites/" + name + ".png");
    }
}

export {Sprites_renderer};