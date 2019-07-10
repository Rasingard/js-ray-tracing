class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
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

    static blendC(t, b, a) { return Math.round((b * (1 - a)) + (t * a)); }
    blend(color, a) {
        this.r = Color.blendC(color.r, this.r, a);
        this.g = Color.blendC(color.g, this.g, a);
        this.b = Color.blendC(color.b, this.b, a);
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

    static multiplyC(t, b) { return Math.round(t * b / 255); }
    multiply(color) {
        this.r = Color.multiplyC(color.r, this.r);
        this.g = Color.multiplyC(color.g, this.g);
        this.b = Color.multiplyC(color.b, this.b);
        return this;
    }

    static multiplyCAlpha(t, b, a) { return Math.round(t * (b * a) / 255); }
    multiplyAlpha(color, a) {
        this.r = Color.multiplyCAlpha(color.r, this.r, a);
        this.g = Color.multiplyCAlpha(color.g, this.g, a);
        this.b = Color.multiplyCAlpha(color.b, this.b, a);
        return this;
    }

    add(color, perc) {
        this.r += Math.min(color.r * perc, 255);
        this.g += Math.min(color.g * perc, 255);
        this.b += Math.min(color.b * perc, 255);
        return this;
    }

    luminosity() {
        return (0.299 * this.r) + (0.587 * this.g) + (0.114 * this.b);
    }

    static black() {
        return new Color(0, 0, 0);
    }
}