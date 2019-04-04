class MaterialViewer {
    constructor(dataView, index) {
        this.startByte = (index * 6) + 1;

        this.color = new ColorViewer(dataView, this.startByte);

        this.getTextureTop = () => dataView.getUint8(this.startByte + 3);
        this.getTextureSides = () => dataView.getUint8(this.startByte + 4);
        this.getTextureDown = () => dataView.getUint8(this.startByte + 5);
    }
}