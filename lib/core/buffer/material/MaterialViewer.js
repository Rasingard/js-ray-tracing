class MaterialViewer {
    constructor(dataView, index) {
        this.startByte = (index * 9) + 1;

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
    }
}