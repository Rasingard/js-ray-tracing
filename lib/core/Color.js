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

    static sample4(color1, color2, color3, color4) {
        return new Color(
            Math.floor((color1.r * 0.25) + (color2.r * 0.25) + (color3.r * 0.25) + (color4.r * 0.25)),
            Math.floor((color1.g * 0.25) + (color2.g * 0.25) + (color3.g * 0.25) + (color4.g * 0.25)),
            Math.floor((color1.b * 0.25) + (color2.b * 0.25) + (color3.b * 0.25) + (color4.b * 0.25)),
        );
    }

    getCopy() {
        return new Color(this.r, this.g, this.b);
    }

    set(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
    }

    setBit(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
    }

    static darkenC(t, b) { return Math.min(t, b); }
    darken(color) {
        this.r = Color.darkenC(color.r, this.r);
        this.g = Color.darkenC(color.g, this.g);
        this.b = Color.darkenC(color.b, this.b);
        return this;
    }

    static lightenC(t, b) { return Math.max(t, b); }
    lighten(color) {
        this.r = Color.lightenC(color.r, this.r);
        this.g = Color.lightenC(color.g, this.g);
        this.b = Color.lightenC(color.b, this.b);
        return this;
    }

    invert() {
        this.r = 255 - this.r;
        this.g = 255 - this.g;
        this.b = 255 - this.b;
        return this;
    }

    getInverted() {
        return new Color(
            255 - this.r,
            255 - this.g,
            255 - this.b
        );
    }

    static screenC(t, b) { return Math.floor(255 - ((255 - t) * (255 - b))); }
    screen(color) {
        this.r = Color.screenC(color.r, this.r);
        this.g = Color.screenC(color.g, this.g);
        this.b = Color.screenC(color.b, this.b);
        return this;
    }

    static blendC(t, b, o) { return Math.floor((b * (1 - o)) + (t * o)); }
    blend(color, opacity) {
        this.r = Color.blendC(color.r, this.r, opacity);
        this.g = Color.blendC(color.g, this.g, opacity);
        this.b = Color.blendC(color.b, this.b, opacity);
        return this;
    }

    static burnC(t, b) { return Math.floor(255 - (255 - t) / b); }
    burn(color) {
        this.r = Color.burnC(color.r, this.r);
        this.g = Color.burnC(color.g, this.g);
        this.b = Color.burnC(color.b, this.b);
        return this;
    }

    static dodgeC(t, b) { return Math.floor(t / (255 - b)); }
    dodge(color) {
        this.r = Color.dodgeC(color.r, this.r);
        this.g = Color.dodgeC(color.g, this.g);
        this.b = Color.dodgeC(color.b, this.b);
        return this;
    }

    static vividC(t, b) { return b > 127 ? this.burnC(t, b) : this.dodgeC(t, b); }
    vivid(color) {
        this.r = Color.vividC(color.r, this.r);
        this.g = Color.vividC(color.g, this.g);
        this.b = Color.vividC(color.b, this.b);
        return this;
    }

    static multiplyC(t, b) { return Math.floor((t / 255) * (b / 255) * 255); }
    multiply(color) {
        this.r = Color.multiplyC(color.r, this.r);
        this.g = Color.multiplyC(color.g, this.g);
        this.b = Color.multiplyC(color.b, this.b);
        return this;
    }

    add(color, perc) {
        this.r += Math.min(color.r * perc, 255);
        this.g += Math.min(color.g * perc, 255);
        this.b += Math.min(color.b * perc, 255);
        return this;
    }

    luminosity() {
        return (0.299 * this.r) + (0.587 * this.g) + (0.114 * this.b)
    }
}