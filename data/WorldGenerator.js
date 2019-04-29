class WorldGenerator {
    constructor() {
    }

    ran(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    build(x, y, z, ready) {
        this.loadImage(HEIGHT_MAP3_BASE64, (imageData) => {
            const _3DSPACE = new Map(imageData.width, 128, imageData.height);

            this.loadImage(WATER_BUMP_BASE64, (normalsData) => {
                this.loadImage(TEXTURES_BASE64, (tilesData) => { // Tiles 16x16

                    _3DSPACE.addMaterial({color: new Color(0, 0, 0)});
                    _3DSPACE.addTexture(this.getTyleBuffer(tilesData, 0, 0, 16));

                    const tileSize = 16;

                    const grass = _3DSPACE.addMaterial({
                        textureSides: this.addTexture(_3DSPACE, tilesData, 3, 0, tileSize),
                        textureTop: this.addTexture(_3DSPACE, tilesData, 0, 0, tileSize),
                        textureDown: this.addTexture(_3DSPACE, tilesData, 2, 0, tileSize),

                        // normalSides: this.addTexture(_3DSPACE, normalsData, 3, 0, tileSize),
                        // normalTop: this.addTexture(_3DSPACE, normalsData, 2, 0, tileSize),
                        // normalDown: this.addTexture(_3DSPACE, normalsData, 0, 0, tileSize)
                    });

                    const stone = _3DSPACE.addMaterial({
                        texture: this.addTexture(_3DSPACE, tilesData, 1, 0, tileSize),
                        // normal: this.addTexture(_3DSPACE, normalsData, 1, 0, tileSize) 
                    });

                    const water = _3DSPACE.addMaterial({
                        texture: this.addTexture(_3DSPACE, tilesData, 14, 12, tileSize),
                        normal: this.addTexture(_3DSPACE, normalsData, 0, 0, 512, (color) => {
                            return color.blend(new Color(127, 127, 255), 0.75);
                        }, 0.25),
                        opacity: 32,
                        specularity: 200
                    });

                    const sand = _3DSPACE.addMaterial({
                        texture: this.addTexture(_3DSPACE, tilesData, 2, 1, tileSize),
                        // normal: this.addTexture(_3DSPACE, normalsData, 2, 1, tileSize) 
                    });
                    
                    const snow = _3DSPACE.addMaterial({
                        texture: this.addTexture(_3DSPACE, tilesData, 2, 4, tileSize),
                        // normal: this.addTexture(_3DSPACE, normalsData, 2, 4, tileSize) 
                    });

                    const treeTrunk = _3DSPACE.addMaterial({
                        texture: this.addTexture(_3DSPACE, tilesData, 4, 1, tileSize), // 5 , 1 para parte interna
                        // normal: this.addTexture(_3DSPACE, normalsData, 4, 1, tileSize) 
                    });

                    const adjustColor = new Color(0, 255, 0);
                    const treeLeafs = _3DSPACE.addMaterial({
                        texture: this.addTexture(_3DSPACE, tilesData, 5, 3, tileSize, (color) => {
                            return color.blend(adjustColor.darken(color), 0.5);
                        }),
                        // normal: this.addTexture(_3DSPACE, normalsData, 5, 3, tileSize)
                    });

                    const seaLevel = 12;

                    // Set ground
                    for (let i = 0; i < x; i++) {
                        for (let k = 0; k < z; k++) {                        
                            const height = imageData.data[((k*imageData.width + i) * 4)] / 2;

                            if(height <= seaLevel) {
                                for(let j = 0; j < height; j++) {
                                    if(j > (height - 2)) _3DSPACE.setAt(i, j, k, sand);  
                                    else _3DSPACE.setAt(i, j, k, stone);
                                }
                            } else if (height <= seaLevel * 5) {
                                for(let j = 0; j < height; j++) {
                                    if(j > (height - 2)) _3DSPACE.setAt(i, j, k, grass);
                                    else _3DSPACE.setAt(i, j, k, stone);
                                }
                            } else if (height <= seaLevel * 5 + 3) {
                                for(let j = 0; j < height; j++) {
                                    const val = this.ran(0, 3);
                                    if(val > (seaLevel * 5 + 3) - height) _3DSPACE.setAt(i, j, k, stone);
                                    else _3DSPACE.setAt(i, j, k, grass);
                                }
                            } else if (height <= seaLevel * 5 + 6) {
                                for(let j = 0; j < height; j++) {
                                    const val = this.ran(0, 3);
                                    if(val > (seaLevel * 5 + 6) - height) _3DSPACE.setAt(i, j, k, snow);
                                    else _3DSPACE.setAt(i, j, k, stone);
                                }
                            } else {
                                for(let j = 0; j < height; j++) {
                                    if(j > (height - 2)) _3DSPACE.setAt(i, j, k, snow);  
                                    else _3DSPACE.setAt(i, j, k, stone);
                                }
                            }
                        }
                    }

                    // Set Sea
                    for (let i = 0; i < x; i++) {
                        for (let k = 0; k < z; k++) {
                            for(let j = 0; j < seaLevel; j++) {
                                if(!_3DSPACE.getAt(i,j,k)) {
                                    _3DSPACE.setAt(i,j,k, water);
                                };
                            }
                        }
                    }

                    // Set tree
                    const treeTemplate = [
                        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [treeLeafs, treeLeafs, treeLeafs], [treeLeafs, treeLeafs, treeLeafs], [0, 0, 0]],
                        [[0, treeTrunk, 0], [0, treeTrunk, 0], [0, treeTrunk, 0], [0, treeTrunk, 0], [treeLeafs, treeTrunk, treeLeafs], [treeLeafs, treeLeafs, treeLeafs], [0, treeLeafs, 0]],
                        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [treeLeafs, treeLeafs, treeLeafs], [treeLeafs, treeLeafs, treeLeafs], [0, 0, 0]]
                    ];

                    const vectorDown = new Vector(0, -1, 0);
                    for (let i = 0; i < 30000; i++) {
                        const target = _3DSPACE.rayTrace(
                            new Point(
                                this.ran(0, 2047),
                                127,
                                this.ran(0, 2047)
                            ),
                            vectorDown,
                            2047
                        );
            
                        if(
                            target &&
                            target.materialRef === grass &&
                            this.checkSpace(
                                target.target.x - 1,
                                target.target.y,
                                target.target.z - 1,
                                3, 6, 3
                            )
                        ) {
                            _3DSPACE.setShape(
                                target.target.x - 1,
                                target.target.y,
                                target.target.z - 1,
                                treeTemplate
                            );
                        }
                    }

                    this.loadImage(SKY_BASE64, (skydata) => {
                        if(ready) ready(this.imageDataToSharedBuffer(skydata), _3DSPACE);
                    });
                });
            });
        });
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

    checkSpace(map, x, y, z, width, height, depth) {
        for(let i = x; i < x + width; i++) {
            for(let j = y; j < y + height; j++) {
                for(let k = z; k < z + depth; k++) {
                    if(map.getAt(i, j, k)) return false;
                }
            }
        }

        return true;
    }

    getInRange(map, x, y, z, range, fn) {
        const startx = Math.max(x - range, 0);
        const starty = Math.max(y - range, 0);
        const startz = Math.max(z - range, 0);

        const endx = Math.min(x + range, map.getX());
        const endy = Math.min(y + range, map.getY());
        const endz = Math.min(z + range, map.getZ());

        for(let i = startx; i < endx; i++) {
            for(let j = starty; j < endy; j++) {
                for(let k = startz; k < endz; k++) {
                    const target = map.getAt(i, j, k);
                    if(target) fn(target, i, j, k);
                }
            }
        }
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
                oi = Math.round(((y + ix * tileSize) * imageData.width + (x + iy * tileSize)) * 4);
                ci = Math.round((y * tileSize + x) * 4);
                tileData.data[ci] = imageData.data[oi];
                tileData.data[ci + 1] = imageData.data[oi + 1];
                tileData.data[ci + 2] = imageData.data[oi + 2];
                tileData.data[ci + 3] = imageData.data[oi + 3];
            }
        }

        return tileData;
    }

    scaleImage(image, scale) {
        const tempCanvas = new OffscreenCanvas(image.width, image.height);
        const tempContext = tempCanvas.getContext('2d');
        const newW = Math.floor(image.width * scale);
        const newH = Math.floor(image.height * scale);
        tempContext.putImageData(image, 0, 0);
        tempContext.scale(scale, scale);
        return tempContext.getImageData(0, 0, newH, newW);
    }

    getTyleBuffer(img, ix, iy, tileSize, fn, scale) {
        let imageData = img;

        if(scale) this.scaleImage(img, scale);
        else imageData = img;

        const buffer = new SharedArrayBuffer(2 + (tileSize * tileSize * 4));
        (new DataView(buffer)).setUint16(0, tileSize); // set image size
        const tileData = new Uint8ClampedArray(buffer, 2);
        
        let 
        originI = ((tileSize * iy) * imageData.width + (ix * tileSize)) * 4,
        targetI = 0;

        for(let y = 0; y < tileSize; y++) {
            for(let x = 0; x < tileSize; x++) {
                if(fn) {
                    const color = fn(
                        new Color(
                            imageData.data[originI],
                            imageData.data[originI + 1],
                            imageData.data[originI + 2],
                        )
                    );
                    
                    tileData[targetI] = color.r;
                    tileData[targetI + 1] = color.g;
                    tileData[targetI + 2] = color.b;
                    tileData[targetI + 3] = imageData.data[originI + 3];
                } else {
                    tileData[targetI] = imageData.data[originI];
                    tileData[targetI + 1] = imageData.data[originI + 1];
                    tileData[targetI + 2] = imageData.data[originI + 2];
                    tileData[targetI + 3] = imageData.data[originI + 3];
                }

                originI += 4;
                targetI += 4;
            }
            
            originI += ((imageData.width - tileSize) * 4);
        }

        return buffer;
    }

    getTyleTexture(imageData, ix, iy, tileSize) {
        return new Texture(this.getTyleData(imageData, ix, iy, tileSize));
    }

    addTexture(map, tileSet, x, y, size, fn, scale) {
        return map.addTexture(this.getTyleBuffer(tileSet, x, y, size, fn, scale));
    }
}