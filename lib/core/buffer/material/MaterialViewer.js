class MaterialViewer {
    constructor(dataView, index) {
        this.startByte = (index * 12) + 1;

        this.color = new ColorViewer(dataView, this.startByte);

        // Texture Top
        this.getTextureTop = () => dataView.getUint8(this.startByte + 3);

        // Texture Sides
        this.getTextureSides = () => dataView.getUint8(this.startByte + 4);

        // Texture Down
        this.getTextureDown = () => dataView.getUint8(this.startByte + 5);

        // Opacity
        this.getOpacity = () => dataView.getUint8(this.startByte + 6);

        // Specular
        this.getSpecular = () => dataView.getUint8(this.startByte + 7);

        // Roughness
        this.getRoughness = () => dataView.getUint8(this.startByte + 8);

        // Normal Top
        this.getNormalTop = () => dataView.getUint8(this.startByte + 9);

        // Normal Sides
        this.getNormalSides = () => dataView.getUint8(this.startByte + 10);

        // Normal Down
        this.getNormalDown = () => dataView.getUint8(this.startByte + 11);

        this.haveNormal = !!(this.getNormalSides() || this.getNormalTop() || this.getNormalDown());
        this.haveTexture = !!(this.getTextureSides() || this.getTextureTop() || this.getTextureDown());
    }
}