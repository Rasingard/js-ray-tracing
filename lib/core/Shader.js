class Shader {
    constructor() {
    }
    
    static renderRayData(rayData, renderDistance) {
        let color;
        if(SHADER_OFF) return rayData.getTargetMaterial().color.get();

        if(SHADER_TEXTURES) {
            color = Shader.texturePass(
                rayData.getMap(),
                rayData.getTargetMaterial(),
                rayData.getNormalRelativeIntersection(),
                rayData.getRayNormalIntersect(),
                rayData.getTargetDistance(),
            );
        } else {
            color = rayData.getTargetMaterial().color.get()
        }

        if(SHADER_SHADOWN && SHADER_LIGHT) {
            color = Shader.dynamicLightPass(
                color,
                rayData,
            );
        } else if (SHADER_LIGHT) {
            color = Shader.lightPass(
                rayData.getMap(),
                color,
                rayData.getRayNormalIntersect(),
            );
        } else if (SHADER_SHADOWN) {
            color = Shader.shadowPass(
                color,
                rayData
            );
        }

        if(SHADER_ATMOSPHERE_EFFECT) {
            color = Shader.distancePass(
                rayData.getMap(),
                color,
                rayData.getTargetDistance(),
                renderDistance / 2,
                renderDistance
            );
        }

        return color;
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

        if(rayData.map.rayTrace(pOrigin, rayData.map.getGlobalLight().direction.get().getInverse(), RENDER_DISTANCE)) {
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

    static shadowPass(color, rayData) {
        const lightMask = new Color(0,0,0);
        const pOrigin = rayData.getRayIntersectionPoint();
        const rayDirection = rayData.map.getGlobalLight().direction.get().getInverse();

        if(rayData.getRayNormalIntersect().x) pOrigin.x += rayDirection.x / 10;
        else if(rayData.getRayNormalIntersect().y) pOrigin.y += rayDirection.y / 10;
        else pOrigin.z += rayDirection.z / 10;

        if(rayData.map.rayTrace(pOrigin, rayData.map.getGlobalLight().direction.get().getInverse(), RENDER_DISTANCE)) {
            lightMask.blend(rayData.map.getAmbientLight().color.get(), rayData.map.getAmbientLight().getIntensity());
            return color.multiply(lightMask, 1);
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