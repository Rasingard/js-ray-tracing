class PointViewer {
    constructor(dataView, startByte) {
        this.getX = () => dataView.getFloat64(startByte);
        this.getY = () => dataView.getFloat64(startByte + 8);
        this.getZ = () => dataView.getFloat64(startByte + 16);
        this.get = () => {
            return new Vector(
                this.getX(),
                this.getY(),
                this.getZ(),
            );
        }
    }
}