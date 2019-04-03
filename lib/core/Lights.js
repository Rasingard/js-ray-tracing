class LightSource {
    constructor(color, location, intensity, range) { }
}

class AmbientLight {
    constructor(color, intensity) {
        this.color = color;
        this.intensity = intensity;
    }
}

class GlobalLight extends AmbientLight {
    constructor(color, intensity, vector) {
        super(color, intensity);
        this.direction = vector;
    }
}