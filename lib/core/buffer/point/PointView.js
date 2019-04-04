class PointView extends PointViewer {
    constructor(dataView, startByte) {
        super(dataView, startByte);
        
        this.setX = (val) => dataView.setFloat64(startByte, val);
        this.setY = (val) => dataView.setFloat64(startByte + 8, val);
        this.setZ = (val) => dataView.setFloat64(startByte + 16, val);
        this.set = (vector) => {
            this.setX(vector.x);
            this.setY(vector.y);
            this.setZ(vector.z);
        }
    }
}