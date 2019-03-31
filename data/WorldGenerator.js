class WorldGenerator {
    constructor() {
    }

    build(x, y, z, ready) {
        const _3DSPACE = new Map(x, y, z);
        _3DSPACE.addMaterial(new Material(new Color(0, 0, 0)));

        this.loadImage(TEXTURES_BASE64, (tilesData) => { // Tiles 16x16
            _3DSPACE.addMaterial(
                new Material(
                    new Color(23, 37, 16),
                    this.getTyleTexture(tilesData, 0, 0, 16),
                    this.getTyleTexture(tilesData, 0, 3, 16),
                    this.getTyleTexture(tilesData, 0, 2, 16),
                )
            );

            _3DSPACE.addMaterial(
                new Material(
                    new Color(60, 60, 60),
                    this.getTyleTexture(tilesData, 0, 1, 16),
                )
            );

            this.loadImage(HEIGHT_MAP_BASE64, (imageData) => {
                for (let i = 0; i < x; i++) {
                    for (let k = 0; k < z; k++) {                        
                        const height = imageData.data[((k*imageData.width + i) * 4)] / 4;
                        for(let j = 0; j < height; j++) {
                            if(j > height - 2) {
                                _3DSPACE.setAt(i,j,k, 1);
                            } else {
                                _3DSPACE.setAt(i,j,k, 2);
                            }
                        }
                    }
                }
    
                if(ready) ready();
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

    getTyleTexture(imageData, ix, iy, tileSize) {
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

        return new Texture(tileData);
    }
}