class Material {
    constructor(color, texture) {
        this.color = color;
        this.texture = texture;
    }

    copyColor() {
        return this.color.getCopy();
    }
}