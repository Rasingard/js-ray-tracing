class BufferedMaterialList {
    constructor(bufferedTexturesList) {
        const buffers = new Array();

        this.add = (color, textureTRef, textureSRef, textureDRef) => {
            const index = buffers.length;
            const buffer = new SharedArrayBuffer(56);
            const view = new DataView(buffer);
            
            view.setUint8(0, color.r);
            view.setUint8(1, color.g);
            view.setUint8(2, color.b);
            view.setUint8(3, textureTRef);
            view.setUint8(4, textureSRef);
            view.setUint8(5, textureDRef);

            buffers.push(buffer);

            return index;
        }

        this.get = (index) => {
            return new BufferedMaterial(
                new DataView(buffers[index]),
                bufferedTexturesList
            );
        }
    }
}

class BufferedMaterial {
    constructor(dataView, bufferedTexturesList) {
        this.getColor = () => {
            return new Color(
                dataView.getUint8(0),
                dataView.getUint8(1),
                dataView.getUint8(2)
            );
        }

        this.getTextureTop = () => {
            return bufferedTexturesList.get(dataView.getUint8(3));
        }

        this.getTextureSides = () => {
            return bufferedTexturesList.get(dataView.getUint8(4));
        }

        this.getTextureDown = () => {
            return bufferedTexturesList.get(dataView.getUint8(5));
        }
    }
}