class AirShader extends Shader {
    static color = FOG_COLOR;
    static render(map, sun, camera, ray) {
        return this.color;
    }
}

class SandShader extends Shader {
    static color = new Color(255, 83, 13);
    static render(map, sun, camera, ray) {
        const color = this.color.getCopy();
        const length = ray.getLength();
        const normal = ray.getNormal();
        const intersection = ray.getIntersection(length);
        if(length < LIGHT_RENDER_DISTANCE) color.multiply(this.mergeLights(VISIBLE_OBJECTS, sun, intersection, normal));
        this.distancePass(color, length);
        return color;
    }
}

class WaterShader extends Shader {
    static color = new Color(20, 20, 120);
    static render(map, sun, camera, ray) {
        const color = this.color.getCopy();

        let materialIn;
        if(map.getAt(Math.floor(ray.originx), Math.floor(ray.originy), Math.floor(ray.originz)) === 2) {
            materialIn = new Point(ray.originx, ray.originy, ray.originz);
        } else {
            materialIn = ray.getPreciseIntersection();
        }
        
        let rayPath = ray.next();
        if(rayPath) {
            const materialOut = ray.getPreciseIntersection();

            let outColor;
            if(rayPath.shaderRef) {
                outColor = map.getMaterial(rayPath.shaderRef).render(map, sun, camera, ray);
            } else if (rayPath = ray.next()) {
                outColor = map.getMaterial(rayPath.shaderRef).render(map, sun, camera, ray);
            } else {
                outColor = FOG_COLOR;
            }
            
            color.blend(
                outColor,
                Math.min(1 - (materialIn.distanceTo(materialOut) / 2), 1)
            );
        };

        if(length < LIGHT_RENDER_DISTANCE) color.multiply(this.mergeLights(VISIBLE_OBJECTS, sun, materialIn, ray.getNormal()));
        
        this.distancePass(color, ray.getLength());
        return color;
    }
}

class FogShader extends Shader {
    static color = new Color(255, 255, 255);
    static render(map, sun, camera, ray) {
        const color = this.color.getCopy();

        let materialIn;
        if(map.getAt(Math.floor(ray.originx), Math.floor(ray.originy), Math.floor(ray.originz)) === 3) {
            materialIn = new Point(ray.originx, ray.originy, ray.originz);
        } else {
            materialIn = ray.getPreciseIntersection();
        }

        // if(length < LIGHT_RENDER_DISTANCE) color.multiply(this.mergeLights(VISIBLE_OBJECTS, sun, materialIn, ray.getNormal()));
        
        let rayPath = ray.next();
        if(rayPath) {
            const materialOut = ray.getPreciseIntersection();

            let outColor;
            if(rayPath.shaderRef) {
                outColor = map.getMaterial(rayPath.shaderRef).render(map, sun, camera, ray);
            } else if (rayPath = ray.next()) {
                outColor = map.getMaterial(rayPath.shaderRef).render(map, sun, camera, ray);
            } else {
                outColor = FOG_COLOR;
            }
            
            color.blend(
                outColor,
                Math.min(1 - (materialIn.distanceTo(materialOut) / 22), 1)
            );
        };
        
        this.distancePass(color, ray.getLength());
        return color;
    }
}

class WorldGenerator {
    constructor() {
    }

    build(x, y, z, ready) {
        const me = this;
        const _3DSPACE = new Map(x, y, z);

        this.loadImages64([
            TEXTURE_HIGHTMAP_BASE64
        ], (heightMap) => {

            _3DSPACE.addShader(AirShader);
            _3DSPACE.addShader(SandShader);
            _3DSPACE.addShader(WaterShader);
            _3DSPACE.addShader(FogShader);

            const seaLvl = 16;

            for (let i = 0; i < x; i++) {
                for(let j = 0; j < seaLvl; j++) {
                    for (let k = 0; k < z; k++) {
                        _3DSPACE.setAt(i, j, k, 2);
                    }
                }
            }

            // for (let i = 0; i < x; i++) {
            //     for(let j = (seaLvl + 2); j < (seaLvl + 2 + 5); j++) {
            //         for (let k = 0; k < z; k++) {
            //             _3DSPACE.setAt(i, j, k, 3);
            //         }
            //     }
            // }

            let height;
            for (let i = 0; i < x; i++) {
                for (let k = 0; k < z; k++) {
                    height = heightMap.data[((k*heightMap.width + i) * 4)] / 10;
                    for(let j = 0; j < height; j++) _3DSPACE.setAt(i, j, k, 1);
                }
            }

            for (let i = 0; i < 30; i++) {
                const lx = me.random(0, x - 1);
                const lz = me.random(0, z - 1);

                for(let j = 0; j < y; j++) {
                    if(_3DSPACE.getAt(lx, j, lz)) continue;

                    const newLightSource = {
                        position: new Point(lx, j + 1, lz),
                        color: new Color(
                            me.random(0, 255),
                            me.random(0, 255),
                            me.random(0, 255)
                        ),
                        range: me.random(4, 16)
                    };

                    _3DSPACE.addObjectAt(lx, j + 1, lz, newLightSource);
                }
            }

            if(ready) ready();
        });

        return _3DSPACE;
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    loadImages64(arrayBase64, callback) {
        const results = arrayBase64.map((img) => {
            return this.loadImage(img);
        });

        Promise.all(results).then((result) => {
            callback.apply(callback, result);
        });
    }

    loadImage(image64) {
        return new Promise((done, error) => {
            var image = new Image();
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                done(context.getImageData(0, 0, canvas.width, canvas.height));
            }
            image.onerror = error;
            image.src = image64;
        });
    }
}