class Material {
    constructor(color, textureTop, textureSides, textureDown) {
        this.color = color;

        if(textureTop) {
            this.texture = true;
            this.textureTop = textureTop;

            if(textureSides) this.textureSides = textureSides;
            else this.textureSides = textureTop;
            
            if(textureDown) this.textureDown = textureDown;
            else this.textureDown = textureTop;
        }
    }

    copyColor() {
        return this.color.getCopy();
    }
}