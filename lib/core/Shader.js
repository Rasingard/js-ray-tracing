class Shader {
    constructor() {
    }
    
    static renderRayData(rayData, skySphere, height, width) {
        const color = Shader.texturePass(
            rayData.getMap(),
            rayData.getTargetMaterial(),
            rayData.getNormalRelativeIntersection(),
            rayData.getRayNormalIntersect(),
            rayData.getTargetDistance(),
        );

        this.reflactionPass(color, rayData, skySphere, height, width);

        if(this.opacityPass(color, rayData)) {
            if(this.shadowPass(color, rayData)) { 
                this.lightPass(color, rayData)
            };
        }

        this.distancePass(color, rayData);

        return color;
    }

    static distancePass(color, rayData) {
        const targetDistance = rayData.getTargetDistance();
        if(targetDistance < 32) return true;
        if(targetDistance > rayData.maxDistance) {
            color.set(BACKGROUND_COLOR);
            return false;
        }
        
        color.blend(
            BACKGROUND_COLOR, 
            (targetDistance - 32) / (rayData.maxDistance - 32)
        );
        return true;
    }

    static opacityPass(color, rayData) {
        const op = rayData.getTargetMaterial().getOpacity() / 255;
        if(!op) return true;

        const nextRayData = rayData.next();
        if(!nextRayData) return false;

        const distanceIn = rayData.target.distanceTo(nextRayData.target);
        if(distanceIn > 32) return false;
            
        color.blend(
            nextRayData.getTargetMaterial().color.get(),
            op * (1 - (distanceIn / 32))
        );

        return false; 
    }

    static lightPass(color, rayData) {
        const lightMask = (new Color(0,0,0));
        const gLight = rayData.map.getGlobalLight();

        lightMask.blend(
            gLight.color.get(),
            (2 * gLight.direction.get().getInverse().angleTo(rayData.getRayNormalIntersect())) / Math.PI
        );

        color.set(lightMask.multiply(color));
    }

    static reflactionPass(color, rayData, skySphere, height, width) {
        const specularity = rayData.getTargetMaterial().getSpecular();
        if(!specularity) return;

        if(rayData.materialRef === 4) {
            const vectorT = rayData.direction.getCopy();
            const origin = rayData.getRayIntersectionPoint();
            origin.y += 1 / 100;

            /*
            const normal = rayData.getRayNormalIntersect();
            let matrix;
            if(normal.x) {
                if(normal.x > 0) matrix = [[0, 0, -1], [0, 1, 0], [1, 0, 0]]
                else matrix = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]]
            } else if(normal.y) {
                if(normal.y > 0) matrix = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]; 
                else matrix = [[1, 0, 0], [0, 0, 1], [0, -1, 0]];
            } else {
                if(normal.z > 0) matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
                else matrix = [[-1, 0, 0], [0, 1, 0], [0, 0, -1]];
            }
            */

            const tanx = (((color.r / 255) * 2) -1);
            const tany = (((color.g / 255) * 2) -1);
            const tanz = (((color.b / 255) * 2) -1);
            
            const depth = 0.2;
            vectorT.reflect(
                new Vector(
                    tanx * depth,
                    (tanz * depth) + (1 * (1 - depth)),
                    tany * depth,
                )
            );

            vectorT.y = Math.max(vectorT.y, 0);

            const target = rayData.map.rayTrace(origin, vectorT, rayData.maxDistance);
            if(target) color.blend(target.getTargetMaterial().color.get(), specularity / 255);
            else {
                const sh = Math.ceil((height / 2) + (-vectorT.y * (height / 2)));
                const sw = Math.round((Math.atan2(vectorT.x, vectorT.z) / (2 * Math.PI)) * width);
                const skySI = (sw + (sh * width)) * 3;

                color.blend(
                    new Color(
                        skySphere[skySI],
                        skySphere[skySI + 1],
                        skySphere[skySI + 2]
                    ),
                    specularity / 255
                );
            }

            return;
        }

        const target = rayData.reFract();
        if(target) color.blend(target.getTargetMaterial().color.get(), specularity / 255);
        else {
            const sh = Math.ceil((height / 2) + (rayData.direction.y * (height / 2)));
            const sw = Math.round((Math.atan2(rayData.direction.x, rayData.direction.z) / (2 * Math.PI)) * width);
            const skySI = (sw + (sh * width)) * 3;

            color.blend(
                new Color(
                    skySphere[skySI],
                    skySphere[skySI + 1],
                    skySphere[skySI + 2]
                ),
                specularity / 255
            );
        }
    }

    static shadowPass(color, rayData) {
        const pOrigin = rayData.getRayIntersectionPoint();
        const rayDirection = rayData.map.getGlobalLight().direction.get().getInverse();

        if(rayData.getRayNormalIntersect().x) pOrigin.x += rayDirection.x / 100;
        else if(rayData.getRayNormalIntersect().y) pOrigin.y += rayDirection.y / 100;
        else pOrigin.z += rayDirection.z / 100;

        if(rayData.map.rayTrace(pOrigin, rayData.map.getGlobalLight().direction.get().getInverse(), rayData.maxDistance)) {
            color.multiply(rayData.map.getAmbientLight().color.get(), 1);
            return false;
        }

        return true;
    }
    
    static bumpTexturePass(texturePixel, rayData) {
        const normal = new Vector(0, 1, 0);// rayData.getRayNormalIntersect();
        return normal.add(
            ((texturePixel.r / 255) - 0.5) * 2,
            ((texturePixel.g / 255) - 0.5) * 2,
            ((texturePixel.b / 255) - 0.5) * 2,
        );
    }

    static texturePass(map, material, crossRelativeNormal, normal) {
        // if(!material.texture) return material.copyColor();

        if(normal.x != 0) { // x = z, y = y
            return map.getTexture(material.getTextureSides()).get(
                Math.abs(crossRelativeNormal.z),
                Math.abs(1 - crossRelativeNormal.y),
            );
        }

        if(normal.z != 0) { // x = x, y = y
            return map.getTexture(material.getTextureSides()).get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(1 - crossRelativeNormal.y),
            );
        }

        // x = x, y = z
        if(normal.y < 0) {
            return map.getTexture(material.getTextureTop()).get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(1 - crossRelativeNormal.z),
            );
        }

        return map.getTexture(material.getTextureDown()).get(
            Math.abs(crossRelativeNormal.x),
            Math.abs(1 - crossRelativeNormal.z),
        );
    }
}