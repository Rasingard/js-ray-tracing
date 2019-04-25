class Utils {
    constructor() { }
    
    static getTexture(id, callback) {
        var image = document.querySelector(`#textures #${id}`);
        if(!image) throw new Error(`Image: ${id} not found!`);
        
        var canvas = new OffscreenCanvas(image.width, image.height);
        const context = canvas.getContext('2d');
        context.putImageData(image, 0, 0);
        callback(context);
    }

    static getTile(context, x, y, tileSize) {
        const tileX = tileSize * x;
        const tileY = tileSize * y;
        const imageData = context.getImageData(
            tileX,
            tileY,
            tileSize,
            tileSize
        );

        const buffer = new SharedArrayBuffer(2 + (tileSize * tileSize * 3));
        const bufferView = new DataView(buffer);
        
        bufferView.setUint16(0, tileSize); // set image size

        let newBufferI = 2, oldBufferI = 0;
        for(let i = 0, len = (imageData.data.length / 4); i < len; i++) {
            bufferView.setUint8(newBufferI, imageData.data[oldBufferI]);
            bufferView.setUint8(newBufferI + 1, imageData.data[oldBufferI + 1]);
            bufferView.setUint8(newBufferI + 2, imageData.data[oldBufferI + 2]);

            newBufferI += 3;
            oldBufferI += 4;
        }

        return buffer;
    }
}