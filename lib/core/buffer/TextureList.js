class TextureView {
    constructor(buffer) {
        this.size = (new DataView(buffer)).getUint16(0);
        this.data = (new Uint8ClampedArray(buffer, 2));

        this.get = (deltaX, deltaY) => {    
            const x = Math.floor(this.size * deltaX);
            const y = Math.floor(this.size * deltaY);
    
            const index = ((y * this.size + x) * 4);
            return new Color(
                this.data[index],
                this.data[index + 1],
                this.data[index + 2]
            );
        }

        this.getBuffer = () => buffer;
    }
}

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

class TextureListView {
    constructor(buffers) {
        const _textures = buffers.map(buffer => new TextureView(buffer));
        this.get = (index) => _textures[index];
    }
}