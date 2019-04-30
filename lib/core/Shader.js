class Shader {
    constructor() {
    }
    
    static renderRayData(rayData, skySphere, height, width, simple) {
        if(simple) {
            const color = rayData.getTargetMaterial().color.get();
            this.basicPass(color, rayData);
            return color;
        } else {
            const color = this.texturePass(rayData);
            this.reflactionPass(color, rayData, skySphere, height, width);
            if(this.opacityPass(color, rayData)) {
                // if(this.shadowPass(color, rayData)) { 
                //     this.lightPass(color, rayData)
                // };

                this.dynamicLightPass(color, rayData);
            }
            this.distancePass(color, rayData);
            return color;
        }
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
            this.texturePass(nextRayData),
            op * (1 - (distanceIn / 32))
        );

        return false; 
    }

    static basicPass(color, rayData) {
        const angle = (2 * rayData.map.getGlobalLight().direction.get().getInverse().angleTo(rayData.getRayNormalIntersect())) / Math.PI;
        
        color.r *= angle;
        color.g *= angle;
        color.b *= angle;
    }

    static dynamicLightPass(color, rayData) {
        const base = new Color(0,0,0);
        const ambI = rayData.map.getAmbientLight().getIntensity();
        const ambC = rayData.map.getAmbientLight().color.get();
        const globD = rayData.map.getGlobalLight().direction.get().getInverse();
        const normal = rayData.getRayNormalIntersect();

        const pOrigin = rayData.getRayIntersectionPoint();

        if(normal.x) pOrigin.x += globD.x / 100;
        else if(normal.y) pOrigin.y += globD.y / 100;
        else pOrigin.z += globD.z / 100;

        base.blend(ambC, ambI);

        if(!rayData.map.rayTrace(pOrigin, globD, rayData.maxDistance)) {
            base.blend(
                rayData.map.getGlobalLight().color.get(),
                rayData.map.getGlobalLight().getIntensity() * (
                    2 * globD.angleTo(this.calcNormal(rayData))
                ) / Math.PI
            );
        }

        color.multiply(base);
    }

    static lightPass(color, rayData) {
        const lightMask = (new Color(0,0,0));
        const gLight = rayData.map.getGlobalLight();

        lightMask.blend(
            gLight.color.get(),
            gLight.getIntensity() * (2 * gLight.direction.get().getInverse().angleTo(this.calcNormal(rayData))) / Math.PI
        );

        color.set(lightMask.multiply(color));
    }

    static calcNormal(rayData) {
        const normal = rayData.getRayNormalIntersect();

        if(!rayData.getTargetMaterial().haveNormal) return normal;

        normal.inverse();

        const normalMap = this.normalPass(rayData);

        const tanx = ((normalMap.r / 255) * 2) -1;
        const tany = ((normalMap.g / 255) * 2) -1;
        const tanz = ((normalMap.b / 255) * 2) -1;

        if(normal.x) {
            // 0  0 -1
            // 0  1  0
            // 1  0  0
            if(normal.x > 0) return new Vector(-tanz, tany, tanx);
                
            //  0  0  1
            //  0  1  0
            // -1  0  0
            return new Vector(tanz, tany, -tanx);
        }
        
        if(normal.y) {
            //  1  0  0
            //  0  0 -1
            //  0  1  0
            if(normal.y > 0) return new Vector(tanx, -tanz, tany);

            //  1  0  0
            //  0  0  1
            //  0 -1  0
            return new Vector(tanx, tanz, -tany);
        }

        if(normal.z > 0){
            //  1  0  0
            //  0  1  0
            //  0  0  1
            return new Vector(tanx, tany, tanz);
        }

        // -1  0  0
        //  0  1  0
        //  0  0 -1
        return new Vector(-tanx, tany, -tanz);
    }

    static reflactionPass(color, rayData, skySphere, height, width) {
        const specularity = rayData.getTargetMaterial().getSpecular();
        if(!specularity) return;

        if(rayData.getTargetMaterial().haveNormal) {
            const vectorT = rayData.direction.getCopy();
            const origin = rayData.getRayIntersectionPoint();
            origin.y += 1 / 100;

            vectorT.reflect(this.calcNormal(rayData));

            color.set(rayData.getTargetMaterial().color.get());

            if (vectorT.y < 0) vectorT.y = 0;

            const target = rayData.map.rayTrace(origin, vectorT, rayData.maxDistance);
            if(target) {
                const reflectedColor = this.texturePass(target);

                this.dynamicLightPass(reflectedColor, target)

                color.blend(
                    reflectedColor,
                    specularity / 255,
                );
            } else {
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
        if(target) color.blend(this.texturePass(target), specularity / 255);
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
            color.multiply(new Color(0,0,0).blend(rayData.map.getAmbientLight().color.get(), rayData.map.getAmbientLight().getIntensity()));
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

    static texturePass(rayData) {
        const material = rayData.getTargetMaterial();
        if(!material.haveTexture) return material.color.get();
        const normal = rayData.getRayNormalIntersect();
        const intersection = rayData.getRayIntersectionPoint();
        const distance = rayData.getTargetDistance();

        if(normal.x != 0) { // x = z, y = y
            return rayData.map.getTexture(material.getTextureSides()).get(
                intersection.z,
                intersection.y,
                distance
            );
        }

        if(normal.z != 0) { // x = x, y = y
            return rayData.map.getTexture(material.getTextureSides()).get(
                intersection.x,
                intersection.y,
                distance
            );
        }

        if(normal.y < 0) { // x = x, y = z
            return rayData.map.getTexture(material.getTextureTop()).get(
                intersection.x,
                intersection.z,
                distance
            );
        }

        return rayData.map.getTexture(material.getTextureDown()).get(
            intersection.x,
            intersection.z,
            distance
        );
    }

    static normalPass(rayData) {
        const material = rayData.getTargetMaterial();
        const normal = rayData.getRayNormalIntersect();
        const intersection = rayData.getRayIntersectionPoint();
        const distance = rayData.getTargetDistance();

        if(normal.x != 0) { // x = z, y = y
            return rayData.map.getTexture(material.getNormalSides()).get(
                intersection.z,
                intersection.y,
                distance
            );
        }

        if(normal.z != 0) { // x = x, y = y
            return rayData.map.getTexture(material.getNormalSides()).get(
                intersection.x,
                intersection.y,
                distance
            );
        }

        if(normal.y < 0) { // x = x, y = z
            return rayData.map.getTexture(material.getNormalTop()).get(
                intersection.x,
                intersection.z,
                distance
            );
        }

        return rayData.map.getTexture(material.getNormalDown()).get(
            intersection.x,
            intersection.z,
            distance
        );
    }
}