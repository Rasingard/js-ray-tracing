class MaterialView {
    constructor(dataView, index) {
        this.startByte = (index * 6) + 1;

        this.color = new ColorView(dataView, this.startByte);

        this.getTextureTop = () => dataView.getUint8(this.startByte + 3);
        this.getTextureSides = () => dataView.getUint8(this.startByte + 4);
        this.getTextureDown = () => dataView.getUint8(this.startByte + 5);

        this.setTextureTop = (val) => dataView.setUint8(this.startByte + 3, val);
        this.setTextureSides = (val) => dataView.setUint8(this.startByte + 4, val);
        this.setTextureDown = (val) => dataView.setUint8(this.startByte + 5, val);
    }
}