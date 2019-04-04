class ColorViewer {
    constructor(dataView, startByte) {
        this.getR = () => dataView.getUint8(startByte);
        this.getG = () => dataView.getUint8(startByte + 1);
        this.getB = () => dataView.getUint8(startByte + 2);
        this.get = () => {
            return new Color(
                this.getR(),
                this.getG(),
                this.getB(),
            );
        }
    }
}