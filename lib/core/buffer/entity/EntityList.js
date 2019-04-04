class EntitylList {
    constructor(entityType) {
        let _length = 0;
        const _bufferList = new SharedArrayBuffer(1 + (16 * 257));
        const _bufferView = new DataView(_bufferList);
        const _setLength = (val) => _bufferView.setUint8(0, val);

        this.getLength = () => _bufferView.getUint8(0);

        this.add = (location, type) => {
            const index = _length;
            const newEntity = this.get(index);

            newEntity.location.set(location);
            newEntity.xAxis.set(0,0,0);
            newEntity.yAxis.set(0,0,0);
            newEntity.zAxis.set(0,0,0);

            _setLength(_length++);

            return index;
        }

        this.get = (index) => new EntityView(_bufferView, index);
        this.getBuffer = () => _bufferList;
    }
}