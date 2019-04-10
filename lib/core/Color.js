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

    set(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
    }

    screenC(t, b) { return Math.floor(255 - ((255 - t) * (255 - b))); }
    screen(color) {
        this.r = this.screenC(color.r, this.r);
        this.g = this.screenC(color.g, this.g);
        this.b = this.screenC(color.b, this.b);
        return this;
    }

    blendC(t, b, o) { return Math.floor((b * (1 - o)) + (t * o)); }
    blend(color, opacity) {
        this.r = this.blendC(color.r, this.r, opacity);
        this.g = this.blendC(color.g, this.g, opacity);
        this.b = this.blendC(color.b, this.b, opacity);
        return this;
    }

    burnC(t, b) { return Math.floor(255 - (255 - t) / b); }
    burn(color) {
        this.r = this.burnC(color.r, this.r);
        this.g = this.burnC(color.g, this.g);
        this.b = this.burnC(color.b, this.b);
        return this;
    }

    dodgeC(t, b) { return Math.floor(t / (255 - b)); }
    dodge(color) {
        this.r = this.dodgeC(color.r, this.r);
        this.g = this.dodgeC(color.g, this.g);
        this.b = this.dodgeC(color.b, this.b);
        return this;
    }

    vividC(t, b) { return b > 127 ? this.burnC(t, b) : this.dodgeC(t, b); }
    vivid(color) {
        this.r = this.vividC(color.r, this.r);
        this.g = this.vividC(color.g, this.g);
        this.b = this.vividC(color.b, this.b);
        return this;
    }

    multiplyC(t, b) { return Math.floor((t / 255) * (b / 255) * 255); }
    multiply(color) {
        this.r = this.multiplyC(color.r, this.r);
        this.g = this.multiplyC(color.g, this.g);
        this.b = this.multiplyC(color.b, this.b);
        return this;
    }
}