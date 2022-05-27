class Fight_stats_panel {
    constructor(game) {
        this.game = game;

        this.builded = false;

        this.spriteSheet = new Image;
        this.spriteSheet.src = require("./sprites/fight_stats_panel.png");

        this.teamsParts = [];

        this.spriteParts = {
            frame : {
                x : 0,
                y : 0,
                width : 115,
                height : 151
            },

            teamsParts : {
                x : 0,
                y : 160,
                width : 232,
                height : 148,
            },

            attackerPart : {
                x : 0,
                y : 0,

                width   : 112,
                height  : 114,

                weaponEmplacement : {
                    x : 6,
                    y : 9
                },

                nameEmplacement : {
                    x : 43,
                    y : 25
                }
            },
            defenderPart : {
                x : 120,
                y : 0,

                width   : 112,
                height  : 148,

                weaponEmplacement : {
                    x : 89,
                    y : 121
                },

                nameEmplacement : {
                    x : 15,
                    y : 137
                }
            },


            swordIcon : {
                x : 120,
                y : 21,
                width : 19,
                height : 19
            },
            lanceIcon : {
                x : 141,
                y : 0,
                width : 19,
                height : 19
            },
            axeIcon : {
                x : 162,
                y : 1,
                width : 19,
                height : 19
            },


            bonusIcon : {
                x : 120,
                y : 80,
                width : 9,
                height : 14
            },
            malusIcon : {
                x : 130,
                y : 80,
                width : 19,
                height : 19
            },
            doubleBonusIcon : {
                x : 120,
                y : 95,
                width : 9,
                height : 14
            },
            doubleMalusIcon : {
                x : 130,
                y : 95,
                width : 19,
                height : 19
            }
        }

        this.width = this.spriteParts.frame.width;
        this.height = this.spriteParts.frame.height;

        this.compositor = document.createElement("canvas");
        this.compositor.width = this.width;
        this.compositor.height = this.height;

        this.panel = new Image;
    }

    async buildSpriteSheets() {
        let self = this;
        console.time("trans + color");

        // Add transparency
        self.spriteSheet = await self.game.colorizer.toTransparent(self.spriteSheet);

        // Colorize panels by teams
        let numberOfTeams = self.game.teams_manager.getNumberOfTeams();
        for(let i = 0; i < numberOfTeams; i++) {
            let colorCode = self.game.teams_manager.getTeamColorCode(i + 1);
            let teamsParts = self.spriteParts.teamsParts;

            let teamPanel = await self.game.colorizer.colorize(self.spriteSheet, colorCode, teamsParts.x, teamsParts.y, teamsParts.width, teamsParts.height);
            self.teamsParts.push(teamPanel);
        }
        console.timeEnd("trans + color");

        return this.builded = true;
    }

    drawFrame(ctx) {
        let frame = this.spriteParts.frame;
        ctx.drawImage(this.spriteSheet, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);

        let stats = ["PV", "Dégats", "Précision", "Critiques", "Atq. bonus"];

        let middleX = 57;
        let startY = 34;
        let step = 14;

        ctx.fillStyle = this.game.renderer.colorPalette.menu_text_dark.rgb;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        for (let i = 1; i < stats.length + 1 ; i++) {

            let width = ctx.measureText(stats[i - 1]).width;
            let startX = Math.ceil(middleX - width / 2);

            ctx.fillText(stats[i - 1], startX, startY + step * i);
        }
    }

    drawParts(ctx, attackerStats, defenderStats) {
        ctx.fillStyle = this.game.renderer.colorPalette.menu_text_light.rgb;
        ctx.textBaseline = "alphabetic";

        // Attacker base
        let attackerPartSprite = this.teamsParts[attackerStats.team - 1]
        let attackerPart = this.spriteParts.attackerPart;

        ctx.drawImage(attackerPartSprite, attackerPart.x, attackerPart.y, attackerPart.width, attackerPart.height, 0, 0, attackerPart.width, attackerPart.height);
        ctx.fillText(attackerStats.name, attackerPart.nameEmplacement.x, attackerPart.nameEmplacement.y);


        // Defender base
        let defenderPartSprite = this.teamsParts[defenderStats.team - 1]
        let defenderPart = this.spriteParts.defenderPart;

        ctx.drawImage(defenderPartSprite, defenderPart.x, defenderPart.y, defenderPart.width, defenderPart.height, 0, 0, defenderPart.width, defenderPart.height);
        ctx.fillText(defenderStats.name, defenderPart.nameEmplacement.x, defenderPart.nameEmplacement.y);


        // Stats
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        let attackerMiddleLine = 99;
        let defenderMiddleLine = 16;
        let startY = 48;
        let step = 14;

        let width = ctx.measureText(defenderStats.currentHP).width;
        ctx.fillText(defenderStats.currentHP, Math.ceil(defenderMiddleLine - (width/2)), startY);
        width = ctx.measureText(attackerStats.currentHP).width;
        ctx.fillText(attackerStats.currentHP, Math.ceil(attackerMiddleLine - (width/2)), startY);

        // need fight_manager

        width = ctx.measureText("--").width;
        let blank = "--";

        // Damages
        ctx.fillText(blank, Math.ceil(defenderMiddleLine - (width/2)), startY + step);
        ctx.fillText(blank, Math.ceil(attackerMiddleLine - (width/2)), startY + step);

        // precision
        ctx.fillText(blank, Math.ceil(defenderMiddleLine - (width/2)), startY + step * 2);
        ctx.fillText(blank, Math.ceil(attackerMiddleLine - (width/2)), startY + step * 2);

        // critics
        ctx.fillText(blank, Math.ceil(defenderMiddleLine - (width/2)), startY + step * 3);
        ctx.fillText(blank, Math.ceil(attackerMiddleLine - (width/2)), startY + step * 3);

        // bonus atq
        ctx.fillText(blank, Math.ceil(defenderMiddleLine - (width/2)), startY + step * 4);
        ctx.fillText(blank, Math.ceil(attackerMiddleLine - (width/2)), startY + step * 4);

    }

    drawWeapons(ctx, attackerWeaponType, defenderWeaponType) {
        let atkWeapon = this.spriteParts[attackerWeaponType + "Icon"];
        let atkEmplacement = this.spriteParts.attackerPart.weaponEmplacement;

        let defWeapon = this.spriteParts[defenderWeaponType + "Icon"];
        let defEmplacement = this.spriteParts.defenderPart.weaponEmplacement;

        ctx.drawImage(this.spriteSheet, atkWeapon.x, atkWeapon.y, atkWeapon.width, atkWeapon.height, atkEmplacement.x, atkEmplacement.y, atkWeapon.width, atkWeapon.height);
        ctx.drawImage(this.spriteSheet, defWeapon.x, defWeapon.y, defWeapon.width, defWeapon.height, defEmplacement.x, defEmplacement.y, defWeapon.width, defWeapon.height);

    }

    async build(attackerStats, defenderStats) {
        if (this.builded == false) await this.buildSpriteSheets();

        let ctx = this.compositor.getContext("2d");
        ctx.clearRect(0, 0, this.compositor.width, this.compositor.height);
        ctx.font = "9px summonerPixel";

        this.drawFrame(ctx);
        this.drawParts(ctx, attackerStats, defenderStats);
        this.drawWeapons(ctx, attackerStats.weapons, defenderStats.weapons);

        this.panel.src = this.compositor.toDataURL();

        return true
    }

    render(ctx, zoom) {
        let xOrigin = Math.round(this.game.renderer.canvas.width / 4 - this.panel.width /2);
        if (this.game.pointer.mapX < this.game.map.gridWidth /2) xOrigin += (this.game.canvas.width / 2) - this.panel.width;

        let yOrigin = Math.round(this.game.renderer.canvas.height / 4 - this.panel.height /2)


        ctx.drawImage(this.panel, xOrigin, yOrigin, this.width * zoom, this.height * zoom);
    }
}

export { Fight_stats_panel }