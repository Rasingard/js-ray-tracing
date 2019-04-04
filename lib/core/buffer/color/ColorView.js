class ColorView extends ColorViewer {
    constructor(dataView, startByte) {
        super(dataView, startByte);

        this.setR = (val) => dataView.setUint8(startByte, val);
        this.setG = (val) => dataView.setUint8(startByte + 1, val);
        this.setB = (val) => dataView.setUint8(startByte + 2, val);
        this.set = (color) => {
            this.setR(color.r);
            this.setG(color.g);
            this.setB(color.b);
        }
    }
}