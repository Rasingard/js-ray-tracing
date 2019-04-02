class BufferedTextureList {
    constructor() {
        const buffers = new Array();
        const dimensions = new Array();

        this.add = (imageData) => {
            const index = buffers.length;
            buffers.push(imageData.data);
            dimensions.push(imageData.height);
            dimensions.push(imageData.width);
            return index;
        }

        this.get = (index) => new BufferedTexture(
            buffers[index], 
            dimensions[index * 2],
            dimensions[(index * 2) + 1],
        );

        this.getBuffers = () => {
            return [buffers, dimensions];
        }
    }
}

class BufferedTexture {
    constructor(view, height, width) {
        this.get = (xperc, yperc) => {    
            const index = ((Math.floor(height * yperc) * width + Math.floor(width * xperc)) * 4);
            return new Color(
                view[index],
                view[index + 1],
                view[index + 2]
            );
        }
    }
}