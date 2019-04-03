class LightSource {
    constructor(color, location, intensity, range) { }
}

class AmbientLight {
    constructor(color, intensity) {
        const buffer = new SharedArrayBuffer(11);
        const view = new DataView(buffer);

        this.setColorR = (val) => view.setUint8(0, val);
        this.setColorG = (val) => view.setUint8(1, val);
        this.setColorB = (val) => view.setUint8(2, val);
        this.setColor = (color) => {
            this.setColorR(color.r);
            this.setColorG(color.g);
            this.setColorB(color.b);
        }

        this.getColorR = () => view.getUint8(0);
        this.getColorG = () => view.getUint8(1);
        this.getColorB = () => view.getUint8(2);
        this.getColor = () => {
            return new Color(
                this.getColorR(),
                this.getColorG(),
                this.getColorB(),
            );
        }

        this.getIntensity = () => view.getFloat64(3);
        this.setIntensity = (val) => view.setFloat64(3, val);

        this.getBuffer = () => buffer;

        this.setColor(color);
        this.setIntensity(intensity);
    }
}

class GlobalLight {
    constructor(color, intensity, vector) {
        const buffer = new SharedArrayBuffer(35);
        const view = new DataView(buffer);

        this.setColorR = (val) => view.setUint8(0, val);
        this.setColorG = (val) => view.setUint8(1, val);
        this.setColorB = (val) => view.setUint8(2, val);
        this.setColor = (color) => {
            this.setColorR(color.r);
            this.setColorG(color.g);
            this.setColorB(color.b);
        }

        this.getColorR = () => view.getUint8(0);
        this.getColorG = () => view.getUint8(1);
        this.getColorB = () => view.getUint8(2);
        this.getColor = () => {
            return new Color(
                this.getColorR(),
                this.getColorG(),
                this.getColorB(),
            );
        }

        this.getIntensity = () => view.getFloat64(3);
        this.setIntensity = (val) => view.setFloat64(3, val);

        this.getDirectionX = () => view.getFloat64(11);
        this.getDirectionY = () => view.getFloat64(19);
        this.getDirectionZ = () => view.getFloat64(27);

        this.setDirectionX = (val) => view.setFloat64(11, val);
        this.setDirectionY = (val) => view.setFloat64(19, val);
        this.setDirectionZ = (val) => view.setFloat64(27, val);

        this.getDirection = () => {
            return new Vector(
                this.getDirectionX(),
                this.getDirectionY(),
                this.getDirectionZ(),
            );
        }

        this.setDirection = (vector) => {
            this.setDirectionX(vector.x);
            this.setDirectionY(vector.y);
            this.setDirectionZ(vector.z);
        }

        this.getBuffer = () => buffer;

        this.setColor(color);
        this.setIntensity(intensity);
        this.setDirection(vector);
    }
}