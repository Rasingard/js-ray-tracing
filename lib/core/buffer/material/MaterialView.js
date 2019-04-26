class MaterialView {
    constructor(dataView, index) {
        /*
            material(72bit / 9byte)

            color(24bit)
            r           // 8bit
            g           // 8bit
            b           // 8bit

            textures(24bit)
            top         // 8bit
            sides       // 8bit
            down        // 8bit

            opacity     // 8bit     0(full tranparent) - 1(color)
            specular    // 8bit     how reflective is the surface 0(color) - 1(reflection color)
            roughness   // 8bit     how light vector blends with normal vector 0(angle > PI/2 light = 0) - 1(full blend angle/PI)

            normal(24bit)
            top         // 8bit
            sides       // 8bit
            down        // 8bit
        */

        this.startByte = (index * 12) + 1; // +1 (8bit) for the list length

        this.color = new ColorView(dataView, this.startByte);

        // Texture Top
        this.setTextureTop = (val) => dataView.setUint8(this.startByte + 3, val);
        this.getTextureTop = () => dataView.getUint8(this.startByte + 3);

        // Texture Sides
        this.setTextureSides = (val) => dataView.setUint8(this.startByte + 4, val);
        this.getTextureSides = () => dataView.getUint8(this.startByte + 4);

        // Texture Down
        this.setTextureDown = (val) => dataView.setUint8(this.startByte + 5, val);
        this.getTextureDown = () => dataView.getUint8(this.startByte + 5);

        // Opacity
        this.setOpacity = (val) => dataView.setUint8(this.startByte + 6, val);
        this.getOpacity = () => dataView.getUint8(this.startByte + 6);

        // Specular
        this.setSpecular = (val) => dataView.setUint8(this.startByte + 7, val);
        this.getSpecular = () => dataView.getUint8(this.startByte + 7);

        // Roughness
        this.setRoughness = (val) => dataView.setUint8(this.startByte + 8, val);
        this.getRoughness = () => dataView.getUint8(this.startByte + 8);

        // Normal Top
        this.setNormalTop = (val) => dataView.setUint8(this.startByte + 9, val);
        this.getNormalTop = () => dataView.getUint8(this.startByte + 9);

        // Normal Sides
        this.setNormalSides = (val) => dataView.setUint8(this.startByte + 10, val);
        this.getNormalSides = () => dataView.getUint8(this.startByte + 10);

        // Normal Down
        this.setNormalDown = (val) => dataView.setUint8(this.startByte + 11, val);
        this.getNormalDown = () => dataView.getUint8(this.startByte + 11);

        this.haveNormal = !!(this.getNormalSides() || this.getNormalTop() || this.getNormalDown());
        this.haveTexture = !!(this.getTextureSides() || this.getTextureTop() || this.getTextureDown());
    }
}