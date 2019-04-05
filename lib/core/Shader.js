class Shader {
    constructor() {
    }

    
    static renderRayData(rayData, renderDistance) {
        
        return Shader.distancePass(
            rayData.getMap(),
            Shader.dynamicLightPass(
                Shader.texturePass(
                    rayData.getMap(),
                    rayData.getTargetMaterial(),
                    rayData.getNormalRelativeIntersection(),
                    rayData.getRayNormalIntersect(),
                    rayData.getTargetDistance(),
                ),
                rayData,
            ),
            rayData.getTargetDistance(),
            32,
            renderDistance
        );
        
        /*
        return Shader.distancePass(
            rayData.getMap(),
            Shader.lightPass(
                rayData.getMap(),
                Shader.texturePass(
                    rayData.getMap(),
                    rayData.getTargetMaterial(),
                    rayData.getNormalRelativeIntersection(),
                    rayData.getRayNormalIntersect(),
                    rayData.getTargetDistance(),
                ),
                rayData.getRayNormalIntersect(),
            ),
            rayData.getTargetDistance(),
            32,
            renderDistance
        );
        */
    }

    static distancePass(map, color, targetDistance, min, max) {        
        if(targetDistance < min) return color;
        if(targetDistance > max) return map.getAmbientLight().color.get();

        const perc = (targetDistance - min) / (max - min);
        return color.blend(map.getAmbientLight().color.get(), perc);
    }

    static lightPass(map, color, normal) {
        const lightMask = new Color(0,0,0);

        lightMask.blend(map.getAmbientLight().color.get(), map.getAmbientLight().getIntensity());

        const light = map.getGlobalLight();

        lightMask.blend(
            light.color.get(),
            (1 - (2 * light.direction.angleTo(normal)) / Math.PI) * light.getIntensity()
        ); 

        return color.multiply(lightMask, 1);
    }

    static reflaction(color, rayData) {
        const origin = rayData.getRayIntersectionPoint();
        const normal = rayData.getRayNormalIntersect();
        const reflectedVector = rayData.direction.getInverse();

        if(normal.x) {
            origin.x += reflectedVector.x / 10;
        } else if(normal.y) {
            origin.y += reflectedVector.y / 10;
        } else {
            origin.z += reflectedVector.z / 10;
        };

        Quaternion.fromAxisAngle(normal, 180).rotateVector(reflectedVector);

        const targetRayData = rayData.map.rayTrace(origin, reflectedVector, 1000);
        if(targetRayData) {
            return color.blend(targetRayData.getTargetMaterial().color.get(), 0.15);
        } else {
            return color.blend(rayData.map.getGlobalLight().color.get(), 0.15);
        }
    }

    static dynamicLightPass(color, rayData) {
        if(rayData.materialRef === 4) {
            return this.reflaction(color, rayData);
        }

        const lightMask = new Color(0,0,0);
        const pOrigin = rayData.getRayIntersectionPoint();
        const rayDirection = rayData.map.getGlobalLight().direction.get().getInverse();

        if(rayData.getRayNormalIntersect().x) pOrigin.x += rayDirection.x / 10;
        else if(rayData.getRayNormalIntersect().y) pOrigin.y += rayDirection.y / 10;
        else pOrigin.z += rayDirection.z / 10;

        if(rayData.map.rayTrace(pOrigin, rayData.map.getGlobalLight().direction.get().getInverse(), 1000)) {
            lightMask.blend(rayData.map.getAmbientLight().color.get(), rayData.map.getAmbientLight().getIntensity());
            return color.multiply(lightMask, 1);
        } else {
            lightMask.blend(rayData.map.getAmbientLight().color.get(), rayData.map.getAmbientLight().getIntensity());
            const light = rayData.map.getGlobalLight();
            lightMask.blend(
                light.color.get(),
                (1 - (2 * light.direction.angleTo(rayData.getRayNormalIntersect())) / Math.PI) * light.getIntensity()
            ); 
            return color.multiply(lightMask, 1);
        }
    }

    static shadowPass(color, map, rayIntersectionPoint, lightVector) {
        const p2 = rayIntersectionPoint.getCopy();
        p2.y += 1;
        if(map.rayTrace(p2, lightVector.getInverse(), 1000)) {
            return color.blend(new Color(0,0,0), 0.2);
        }

        return color;
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