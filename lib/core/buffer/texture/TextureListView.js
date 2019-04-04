class TextureListView {
    constructor(buffers) {
        const _textures = buffers.map(buffer => new TextureView(buffer));
        this.get = (index) => _textures[index];
    }
}