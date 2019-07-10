class Image2D {
    constructor(height, width) {
        this.data = new Uint8ClampedArray(height * width);
        this.height = height;
        this.width = width;
    }

    static noise(height, width, min, max) {
        const imgData = new Image2D(nh, nw);

        this.each(
            (color) => {
                color.setBit(
                    Math.min(
                        Math.max(
                            Math.floor(
                                Core.ran(min, max)
                            ),
                            0
                        ), 
                        255
                    )
                ) 
            }
        );

        return imgData;
    }

    static eachImageData(imageData, fn) {
        let c;

        for(let i = 0, len = imageData.data.length; i < len; i += 4) {
            c = new Color( imageData.data[i], imageData.data[i + 1], imageData.data[i + 2] );
            fn(c);

            imageData.data[i]     = c.r;
            imageData.data[i + 1] = c.g;
            imageData.data[i + 2] = c.b;
        }

        return this;
    }

    each(fn) {
        let c;

        for(let i = 0, len = this.data.length; i < len; i += 3) {
            c = new Color( this.data[i], this.data[i + 1], this.data[i + 2] );
            fn(c);

            this.data[i]     = c.r;
            this.data[i + 1] = c.g;
            this.data[i + 2] = c.b;
        }

        return this;
    }

    darken(color) {
        this.each(
            (c) => c.darken(color)
        );
    }

    lighten() { }

    invert() {
        this.each(
            (c) => c.invert()
        );
    }

    screen() { }

    blend(img, opacity) { }

    static blendImageDatas(imgD1, imgD2, fn) {
        const out = new ImageData(imgD1.width, imgD1.height);
        let cout;
        for(let i = 0, len = imgD1.data.length; i < len; i += 4) {
            cout = fn(
                new Color(imgD1.data[i], imgD1.data[i + 1], imgD1.data[i + 2]),
                new Color(imgD2.data[i], imgD2.data[i + 1], imgD2.data[i + 2]),
            );
            out.data[i]     = cout.r;
            out.data[i + 1] = cout.g;
            out.data[i + 2] = cout.b;
            out.data[i + 3] = 255;
        }

        return out;
    }

    burn() { }

    dodge() { }

    vivid() { }

    multiply() { }
}