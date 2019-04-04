class TextureView {
    constructor(buffer) {
        const _view = new DataView(buffer);
        this.size = _view.getUint16(0);
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