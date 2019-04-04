class EntityView {
    constructor(dataView, index) {
        this.startByte = (index * 6) + 1;

        this.location = new PointView(dataView, this.startByte);
        this.xAxis = new VectorView(dataView, this.startByte + 24);
        this.yAxis = new VectorView(dataView, this.startByte + 48);
        this.zAxis = new VectorView(dataView, this.startByte + 72);

        this.getType = () => dataView.getUint8(this.startByte + 96);
        this.setType = (val) => dataView.setUint8(this.startByte + 96, val);
    }
}