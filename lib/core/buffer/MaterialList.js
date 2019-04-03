class MaterialView {
    constructor(dataView) {
        this.setColorR = (val) => dataView.setUint8(0, val);
        this.setColorG = (val) => dataView.setUint8(1, val);
        this.setColorB = (val) => dataView.setUint8(2, val);
        this.setColor = (color) => {
            this.setColorR(color.r);
            this.setColorG(color.g);
            this.setColorB(color.b);
        }

        this.getColorR = () => dataView.getUint8(0);
        this.getColorG = () => dataView.getUint8(1);
        this.getColorB = () => dataView.getUint8(2);
        this.getColor = () => {
            return new Color(
                this.getColorR(),
                this.getColorG(),
                this.getColorB(),
            );
        }

        this.getTextureTop = () => dataView.getUint8(3);
        this.getTextureSides = () => dataView.getUint8(4);
        this.getTextureDown = () => dataView.getUint8(5);

        this.setTextureTop = (val) => dataView.setUint8(3, val);
        this.setTextureSides = (val) => dataView.setUint8(4, val);
        this.setTextureDown = (val) => dataView.setUint8(5, val);
    }
}

class MaterialList {
    constructor() {
        const _bufferList = new BufferList(6, 16);

        /*
        colorR:     1byte
        colorG:     1byte
        colorB:     1byte
        textureT:   1byte
        textureS:   1byte
        textureD:   1byte
        */

        this.add = (color, textureTRef, textureSRef, textureDRef) => {
            const materialView  = new MaterialView(_bufferList.add());

            materialView.setColor(color);
            materialView.setTextureTop(textureTRef);
            materialView.setTextureSides(textureSRef);
            materialView.setTextureDown(textureDRef);

            return (_bufferList.getLength() - 1);
        }

        this.get = (index) => {
            return new MaterialView(_bufferList.get(index));
        }

        this.getBuffer = () => _bufferList.getBuffer();
    }
}

class MaterialListView {
    constructor(buffer) {
        const _bufferView = new BufferView(buffer);
        
        this.get = (index) => {
            return new MaterialView(_bufferView.get(index));
        }
    }
}