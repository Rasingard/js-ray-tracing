class WorldGenerator {
    constructor() {
    }

    build(x, y, z, ready) {
        const _3DSPACE = new Map(x, y, z);

        this.loadImage(WATER_BUMP_BASE64, (waterBump) => {
            this.loadImage(TEXTURES_BASE64, (tilesData) => { // Tiles 16x16
            
                const t1 = _3DSPACE.addTexture(this.getTyleBuffer(tilesData, 0, 0, 16));
                const t2 = _3DSPACE.addTexture(this.getTyleBuffer(tilesData, 0, 1, 16));
                const t3 = _3DSPACE.addTexture(this.getTyleBuffer(tilesData, 0, 2, 16));
                const t4 = _3DSPACE.addTexture(this.getTyleBuffer(tilesData, 0, 3, 16));
                // const t5 = _3DSPACE.addTexture(this.getTyleBuffer(tilesData, 12, 14, 16));
                const t5 = _3DSPACE.addTexture(this.getTyleBuffer(waterBump, 0, 0, 512));
    
                const m1 = _3DSPACE.addMaterial(new Color(0, 0, 0), t5, t5, t5);
                const m2 = _3DSPACE.addMaterial(new Color(125, 125, 125), t5, t5, t5);
                const m3 = _3DSPACE.addMaterial(new Color(120, 177, 76), t1, t4, t3);
                const m4 = _3DSPACE.addMaterial(new Color(125, 125, 125), t2, t2, t2);
                const m5 = _3DSPACE.addMaterial(new Color(30, 30, 160), t5, t5, t5, 64, 200);
    
                this.loadImage(HEIGHT_MAP_BASE64, (imageData) => {
                    // Set ground
                    for (let i = 0; i < x; i++) {
                        for (let k = 0; k < z; k++) {                        
                            const height = imageData.data[((k*imageData.width + i) * 4)] / 2;
                            for(let j = 0; j < height; j++) {
                                if(j > height - 2) {
                                    _3DSPACE.setAt(i,j,k, m2);
                                } else {
                                    _3DSPACE.setAt(i,j,k, m3);
                                }
                            }
                        }
                    }
    
                    // Set Sea
                    for (let i = 0; i < x; i++) {
                        for (let k = 0; k < z; k++) {
                            for(let j = 0; j < 22; j++) {
                                if(!_3DSPACE.getAt(i,j,k)) _3DSPACE.setAt(i,j,k, m4);
                            }
                        }
                    }
        
                    this.loadImage(SKY_BASE64, (skydata) => {
                        if(ready) ready(this.imageDataToSharedBuffer(skydata));
                    });
                });
            });
        });
        
        return _3DSPACE;
    }

    loadImage(image64, callback) {
        var image = new Image();
        image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            callback(context.getImageData(0, 0, canvas.width, canvas.height));
        }
        image.src = image64;
    }

    imageDataToSharedBuffer(imageData) {
        const buffer = new SharedArrayBuffer(4 + (imageData.height * imageData.width * 3));
        const tempView = new DataView(buffer);
        tempView.setUint16(0, imageData.height);
        tempView.setUint16(2, imageData.width);
        const bufferView = new Uint8ClampedArray(buffer, 4);

        let countIndex = 0;
        for(let i = 0; i < imageData.data.length; i += 4) {
            bufferView[countIndex * 3]          = imageData.data[i];
            bufferView[(countIndex * 3) + 1]    = imageData.data[i + 1];
            bufferView[(countIndex * 3) + 2]    = imageData.data[i + 2];

            countIndex++;
        }

        return tempView;
    }

    getTyleData(imageData, ix, iy, tileSize) {
        const tileData = new ImageData(tileSize, tileSize);
        let oi, ci;
        for(let x = 0; x < tileSize; x++) {
            for(let y = 0; y < tileSize; y++) {
                oi = Math.floor(((y + ix * tileSize) * imageData.width + (x + iy * tileSize)) * 4);
                ci = Math.floor((y * tileSize + x) * 4);
                tileData.data[ci] = imageData.data[oi];
                tileData.data[ci + 1] = imageData.data[oi + 1];
                tileData.data[ci + 2] = imageData.data[oi + 2];
                tileData.data[ci + 3] = imageData.data[oi + 3];
            }
        }

        return tileData;
    }

    getTyleBuffer(imageData, ix, iy, tileSize) {
        const buffer = new SharedArrayBuffer(2 + (tileSize * tileSize * 4));
        (new DataView(buffer)).setUint16(0, tileSize); // set image size
        const tileData = new Uint8ClampedArray(buffer, 2);

        let oi, ci;
        for(let x = 0; x < tileSize; x++) {
            for(let y = 0; y < tileSize; y++) {
                oi = Math.floor(((y + ix * tileSize) * imageData.width + (x + iy * tileSize)) * 4);
                ci = Math.floor((y * tileSize + x) * 4);
                tileData[ci] = imageData.data[oi];
                tileData[ci + 1] = imageData.data[oi + 1];
                tileData[ci + 2] = imageData.data[oi + 2];
                tileData[ci + 3] = imageData.data[oi + 3];
            }
        }

        return buffer;
    }

    getTyleTexture(imageData, ix, iy, tileSize) {
        return new Texture(this.getTyleData(imageData, ix, iy, tileSize));
    }
}