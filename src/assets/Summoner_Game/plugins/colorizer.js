class Colorizer {
    constructor() {
        this.palettes = {
            red : {
                extraLight  : [250, 250, 250],
                lighter     : [255, 153, 103],
                light       : [240,   3,   4],
                normal      : [200,   6,   6],
                dark        : [166,   1,   1],
                darker      : [105,  20,  35],
                extraDark   : [ 57,  14,  10],

                complementary  : "dark",
                complementary2 : "scarlet",
            },
            blue : {
                extraLight  : [250, 250, 250],
                lighter     : [ 98, 190, 255],
                light       : [ 29, 129, 228],
                normal      : [ 51,  94, 176],
                dark        : [ 62,  61, 117],
                darker      : [ 40,  40,  72],
                extraDark   : [ 29,  26,  44],

                complementary  : "sky",
                complementary2 : "lightBrown"
            },
            green : {
                extraLight  : [250, 250, 250],
                lighter     : [207, 219,  86],
                light       : [171, 203,   5],
                normal      : [119, 170,   8],
                dark        : [ 74, 118,  10],
                darker      : [ 51,  81,  37],
                extraDark   : [ 36,  49,  46],

                complementary  : "lightBrown",
                complementary2 : "???"
            },
            yellow : {
                extraLight  : [250, 250, 250],
                lighter     : [252, 243, 197],
                light       : [247, 216,  99],
                normal      : [211, 156,  54],
                dark        : [172, 103,  34],
                darker      : [128,  66,  36],
                extraDark   : [100,  51,  34],

                complementary  : "???",
                complementary2 : "???"
            },
            purple : {
                extraLight  : [250, 250, 250],
                lighter     : [236, 127, 225],
                light       : [188,  71, 214],
                normal      : [130,  39, 180],
                dark        : [ 90,  29, 126],
                darker      : [ 61,  23,  80],
                extraDark   : [ 35,  16,  50],

                complementary  : "???",
                complementary2 : "???"
            },
            pink : {
                extraLight  : [250, 250, 250],
                lighter     : [245, 141, 139],
                light       : [255,  40, 180],
                normal      : [189,   0, 164],
                dark        : [139,   8, 123],
                darker      : [ 90,  16,  90],
                extraDark   : [ 41,   8,  49],

                complementary  : "???",
                complementary2 : "???"
            },
            orange : {
                extraLight  : [250, 250, 250],
                lighter     : [255, 178,  74],
                light       : [255, 117,  24],
                normal      : [205,  76,  24],
                dark        : [148,  48,  24],
                darker      : [106,  28,  24],
                extraDark   : [ 60,  12,  17],

                complementary  : "???",
                complementary2 : "???"
            },
            dark : {
                extraLight  : [250, 250, 250],
                lighter     : [119, 108, 146],
                light       : [ 95,  77, 114],
                normal      : [ 70,  50,  76],
                dark        : [ 49,  32,  47],
                darker      : [ 31,  20,  26],
                extraDark   : [ 17,  11,  13],

                complementary  : "???",
                complementary2 : "???"
            },
            crimson : {
                extraLight  : [250, 250, 250],
                lighter     : [245, 108,  73],
                light       : [224,   0,  49],
                normal      : [170,   0,  63],
                dark        : [131,   6,  51],
                darker      : [ 92,  17,  30],
                extraDark   : [ 60,  12,  17],

                complementary  : "dark",
                complementary2 : "scarlet",
            },
        }

        this.compositor = document.createElement("canvas");
        this.ctx = this.compositor.getContext("2d");

        this.temp
    }

    async colorize(img, colorName, xOrigin = 0, yOrigin = 0, width = img.width, height = img.height) {
        let compositor = this.compositor;
        let ctx = this.ctx;

        let imageData = this.precompose(img, xOrigin, yOrigin, width, height);
        let datas = imageData.data;
        let color = this.palettes[colorName];

        for (let i = 0; i < datas.length; i += 4) {
            if (datas[i+3] == 0) continue;
            let redValue = datas[i];

            if (datas[i+1] + datas[i+2] == 0) {

                if (redValue == 160) {
                    datas[i] = color.normal[0];
                    datas[i+1] = color.normal[1];
                    datas[i+2] = color.normal[2];
                    continue;
                }

                

                if (redValue == 130) {
                    datas[i] = color.dark[0];
                    datas[i+1] = color.dark[1];
                    datas[i+2] = color.dark[2];
                    continue;
                }

                if (redValue == 190) {
                    datas[i] = color.light[0];
                    datas[i+1] = color.light[1];
                    datas[i+2] = color.light[2];
                    continue;
                }



                if (redValue == 100) {
                    datas[i] = color.darker[0];
                    datas[i+1] = color.darker[1];
                    datas[i+2] = color.darker[2];
                    continue;
                }

                if (redValue == 220) {
                    datas[i] = color.lighter[0];
                    datas[i+1] = color.lighter[1];
                    datas[i+2] = color.lighter[2];
                    continue;
                }



                if (redValue == 70) {
                    datas[i] = color.extraDark[0];
                    datas[i+1] = color.extraDark[1];
                    datas[i+2] = color.extraDark[2];
                    continue;
                }

                if (redValue == 250) {
                    datas[i] = color.extraLight[0];
                    datas[i+1] = color.extraLight[1];
                    datas[i+2] = color.extraLight[2];
                    continue;
                }

                continue;
            }
        }

        ctx.clearRect(0, 0, compositor.width, compositor.height);
        ctx.putImageData(imageData, 0, 0);

        let done = false;
        let colorizedSprite = new Image;
        colorizedSprite.onload = () => {done = true};
        colorizedSprite.src = compositor.toDataURL();

        async function wait() {
            let check = setTimeout(() => {
                if (done) return true
                return check
            }, 1);

            return check
        }

        await wait();

        return colorizedSprite;
    }

    precompose(img, xOrigin, yOrigin, width, height) {
        let compositor = this.compositor;
        let ctx = this.ctx;
        
        compositor.width = width;
        compositor.height = height;
        
        ctx.clearRect(0, 0, compositor.width, compositor.height);
        ctx.drawImage(img, xOrigin, yOrigin, width, height, 0, 0, width, height);

        let imageData = ctx.getImageData(0, 0, compositor.width, compositor.height);
        return imageData;
    }

    async toTransparent(img, red = 255, green = 255, blue = 255, xOrigin = 0, yOrigin = 0, width = img.width, height = img.height) {
        let compositor = this.compositor;
        let ctx = this.ctx;

        let imageData = this.precompose(img, xOrigin, yOrigin, width, height);
        let datas = imageData.data;
        let isTransparencyWhite = red + green + blue == 255 * 3 ? true : false;

        for (let i = 0; i < datas.length; i += 4) {
            let totalValue = datas[i] + datas[i+1] + datas[i+2];
            
            if (!isTransparencyWhite) {
                if (datas[i] == red && datas[i+1] == green && datas[1+2] == blue) datas[i + 3] = 0;
                continue;
            }

            if (totalValue == 255 * 3) datas[i + 3] = 0;
        }

        ctx.clearRect(0, 0, compositor.width, compositor.height);
        ctx.putImageData(imageData, 0, 0);

        let done = false;
        let cleanedSprite = new Image;
        cleanedSprite.onload = () => {done = true};
        cleanedSprite.src = compositor.toDataURL();

        async function wait() {
            let check = setTimeout(() => {
                if (done) return true
                return check
            }, 1);

            return check
        }

        await wait();

        return cleanedSprite;
    }
}

export { Colorizer };