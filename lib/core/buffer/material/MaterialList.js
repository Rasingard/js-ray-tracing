class MaterialList {
    constructor(map) {
        let _length = 0;
        const _bufferList = new SharedArrayBuffer(1 + (16 * 12)); // +1 (8bit) for the list length
        const _bufferView = new DataView(_bufferList);

        this.getLength = () => _bufferView.getUint8(0);

        const _setLength = (val) => _bufferView.setUint8(0, val);

        this.add = (conf) => {
            const materialView = new MaterialView(_bufferView, _length);
            _setLength(_length++);

            if(conf.color) materialView.color.set(conf.color);

            if(conf.texture) {
                materialView.setTextureSides(conf.texture);
                materialView.setTextureTop(conf.texture);
                materialView.setTextureDown(conf.texture);

                materialView.color.set(map.getTexture(conf.texture).getBaseColor());
            } else if (conf.textureSides) {
                materialView.setTextureDown(conf.textureDown || conf.textureTop || conf.textureSides);
                materialView.setTextureTop(conf.textureTop || conf.textureDown || conf.textureSides);
                materialView.setTextureSides(conf.textureSides);

                materialView.color.set(map.getTexture(conf.textureTop || conf.textureSides).getBaseColor());
            };

            if(conf.opacity) materialView.setOpacity(conf.opacity);
            if(conf.specularity) materialView.setSpecular(conf.specularity);
            if(conf.roughness) materialView.setRoughness(conf.roughness);

            if(conf.normal) {
                materialView.setNormalTop(conf.normal);
                materialView.setNormalSides(conf.normal);
                materialView.setNormalDown(conf.normal);
            } else if (conf.normalSides) {
                materialView.setNormalDown(conf.normalDown || conf.normalTop || conf.normalSides);
                materialView.setNormalTop(conf.normalTop || conf.normalDown || conf.normalSides);
                materialView.setNormalSides(conf.normalSides);
            };

            return _length - 1;
        }

        this.get = (index) => new MaterialView(_bufferView, index);
        this.getBuffer = () => _bufferList;
    }
}