class MaterialList {
    constructor() {
        let _length = 0;
        const _bufferList = new SharedArrayBuffer(1 + (16 * 9)); // +1 (8bit) for the list length
        const _bufferView = new DataView(_bufferList);

        this.getLength = () => _bufferView.getUint8(0);

        const _setLength = (val) => _bufferView.setUint8(0, val);

        this.add = (color, textureTRef, textureSRef, textureDRef, opacity, specular, roughness) => {
            const materialView = new MaterialView(_bufferView, _length);
            _setLength(_length++);

            materialView.color.set(color);
            materialView.setTextureTop(textureTRef);
            materialView.setTextureSides(textureSRef);
            materialView.setTextureDown(textureDRef);

            materialView.setOpacity(opacity || 0);
            materialView.setSpecular(specular || 0);
            materialView.setRoughness(roughness || 0);

            return _length;
        }

        this.get = (index) => new MaterialView(_bufferView, index);
        this.getBuffer = () => _bufferList;
    }
}