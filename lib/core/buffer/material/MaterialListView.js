class MaterialListView {
    constructor(buffer) {
        const _bufferView = new DataView(buffer);
        this.get = (index) => new MaterialViewer(_bufferView, index);
    }
}