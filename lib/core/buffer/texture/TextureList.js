class TextureList {
    constructor() {
        const _textures = new Array();

        this.add = (buffer) => {
            const index = _textures.length;
            _textures.push(new TextureView(buffer));
            return index;
        }

        this.get = (index) => _textures[index];

        this.getBuffers = () => {
            return _textures.map(texture => texture.getBuffer());
        };
    }
}