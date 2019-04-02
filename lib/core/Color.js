class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;

        /*
        color
        - r - 8bit
        - g - 8bit
        - b - 8bit
        */
    }

    getCopy() {
        return new Color(this.r, this.g, this.b);
    }

    blend(color, opacity) {
        this.r = (this.r * (1 - opacity)) + (color.r * opacity);
        this.g = (this.g * (1 - opacity)) + (color.g * opacity);
        this.b = (this.b * (1 - opacity)) + (color.b * opacity);
        return this;
    }
}